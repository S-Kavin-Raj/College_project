const express = require("express");
const router = express.Router();
const {
  requireRole,
  requirePermission,
  enforceScopeFromBodyOrQuery,
} = require("../middleware/accessControl");

// GET /classes - list classes in scoped department
router.get("/", enforceScopeFromBodyOrQuery(), async (req, res) => {
  try {
    const dept = req.session.department_id;
    const [rows] = await req.db.query(
      "SELECT c.id, d.name as department, y.name as year, c.class_name FROM classes c JOIN departments d ON c.department_id=d.id JOIN academic_years y ON c.academic_year_id=y.id WHERE c.department_id = ?",
      [dept]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /classes/:id/students
router.get(
  "/:id/students",
  enforceScopeFromBodyOrQuery(),
  requirePermission("classes", "view"),
  async (req, res) => {
    try {
      const classId = req.params.id;
      // Ensure class belongs to scope
      const [crows] = await req.db.query("SELECT * FROM classes WHERE id = ?", [
        classId,
      ]);
      if (!crows.length)
        return res.status(404).json({ error: "Class not found" });
      const cls = crows[0];
      if (cls.department_id !== req.session.department_id)
        return res
          .status(403)
          .json({ error: "Cross-department access denied" });
      if (
        req.session.academic_year_id &&
        cls.academic_year_id !== req.session.academic_year_id
      )
        return res.status(403).json({ error: "Cross-year access denied" });

      const [students] = await req.db.query(
        'SELECT id, full_name, email FROM users WHERE class_id = ? AND role_id = (SELECT id FROM roles WHERE name = "STUDENT")',
        [classId]
      );
      res.json(students);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
