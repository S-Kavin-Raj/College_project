const express = require("express");
const router = express.Router();
const {
  requireRole,
  requirePermission,
  enforceScopeFromBodyOrQuery,
} = require("../middleware/accessControl");

// Helper for Admin Change Request
async function createAdminChangeRequest(
  req,
  table,
  type,
  data,
  recordId = null
) {
  const { department_id, academic_year_id, class_id } = req.body;
  if (!department_id || !academic_year_id) throw new Error("Missing context");

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

// GET /syllabus?class_id=...
router.get(
  "/",
  requirePermission("syllabus", "read"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { class_id } = req.query;
      if (!class_id)
        return res.status(400).json({ error: "class_id required" });

      if (req.session.role === "CR")
        return res.status(403).json({ error: "Access Denied" });

      const [rows] = await req.db.query(
        `SELECT s.id as subject_id, s.subject as name, su.id as unit_id, su.unit_no, su.title as unit_title, su.status 
         FROM syllabus s 
         LEFT JOIN syllabus_units su ON s.id = su.syllabus_id 
         WHERE s.class_id = ? AND s.department_id = ?`,
        [class_id, req.session.department_id]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /syllabus/update
router.post(
  "/update",
  requirePermission("syllabus", "update_status"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { unit_id, status } = req.body; // status: 'COMPLETED' or 'NOT_COMPLETED'
      if (!unit_id || !status)
        return res.status(400).json({ error: "Missing fields" });

      if (req.session.role === "ADMIN") {
        await createAdminChangeRequest(
          req,
          "syllabus",
          "UPDATE",
          { unit_id, status },
          unit_id
        );
        return res.json({
          ok: true,
          message: "Syllabus update request submitted for Advisor review.",
        });
      }

      await req.db.query(
        "UPDATE syllabus_units SET status = ?, last_updated_by = ?, updated_at = NOW() WHERE id = ?",
        [status, req.session.user_id, unit_id]
      );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
