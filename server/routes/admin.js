const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

// Middleware to ensure Admin or Advisor
const ensuremanager = (req, res, next) => {
  const role = req.user.role; // 'ADMIN', 'ADVISOR', 'STAFF', 'CR', 'STUDENT'
  if (role === "ADMIN" || role === "ADVISOR") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Managers only." });
  }
};

router.use(verifyToken);
router.use(ensuremanager);

// GET /admin/authorized-emails
router.get("/authorized-emails", async (req, res) => {
  try {
    const { department_id, academic_year_id } = req.user;

    const [rows] = await req.db.query(
      "SELECT id, email, created_at FROM authorized_emails WHERE department_id = ? AND academic_year_id = ? ORDER BY created_at DESC",
      [department_id, academic_year_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /admin/authorized-emails
router.post("/authorized-emails", async (req, res) => {
  try {
    const { email } = req.body;
    const { department_id, academic_year_id, user_id } = req.user;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // Insert
    await req.db.query(
      "INSERT INTO authorized_emails (email, department_id, academic_year_id, added_by) VALUES (?, ?, ?, ?)",
      [email, department_id, academic_year_id, user_id]
    );
    try {
      await logAudit(req.db, {
        actor_id: user_id,
        action: "AUTH_EMAIL_ADD",
        target_table: "authorized_emails",
        details: { email, department_id, academic_year_id },
        ip_address: req.ip,
      });
    } catch (e) {
      console.warn("Audit failed", e.message);
    }
    res.json({ message: "Email authorized successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already authorized" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /admin/users - Create Staff or Advisor (Admin only)
router.post("/users", async (req, res) => {
  try {
    const {
      role,
      email,
      full_name,
      password,
      academic_year_id,
      department_id,
    } = req.body;
    const actor = req.user;

    if (actor.role !== "ADMIN")
      return res.status(403).json({ error: "Admin only" });

    if (!role || !email || !full_name || !password || !academic_year_id)
      return res
        .status(400)
        .json({
          error:
            "role, email, full_name, password and academic_year_id required",
        });

    const roleUpper = role.toString().toUpperCase();
    if (!["STAFF", "ADVISOR"].includes(roleUpper)) {
      return res
        .status(400)
        .json({
          error: "Only STAFF or ADVISOR can be created via this endpoint",
        });
    }

    // Resolve role id
    const [rRows] = await req.db.query("SELECT id FROM roles WHERE name = ?", [
      roleUpper,
    ]);
    if (!rRows || rRows.length === 0)
      return res.status(500).json({ error: "Role not found" });
    const roleId = rRows[0].id;

    // Ensure department and academic year are present and within admin scope
    const deptId = department_id || actor.department_id;
    if (!deptId)
      return res.status(400).json({ error: "department_id required" });

    // Ensure academic_year exists
    const [yRows] = await req.db.query(
      "SELECT id FROM academic_years WHERE id = ?",
      [academic_year_id]
    );
    if (!yRows || yRows.length === 0)
      return res.status(400).json({ error: "Invalid academic_year_id" });

    // Prevent duplicate emails
    const [uRows] = await req.db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (uRows && uRows.length > 0)
      return res
        .status(400)
        .json({ error: "User with this email already exists" });

    const bcrypt = require("bcrypt");
    const hash = await bcrypt.hash(password, 10);

    const [resInsert] = await req.db.query(
      "INSERT INTO users (email, password_hash, full_name, role_id, department_id, academic_year_id) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hash, full_name, roleId, deptId, academic_year_id]
    );

    try {
      await logAudit(req.db, {
        actor_id: actor.user_id,
        action: "USER_CREATE",
        target_table: "users",
        target_id: resInsert.insertId,
        details: {
          role: roleUpper,
          email,
          department_id: deptId,
          academic_year_id,
        },
        ip_address: req.ip,
      });
    } catch (e) {
      console.warn("Audit failed", e.message);
    }

    res.json({ ok: true, id: resInsert.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /admin/users/:id/assign - Assign Staff/Advisor to Department + Academic Year (Admin only)
router.post("/users/:id/assign", async (req, res) => {
  try {
    const userId = req.params.id;
    const { department_id, academic_year_id } = req.body;
    const actor = req.user;

    if (actor.role !== "ADMIN")
      return res.status(403).json({ error: "Admin only" });

    if (!department_id || !academic_year_id)
      return res
        .status(400)
        .json({ error: "department_id and academic_year_id required" });

    // Fetch user and ensure role is STAFF or ADVISOR
    const [uRows] = await req.db.query(
      "SELECT id, role_id FROM users WHERE id = ?",
      [userId]
    );
    if (!uRows || uRows.length === 0)
      return res.status(404).json({ error: "User not found" });
    const user = uRows[0];

    const [roleRow] = await req.db.query(
      "SELECT name FROM roles WHERE id = ?",
      [user.role_id]
    );
    const roleName = roleRow && roleRow.length ? roleRow[0].name : null;
    if (!roleName || !["STAFF", "ADVISOR"].includes(roleName)) {
      return res
        .status(400)
        .json({ error: "User must be STAFF or ADVISOR to be assigned" });
    }

    // Update
    await req.db.query(
      "UPDATE users SET department_id = ?, academic_year_id = ? WHERE id = ?",
      [department_id, academic_year_id, userId]
    );

    try {
      await logAudit(req.db, {
        actor_id: actor.user_id,
        action: "USER_ASSIGN",
        target_table: "users",
        target_id: userId,
        details: { department_id, academic_year_id },
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
});

// DELETE /admin/authorized-emails/:id
router.delete("/authorized-emails/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { department_id, academic_year_id } = req.user;

    // Ensure we only delete from our scope
    const [result] = await req.db.query(
      "DELETE FROM authorized_emails WHERE id = ? AND department_id = ? AND academic_year_id = ?",
      [id, department_id, academic_year_id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Email not found or access denied" });
    }
    try {
      await logAudit(req.db, {
        actor_id: req.user.user_id,
        action: "AUTH_EMAIL_REMOVE",
        target_table: "authorized_emails",
        target_id: id,
        details: null,
        ip_address: req.ip,
      });
    } catch (e) {
      console.warn("Audit failed", e.message);
    }
    res.json({ message: "Email removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
