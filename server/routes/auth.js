const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { createToken } = require("../middleware/auth");
const { getDBConnection } = require("../config/db_manager");

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    let { email, password, department_id, academic_year_id } = req.body;

    // Basic validation
    if (!email || !password || !department_id) {
      return res
        .status(400)
        .json({ error: "Missing email, password, or department" });
    }

    // MULTI-TENANT LOGIC: "department_id" from frontend is actually the Name string (e.g. "BE CSE")
    const departmentName = department_id;

    // Connect to the specific Department DB
    let db;
    try {
      db = await getDBConnection(departmentName);
    } catch (e) {
      return res.status(400).json({ error: "Invalid Department Selection" });
    }

    // From here on, use `db` (not pool)

    // Fetch user
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "Invalid creds (User not found in this Dept)" });
    }
    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid creds" });

    // Validate Department (Internal ID check)
    // NOTE: dept ID inside the DB might just be 1, but logically it matches because we are in the correct DB.
    // We can verify if user.department_id matches the ID for 'departmentName' in `departments` table if we want extra safety.

    // Get Role Name
    let roleName = await getRoleName(db, user.role_id);

    // CR DETECTION
    if (roleName === "STUDENT") {
      const [crRows] = await db.query(
        "SELECT id FROM class_roles WHERE user_id = ? AND role_id = (SELECT id FROM roles WHERE name = 'CR')",
        [user.id]
      );
      if (crRows.length > 0) {
        roleName = "CR";
      }
    }

    // Role Match Check
    const requested_role = req.body.claimed_role || req.body.role;
    if (requested_role) {
      const reqRoleNorm = requested_role.toUpperCase();
      if (reqRoleNorm !== roleName) {
        return res
          .status(403)
          .json({
            error: `Requested role ${requested_role} does not match assigned role`,
          });
      }
    }

    // Handle Academic Year Logic
    let finalYearId = null;

    if (roleName === "ADMIN") {
      if (academic_year_id) {
        if (isNaN(academic_year_id)) {
          const [yrows] = await db.query(
            "SELECT id FROM academic_years WHERE name = ?",
            [academic_year_id]
          );
          if (yrows && yrows.length > 0) finalYearId = yrows[0].id;
        } else {
          finalYearId = parseInt(academic_year_id, 10);
        }
      }
    } else {
      if (!academic_year_id) {
        return res.status(400).json({ error: "Academic year is required" });
      }

      // Resolve Year
      if (isNaN(academic_year_id)) {
        const [yrows] = await db.query(
          "SELECT id FROM academic_years WHERE name = ?",
          [academic_year_id]
        );
        if (!yrows || yrows.length === 0)
          return res.status(400).json({ error: "Invalid academic year" });
        finalYearId = yrows[0].id;
      } else {
        finalYearId = parseInt(academic_year_id, 10);
      }

      // Validate User's Assigned Year
      if (user.academic_year_id && user.academic_year_id !== finalYearId) {
        return res.status(403).json({ error: "Academic year mismatch" });
      }

      // Check Authorized Emails
      const [authRows] = await db.query(
        "SELECT id FROM authorized_emails WHERE email = ? AND (academic_year_id IS NULL OR academic_year_id = ?)",
        [email, finalYearId]
      );
      if (!authRows || authRows.length === 0) {
        return res.status(403).json({
          error: "Access Denied: Email not authorized.",
        });
      }
    }

    // Generate Token
    const token = createToken({
      user_id: user.id,
      role: roleName,
      department_id: user.department_id,
      department_name: departmentName, // Store Name for DB routing
      academic_year_id: finalYearId,
      class_id: user.class_id,
    });

    return res.json({
      token,
      profile: {
        user_id: user.id,
        role: roleName,
        department_id: user.department_id,
        academic_year_id: finalYearId,
        class_id: user.class_id,
      },
    });
  } catch (err) {
    console.error("FULL LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

async function getRoleName(db, role_id) {
  const [rows] = await db.query("SELECT name FROM roles WHERE id = ?", [
    role_id,
  ]);
  return rows[0] && rows[0].name;
}

module.exports = router;
