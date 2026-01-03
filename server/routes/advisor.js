const express = require("express");
const router = express.Router();
const {
  requireRole,
  enforceScopeFromBodyOrQuery,
} = require("../middleware/accessControl");
const { logAudit } = require("../utils/audit");
// GET /advisor/requests - View pending admin change requests (Advisor Only)
router.get(
  "/requests",
  requireRole(["ADVISOR"]),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const [rows] = await req.db.query(
        "SELECT * FROM admin_change_requests WHERE department_id = ? AND status = 'PENDING' ORDER BY created_at DESC",
        [req.session.department_id]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /advisor/requests/process - Approve or Reject
router.post(
  "/requests/process",
  requireRole(["ADVISOR"]),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { request_id, action, advisor_comment } = req.body; // action: 'APPROVE', 'REJECT'
      if (!request_id || !["APPROVE", "REJECT"].includes(action))
        return res.status(400).json({ error: "Invalid action" });

      const conn = await req.db.getConnection();
      await conn.beginTransaction();

      try {
        // Fetch Request
        const [reqRows] = await conn.query(
          "SELECT * FROM admin_change_requests WHERE id = ?",
          [request_id]
        );
        if (!reqRows.length) throw new Error("Request not found");
        const changeReq = reqRows[0];

        if (changeReq.department_id !== req.session.department_id)
          throw new Error("Cross-department access denied");

        if (action === "REJECT") {
          await conn.query(
            "UPDATE admin_change_requests SET status = 'REJECTED', advisor_comment = ?, reviewed_at = NOW() WHERE id = ?",
            [advisor_comment, request_id]
          );
          try {
            await logAudit(req.db, {
              actor_id: req.session.user_id,
              action: "CHANGE_REQUEST_REJECT",
              target_table: "admin_change_requests",
              target_id: request_id,
              details: { advisor_comment },
              ip_address: req.ip,
            });
          } catch (e) {
            console.warn("Audit failed", e.message);
          }
        } else {
          // EXECUTE THE CHANGE
          const newData = JSON.parse(changeReq.new_data);

          if (changeReq.change_type === "INSERT") {
            if (changeReq.table_name === "attendance") {
              // Logic from attendance.js /mark
              const { class_id, entries, date } = newData;
              // Insert attendance
              for (const e of entries) {
                await conn.query(
                  `INSERT INTO attendance (student_id, class_id, date, fn_status, an_status, day_result, entered_by, department_id, academic_year_id, status)
                     VALUES (?,?,?,?,?,?,?,?,?,'APPROVED') -- Admin changes approved by advisor are APPROVED
                     ON DUPLICATE KEY UPDATE fn_status=VALUES(fn_status), an_status=VALUES(an_status), day_result=VALUES(day_result), status='APPROVED'`,
                  [
                    e.student_id,
                    class_id,
                    date,
                    e.fn_status,
                    e.an_status,
                    e.day_result,
                    changeReq.requested_by,
                    changeReq.department_id,
                    changeReq.academic_year_id,
                  ]
                );
              }
            } else if (changeReq.table_name === "assignments") {
              const { class_id, title, description, due_date } = newData;
              await conn.query(
                `INSERT INTO assignments (class_id, title, description, due_date, created_by, department_id, academic_year_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  class_id,
                  title,
                  description,
                  due_date,
                  changeReq.requested_by,
                  changeReq.department_id,
                  changeReq.academic_year_id,
                ]
              );
            }
            // Add other tables (syllabus) logic here if needed
          } else if (changeReq.change_type === "UPDATE") {
            if (changeReq.table_name === "attendance") {
              const { fn_status, an_status, day_result, edit_reason } = newData;
              await conn.query(
                "UPDATE attendance SET fn_status=?, an_status=?, day_result=?, edit_reason=?, entered_by=?, status='APPROVED' WHERE id=?",
                [
                  fn_status,
                  an_status,
                  day_result,
                  edit_reason,
                  changeReq.requested_by,
                  changeReq.record_id,
                ]
              );
            } else if (changeReq.table_name === "syllabus") {
              const { completed } = newData;
              await conn.query(
                "UPDATE syllabus_units SET completed=?, last_updated_by=?, updated_at=NOW() WHERE id=?",
                [completed, changeReq.requested_by, changeReq.record_id]
              );
            }
          }

          await conn.query(
            "UPDATE admin_change_requests SET status = 'APPROVED', advisor_comment = ?, reviewed_at = NOW() WHERE id = ?",
            [advisor_comment, request_id]
          );
          try {
            await logAudit(req.db, {
              actor_id: req.session.user_id,
              action: "CHANGE_REQUEST_APPROVE",
              target_table: "admin_change_requests",
              target_id: request_id,
              details: { advisor_comment },
              ip_address: req.ip,
            });
          } catch (e) {
            console.warn("Audit failed", e.message);
          }
        }

        await conn.commit();
        conn.release();
        res.json({ ok: true });
      } catch (innerErr) {
        await conn.rollback();
        conn.release();
        throw innerErr;
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /advisor/cr/assign - assign CR to a class (Advisor only)
router.post(
  "/cr/assign",
  requireRole(["ADVISOR"]),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { user_id, class_id } = req.body;
      if (!user_id || !class_id)
        return res.status(400).json({ error: "user_id and class_id required" });

      // Verify class belongs to advisor's department and year (enforceScope middleware ensures dept/year)
      const [classRows] = await req.db.query(
        "SELECT * FROM classes WHERE id = ?",
        [class_id]
      );
      if (!classRows.length)
        return res.status(404).json({ error: "Class not found" });
      const cls = classRows[0];

      // Verify user exists and is in same class/department and is a STUDENT
      const [userRows] = await req.db.query(
        "SELECT * FROM users WHERE id = ?",
        [user_id]
      );
      if (!userRows.length)
        return res.status(404).json({ error: "User not found" });
      const u = userRows[0];

      // Ensure user is a student
      const [roleCheck] = await req.db.query(
        "SELECT name FROM roles WHERE id = ?",
        [u.role_id]
      );
      const roleName = roleCheck && roleCheck.length ? roleCheck[0].name : null;
      if (roleName !== "STUDENT") {
        return res
          .status(400)
          .json({ error: "CR can only be assigned to a STUDENT" });
      }

      if (
        u.department_id !== req.session.department_id ||
        u.academic_year_id !== req.session.academic_year_id ||
        u.class_id !== class_id
      ) {
        return res.status(403).json({ error: "User not in advisor scope" });
      }

      // Get CR role id
      const [crRows] = await req.db.query(
        "SELECT id FROM roles WHERE name = 'CR'"
      );
      if (!crRows.length)
        return res.status(500).json({ error: "CR role missing" });
      const crRoleId = crRows[0].id;

      // Check limit
      const [existing] = await req.db.query(
        "SELECT COUNT(*) as cnt FROM class_roles WHERE class_id = ? AND role_id = ? AND removed_at IS NULL",
        [class_id, crRoleId]
      );
      if (existing[0].cnt >= 4)
        return res.status(400).json({ error: "Max 4 CRs allowed for class" });

      await req.db.query(
        "INSERT INTO class_roles (user_id, class_id, role_id, assigned_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE removed_at = NULL, removed_by = NULL",
        [user_id, class_id, crRoleId, req.session.user_id]
      );
      try {
        await logAudit(req.db, {
          actor_id: req.session.user_id,
          action: "CR_ASSIGN",
          target_table: "class_roles",
          target_id: user_id,
          details: { class_id },
          ip_address: req.ip,
        });
      } catch (e) {
        console.warn("Audit failed", e.message);
      }
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /advisor/cr/remove - remove CR
router.post(
  "/cr/remove",
  requireRole(["ADVISOR"]),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { user_id, class_id } = req.body;
      if (!user_id || !class_id)
        return res.status(400).json({ error: "user_id and class_id required" });

      const [rows] = await req.db.query(
        "SELECT id FROM class_roles WHERE user_id = ? AND class_id = ? AND removed_at IS NULL",
        [user_id, class_id]
      );
      if (!rows.length)
        return res.status(404).json({ error: "CR assignment not found" });

      await req.db.query(
        "UPDATE class_roles SET removed_at = NOW(), removed_by = ? WHERE id = ?",
        [req.session.user_id, rows[0].id]
      );
      try {
        await logAudit(req.db, {
          actor_id: req.session.user_id,
          action: "CR_REMOVE",
          target_table: "class_roles",
          target_id: rows[0].id,
          details: { user_id, class_id },
          ip_address: req.ip,
        });
      } catch (e) {
        console.warn("Audit failed", e.message);
      }
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
