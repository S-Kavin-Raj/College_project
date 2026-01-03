const { getDBConnection } = require("../config/db_manager");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, "../.env") });

async function seed() {
    try {
        const department = "BE CSE";
        const db = await getDBConnection(department);
        console.log(`Seeding mock data for ${department}...`);

        const password = "password123";
        const pHash = await bcrypt.hash(password, 10);

        // Get Roles
        const [roles] = await db.query("SELECT * FROM roles");
        const roleMap = {};
        roles.forEach(r => roleMap[r.name] = r.id);

        // Get Dept ID
        const [depts] = await db.query("SELECT id FROM departments WHERE name = ?", [department]);
        if (!depts.length) {
            console.error("Department 'BE CSE' not found in database.");
            process.exit(1);
        }
        const deptId = depts[0].id;

        // Get academic years
        const [y3] = await db.query("SELECT id FROM academic_years WHERE name = '3rd Year'");
        const year3Id = y3[0].id;

        // Ensure classes exist
        await db.query("INSERT IGNORE INTO classes (department_id, academic_year_id, class_name) VALUES (?, ?, ?)",
            [deptId, year3Id, "3rd Year CSE-A"]);
        const [classes] = await db.query("SELECT id FROM classes WHERE class_name = '3rd Year CSE-A'");
        const classId = classes[0].id;

        const users = [
            { email: 'admin@cse.com', name: 'CSE Admin', role: 'ADMIN', deptId, yearId: null, classId: null },
            { email: 'staff@cse.com', name: 'CSE Staff', role: 'STAFF', deptId, yearId: year3Id, classId: null },
            { email: 'student@cse.com', name: 'CSE Student', role: 'STUDENT', deptId, yearId: year3Id, classId }
        ];

        for (const u of users) {
            console.log(`Ensuring user: ${u.email} (${u.role})`);

            // Insert into users
            await db.query(`
                INSERT INTO users (email, password_hash, full_name, role_id, department_id, academic_year_id, class_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                password_hash = VALUES(password_hash),
                role_id = VALUES(role_id),
                department_id = VALUES(department_id),
                academic_year_id = VALUES(academic_year_id),
                class_id = VALUES(class_id)
            `, [u.email, pHash, u.name, roleMap[u.role], u.deptId, u.yearId, u.classId]);

            // Insert into authorized_emails
            // For Staff and Student, restrict to year3Id. For Admin, allow department-wide (NULL).
            await db.query(`
                INSERT INTO authorized_emails (email, department_id, academic_year_id, allowed_roles)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                allowed_roles = VALUES(allowed_roles),
                academic_year_id = VALUES(academic_year_id)
            `, [u.email, u.deptId, u.yearId, u.role]);
        }

        console.log("\nMock users created successfully!");
        console.log("-----------------------------------------");
        console.log(`Login Password: ${password}`);
        console.log("-----------------------------------------");
        console.log("Admin:   admin@cse.com    (Dept: BE CSE, Year: Any)");
        console.log("Staff:   staff@cse.com    (Dept: BE CSE, Year: 3rd Year)");
        console.log("Student: student@cse.com  (Dept: BE CSE, Year: 3rd Year)");
        console.log("-----------------------------------------");

        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
