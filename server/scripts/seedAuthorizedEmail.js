const pool = require("../db");

async function run() {
    const email = "admin@cse.local";
    const deptName = "BE CSE";
    const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

    try {
        // Get Departments
        const [drows] = await pool.query("SELECT id FROM departments WHERE name = ?", [deptName]);
        if (!drows.length) throw new Error("Dept not found");
        const deptId = drows[0].id;

        console.log(`Authorizing ${email} for ${deptName} (${deptId})`);

        for (const year of years) {
            const [yrows] = await pool.query("SELECT id FROM academic_years WHERE name = ?", [year]);
            if (!yrows.length) {
                console.log(`Year ${year} not found`);
                continue;
            }
            const yearId = yrows[0].id;

            // Check if exists
            const [existing] = await pool.query(
                "SELECT id FROM authorized_emails WHERE email = ? AND department_id = ? AND academic_year_id = ?",
                [email, deptId, yearId]
            );

            if (existing.length === 0) {
                await pool.query(
                    "INSERT INTO authorized_emails (email, department_id, academic_year_id, added_by) VALUES (?, ?, ?, NULL)",
                    [email, deptId, yearId]
                );
                console.log(`Authorized for ${year}`);
            } else {
                console.log(`Already authorized for ${year}`);
            }
        }

        console.log("Done");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
