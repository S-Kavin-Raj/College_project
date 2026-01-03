const pool = require("../db");
const argv = require("minimist")(process.argv.slice(2));

/*
  Usage: node scripts/assignCR.js --email student@cse.local --class "3rd Year CSE A"
  Or explicitly: --dept "BE CSE" --year "3rd Year" --section "A"
*/

async function run() {
    const email = argv.email || "student@cse.local"; // Target student
    // For simplicity, we'll fetch user and see their class or assign carefully

    try {
        // 1. Find User
        const [urows] = await pool.query("SELECT id, full_name, role_id, class_id, department_id, academic_year_id FROM users WHERE email = ?", [email]);
        if (!urows.length) throw new Error("User not found");
        const user = urows[0];

        // 2. Verify allowed role (must be STUDENT to become CR, usually)
        // Adjust logic if you allow Staff to be CR (unlikely)
        const [rrows] = await pool.query("SELECT name FROM roles WHERE id = ?", [user.role_id]);
        if (rrows[0].name !== 'STUDENT') {
            console.log(`Warning: User is ${rrows[0].name}, usually CRs are STUDENTS.`);
        }

        // 3. Get Class ID
        // If user already has class_id, use it. Else, require class info.
        let classId = user.class_id;
        if (!classId) {
            throw new Error("User is not assigned to a class yet. Assign class first.");
        }

        // 4. Get CR Role ID
        const [crRows] = await pool.query("SELECT id FROM roles WHERE name = 'CR'");
        if (!crRows.length) throw new Error("CR Role not defined in DB");
        const crRoleId = crRows[0].id;

        // 5. Check Limit (Max 4 CRs per class)
        const [existingCRs] = await pool.query("SELECT count(*) as count FROM class_roles WHERE class_id = ? AND role_id = ?", [classId, crRoleId]);
        if (existingCRs[0].count >= 4) {
            throw new Error("Max 4 CRs limit reached for this class");
        }

        // 6. Assign
        await pool.query(
            "INSERT INTO class_roles (user_id, class_id, role_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=id",
            [user.id, classId, crRoleId]
        );

        console.log(`Successfully assigned ${user.full_name} (${email}) as CR for Class ID ${classId}`);
        process.exit(0);

    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

run();
