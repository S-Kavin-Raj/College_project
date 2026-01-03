/*
  Seed a staff user for a given department.
  Usage: `node seedStaff.js --email staff@cse.local --password Staff@1234 --dept "BE CSE" --name "Staff User"`
*/
const pool = require("../db");
const bcrypt = require("bcrypt");
const argv = require("minimist")(process.argv.slice(2));

async function run() {
    const email = argv.email || "staff@cse.local";
    const password = argv.password || "Staff@1234";
    const dept = argv.dept || "BE CSE";
    const name = argv.name || "Staff User";

    try {
        const [drows] = await pool.query(
            "SELECT id FROM departments WHERE name = ?",
            [dept]
        );
        if (!drows.length)
            throw new Error("Department not found; run migrations first");
        const department_id = drows[0].id;

        const [rrows] = await pool.query("SELECT id FROM roles WHERE name = ?", [
            "STAFF",
        ]);
        const role_id = rrows[0].id;

        // For staff, we might want to assign a default academic year or leave it null.
        // Based on schema, it is nullable. We will leave it null for now as per seedAdmin.js pattern,
        // assuming Staff are not strictly bound to one year at creation or can be updated later.

        const hash = await bcrypt.hash(password, 12);

        // Check if user exists first to avoid duplicate errors if run multiple times
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length === 0) {
            await pool.query(
                "INSERT INTO users (email,password_hash,full_name,role_id,department_id,academic_year_id) VALUES (?,?,?,?,?,NULL)",
                [email, hash, name, role_id, department_id]
            );
            console.log("Staff user seeded:", email);
        } else {
            console.log("Staff user already exists:", email);
        }

        // Now authorize for all years
        const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
        for (const year of years) {
            const [yrows] = await pool.query("SELECT id FROM academic_years WHERE name = ?", [year]);
            if (!yrows.length) continue;
            const yearId = yrows[0].id;

            const [existingAuth] = await pool.query(
                "SELECT id FROM authorized_emails WHERE email = ? AND department_id = ? AND academic_year_id = ?",
                [email, department_id, yearId]
            );

            if (existingAuth.length === 0) {
                await pool.query(
                    "INSERT INTO authorized_emails (email, department_id, academic_year_id, added_by) VALUES (?, ?, ?, NULL)",
                    [email, department_id, yearId]
                );
                console.log(`Authorized ${email} for ${dept} - ${year}`);
            }
        }

        console.log("Staff seeding complete for:", email, "department:", dept);
        process.exit(0);
    } catch (err) {
        console.error("Seed error", err.message);
        process.exit(1);
    }
}
run();
