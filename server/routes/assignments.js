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

// GET /assignments?class_id=...
router.get(
  "/",
  requirePermission("assignments", "view"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { class_id } = req.query;
      if (!class_id)
        return res.status(400).json({ error: "class_id required" });

      if (req.session.role === "CR")
        return res.status(403).json({ error: "Access Denied" });

      let query = `
        SELECT a.*, 
            (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status IN ('SUBMITTED','LATE','EVALUATED')) as submitted_count,
            (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.marks IS NOT NULL) as evaluated_count,
            (SELECT COUNT(*) FROM users u WHERE u.class_id = a.class_id AND u.role_id = (SELECT id FROM roles WHERE name = 'STUDENT')) as total_students,
            (SELECT status FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.student_id = ?) as my_status,
            (SELECT marks FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.student_id = ?) as my_marks
         FROM assignments a 
         WHERE a.class_id = ? AND a.department_id = ?`;

      const params = [req.session.user_id, req.session.user_id, class_id, req.session.department_id];

      // STAFF FILTER: Only see assignments created by self
      if (req.session.role === 'STAFF') {
        query += " AND a.created_by = ?";
        params.push(req.session.user_id);
      }

      query += " ORDER BY a.due_date DESC";
      const [rows] = await req.db.query(query, params);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /assignments/summary?class_id=...
router.get(
  "/summary",
  requirePermission("assignments", "view"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { class_id } = req.query;
      if (!class_id) return res.status(400).json({ error: "class_id required" });

      const [stats] = await req.db.query(
        `SELECT 
          COUNT(DISTINCT a.id) as total_assignments,
          (SELECT COUNT(*) FROM assignment_submissions s 
           JOIN assignments a2 ON s.assignment_id = a2.id 
           WHERE a2.class_id = ? AND s.status IN ('SUBMITTED', 'LATE', 'EVALUATED')) as total_submitted,
          (SELECT COUNT(*) FROM assignment_submissions s 
           JOIN assignments a2 ON s.assignment_id = a2.id 
           WHERE a2.class_id = ? AND s.status = 'LATE') as total_late,
          ((SELECT COUNT(*) FROM users WHERE class_id = ? AND role_id = (SELECT id FROM roles WHERE name = 'STUDENT')) * 
           (SELECT COUNT(*) FROM assignments WHERE class_id = ?)) - 
          (SELECT COUNT(*) FROM assignment_submissions s 
           JOIN assignments a2 ON s.assignment_id = a2.id 
           WHERE a2.class_id = ?) as total_pending
         FROM assignments a
         WHERE a.class_id = ?`,
        [class_id, class_id, class_id, class_id, class_id, class_id]
      );

      res.json(stats[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /assignments/:id/submissions
router.get(
  "/:id/submissions",
  requirePermission("assignments", "evaluate"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const assignment_id = req.params.id;
      const [rows] = await req.db.query(
        `SELECT u.id as student_id, u.full_name, u.email as roll_no, 
                s.id as submission_id, s.submitted_at, s.status, s.marks, s.feedback as remarks
         FROM users u
         LEFT JOIN assignment_submissions s ON u.id = s.student_id AND s.assignment_id = ?
         WHERE u.class_id = (SELECT class_id FROM assignments WHERE id = ?)
         AND u.role_id = (SELECT id FROM roles WHERE name = 'STUDENT')`,
        [assignment_id, assignment_id]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /assignments/grade
router.post(
  "/grade",
  requirePermission("assignments", "evaluate"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { submission_id, marks, feedback } = req.body;
      if (!submission_id || marks === undefined)
        return res.status(400).json({ error: "Missing fields" });

      await req.db.query(
        "UPDATE assignment_submissions SET marks = ?, feedback = ?, graded_by = ?, graded_at = NOW(), status = 'EVALUATED' WHERE id = ?",
        [marks, feedback, req.session.user_id, submission_id]
      );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /assignments/submit
router.post(
  "/submit",
  requirePermission("assignments", "submit"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { assignment_id } = req.body;
      if (!assignment_id)
        return res.status(400).json({ error: "assignment_id required" });

      const [rows] = await req.db.query(
        "SELECT due_date FROM assignments WHERE id = ?",
        [assignment_id]
      );
      if (!rows.length)
        return res.status(404).json({ error: "Assignment not found" });
      const asg = rows[0];

      const submittedAt = new Date();
      const isLate = submittedAt > new Date(asg.due_date);
      const status = isLate ? "LATE" : "SUBMITTED";

      await req.db.query(
        `INSERT INTO assignment_submissions (assignment_id, student_id, submitted_at, status) VALUES (?,?,?,?) 
         ON DUPLICATE KEY UPDATE submitted_at=VALUES(submitted_at), status=VALUES(status)`,
        [assignment_id, req.session.user_id, submittedAt, status]
      );
      res.json({ ok: true, status });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /assignments/create
router.post(
  "/create",
  requirePermission("assignments", "create"),
  enforceScopeFromBodyOrQuery(),
  async (req, res) => {
    try {
      const { class_id, title, description, due_date, subject, max_marks } = req.body;
      if (!class_id || !title || !due_date)
        return res.status(400).json({ error: "Missing fields" });

      if (req.session.role === "ADMIN") {
        await createAdminChangeRequest(req, "assignments", "INSERT", req.body);
        return res.json({
          ok: true,
          message: "Assignment creation request submitted for Advisor review.",
        });
      }

      if (req.session.role !== "STAFF" && req.session.role !== "ADVISOR") {
        return res.status(403).json({ error: "Only Staff or Advisor can create assignments." });
      }

      // Check if staff manages this class's year and dept
      const [classInfo] = await req.db.query("SELECT * FROM classes WHERE id = ?", [class_id]);
      if (!classInfo.length) return res.status(404).json({ error: "Class not found" });

      const targetClass = classInfo[0];
      if (targetClass.department_id !== req.session.department_id) {
        return res.status(403).json({ error: "Cannot create assignment for other departments." });
      }
      if (req.session.academic_year_id && targetClass.academic_year_id !== req.session.academic_year_id) {
        return res.status(403).json({ error: "Cannot create assignment for other academic years." });
      }

      await req.db.query(
        `INSERT INTO assignments (class_id, title, description, due_date, subject, max_marks, created_by, department_id, academic_year_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          class_id,
          title,
          description,
          due_date,
          subject || "General",
          max_marks || 100,
          req.session.user_id,
          req.session.department_id,
          req.session.academic_year_id,
        ]
      );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
