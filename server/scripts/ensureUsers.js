const pool = require("../db");
const bcrypt = require("bcrypt");

async function ensureUser(email, password, roleName, deptName, yearName = null, name) {
    try {
        // 1. Get Dept ID
        const [drows] = await pool.query("SELECT id FROM departments WHERE name = ?", [deptName]);
        if (!drows.length) {
            console.error(`Dept ${deptName} not found`);
            return;
        }
        const deptId = drows[0].id;

        // 2. Get Role ID
        const [rrows] = await pool.query("SELECT id FROM roles WHERE name = ?", [roleName]);
        if (!rrows.length) {
            console.error(`Role ${roleName} not found`);
            return;
        }
        const roleId = rrows[0].id;

        // 3. Get Year ID (if applicable)
        let yearId = null;
        if (yearName) {
            const [yrows] = await pool.query("SELECT id FROM academic_years WHERE name = ?", [yearName]);
            if (yrows.length) yearId = yrows[0].id;
        }

        // 4. Check if user exists
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            console.log(`User ${email} already exists. Updating password...`);
            const hash = await bcrypt.hash(password, 10);
            await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, existing[0].id]);
        } else {
            // 5. Create User
            const hash = await bcrypt.hash(password, 10);
            await pool.query(
                "INSERT INTO users (email, password_hash, full_name, role_id, department_id, academic_year_id) VALUES (?, ?, ?, ?, ?, ?)",
                [email, hash, name, roleId, deptId, yearId]
            );
            console.log(`Created user: ${email} (${roleName})`);
        }

        // 6. Add to authorized_emails (required for login in some systems or good practice)
        // Check if auth email exists
        // Note: authorized_emails usually requires a specific year. For Admin/Staff who access all years, we might add for all years or specific logic.
        // For simplicity here, we add them for "1st Year" if not present, or loop all years for Admin/Staff.

        const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
        for (const y of years) {
            const [yr] = await pool.query("SELECT id FROM academic_years WHERE name = ?", [y]);
            if (!yr.length) continue;
            const yId = yr[0].id;

            // Only authorize if not already
            const [ae] = await pool.query("SELECT id FROM authorized_emails WHERE email = ? AND department_id = ? AND academic_year_id = ?", [email, deptId, yId]);
            if (ae.length === 0) {
                await pool.query("INSERT INTO authorized_emails (email, department_id, academic_year_id) VALUES (?, ?, ?)", [email, deptId, yId]);
            }
        }

    } catch (err) {
        console.error(`Error ensuring user ${email}:`, err.message);
    }
}

async function run() {
    await ensureUser("admin@cse.local", "Admin@1234", "ADMIN", "BE CSE", null, "System Admin");
    await ensureUser("staff@cse.local", "Staff@1234", "STAFF", "BE CSE", null, "Staff Member");
    await ensureUser("student@cse.local", "Student@1234", "STUDENT", "BE CSE", "1st Year", "Student User");
    process.exit(0);
}

run();
