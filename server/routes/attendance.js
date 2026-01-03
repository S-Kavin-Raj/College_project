const express = require("express");
const router = express.Router();
const {
  requireRole,
  requirePermission,
  enforceScopeFromBodyOrQuery,
} = require("../middleware/accessControl");

const { logAudit } = require("../utils/audit");

// Helper to create Admin Change Request
async function createAdminChangeRequest(
  req,
  table,
  type,
  data,
  recordId = null
) {
  const { department_id, academic_year_id, class_id } = req.body;
  if (!department_id || !academic_year_id)
    throw new Error("Missing context for Change Request");

  await req.db.query(
    `INSERT INTO admin_change_requests 
    (table_name, record_id, change_type, new_data, requested_by, department_id, academic_year_id, class_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      table,
      recordId,
      type,
      JSON.stringify(data),
      req.session.user_id,
      department_id,
      academic_year_id,
      class_id || null,
    ]
  );
}

const calculateDayResult = (fn, an) => {
  if (fn === "PRESENT" && an === "PRESENT") return "FULL_DAY";
  if (fn === "ABSENT" && an === "ABSENT") return "ABSENT";
  return "HALF_DAY";
};

// POST /attendance/mark
router.post(
  "/mark",
  requireRole(["STAFF", "CR", "ADMIN"]),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { class_id, entries } = req.body;
      if (!class_id || !Array.isArray(entries) || entries.length === 0)
        return res.status(400).json({ error: "Invalid payload" });

      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);

      // ADMIN INTERCEPT: Create Change Request
      if (req.session.role === "ADMIN") {
        await createAdminChangeRequest(req, "attendance", "INSERT", {
          class_id,
          entries,
          date: dateStr,
        });
        return res.json({
          ok: true,
          message: "Attendance change request submitted for Advisor review.",
        });
      }

      // CR/STAFF CUTOFF CHECK
      const nowMinutes = today.getHours() * 60 + today.getMinutes();
      const { hmToMinutes, validateCREntries } = require("../utils/attendance_utils");
      const fnCutoff = process.env.FN_CUTOFF_TIME || "11:30";
      const anStart = process.env.AN_START_TIME || "13:30";
      const fnCutoffMin = hmToMinutes(fnCutoff);
      const anStartMin = hmToMinutes(anStart);

      if (req.session.role === "CR") {
        if (req.session.class_id && parseInt(class_id) !== req.session.class_id) {
          return res.status(403).json({ error: "CR can only mark for their own class." });
        }
        const err = validateCREntries(entries, nowMinutes, fnCutoffMin, anStartMin, dateStr);
        if (err) return res.status(403).json({ error: err });
      }

      const conn = await req.db.getConnection();
      await conn.beginTransaction();
      try {
        for (const e of entries) {
          const dayResult = calculateDayResult(e.fn_status, e.an_status);
          await conn.query(
            `INSERT INTO attendance (student_id, class_id, date, fn_status, an_status, day_result, entered_by, department_id, academic_year_id)
             VALUES (?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE 
               fn_status = VALUES(fn_status), 
               an_status = VALUES(an_status), 
               day_result = VALUES(day_result), 
               entered_by = VALUES(entered_by), 
               status='PENDING'`,
            [
              e.student_id, class_id, dateStr,
              e.fn_status, e.an_status, dayResult,
              req.session.user_id, req.session.department_id, req.session.academic_year_id
            ]
          );
        }
        await conn.commit();
        conn.release();
        return res.json({ ok: true });
      } catch (innerErr) {
        await conn.rollback();
        conn.release();
        throw innerErr;
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /attendance/semester?class_id=...
router.get(
  "/semester",
  requirePermission("attendance", "read"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { class_id, date } = req.query;
      if (!class_id) return res.status(400).json({ error: "class_id required" });

      let query = "SELECT * FROM attendance WHERE class_id = ? AND department_id = ?";
      const params = [class_id, req.session.department_id];

      if (date) {
        query += " AND date = ?";
        params.push(date);
      }

      if (req.session.role === "STUDENT") {
        query += " AND student_id = ?";
        params.push(req.session.user_id);
      } else if (req.session.role === "CR") {
        query += " AND date = CURDATE()";
      } else if (req.session.role === "STAFF") {
        query += " AND date = CURDATE()";
      }

      if (req.session.academic_year_id) {
        query += " AND academic_year_id = ?";
        params.push(req.session.academic_year_id);
      }

      query += " ORDER BY date";
      const [rows] = await req.db.query(query, params);
      return res.json({ attendance: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

// Other endpoints (approve, edit) simplified for brevity but maintaining scope logic from previous file
router.put("/edit", requirePermission("attendance", "approve"), enforceScopeFromBodyOrQuery(), async (req, res) => {
  const { id, fn_status, an_status, edit_reason } = req.body;
  const dayResult = calculateDayResult(fn_status, an_status);
  await req.db.query(
    "UPDATE attendance SET fn_status=?, an_status=?, day_result=?, edit_reason=?, entered_by=? WHERE id=?",
    [fn_status, an_status, dayResult, edit_reason, req.session.user_id, id]
  );
  res.json({ ok: true });
});

router.post("/approve", requirePermission("attendance", "approve"), enforceScopeFromBodyOrQuery(), async (req, res) => {
  const { id, action } = req.body; // APPROVE / LOCK
  const status = action === "APPROVE" ? "APPROVED" : "LOCKED";
  await req.db.query("UPDATE attendance SET status=?, approved_by=? WHERE id=?", [status, req.session.user_id, id]);
  res.json({ ok: true });
});

module.exports = router;
