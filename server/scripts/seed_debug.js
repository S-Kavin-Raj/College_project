const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const { DEPT_DB_MAP } = require("../config/db_manager");

dotenv.config();

async function seed() {
    const dbName = "college_cse_db"; // Focus on CSE
    const deptName = "BE CSE";

    console.log(`Seeding ${dbName}...`);
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: dbName
    });

    try {
        // Check roles
        const [roles] = await db.query("SELECT * FROM roles");
        console.log("Roles:", roles);

        // Check depts
        const [depts] = await db.query("SELECT * FROM departments");
        console.log("Depts:", depts);

        const adminRoleId = roles.find(r => r.name === 'ADMIN')?.id;
        const deptId = depts.find(d => d.name === 'BE CSE')?.id;

        console.log(`IDs: Role=${adminRoleId}, Dept=${deptId}`);

        if (!adminRoleId || !deptId) throw new Error("Missing IDs");

        const email = "admin@cse.com";
        const passHash = "$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/M.7B5.u.wY2e.MB.";

        console.log("Inserting Admin...");
        await db.query(`
            INSERT INTO users (email, password_hash, full_name, role_id, department_id)
            VALUES (?, ?, ?, ?, ?)
        `, [email, passHash, "Admin CSE", adminRoleId, deptId]);
        console.log("Admin Inserted.");

        // Student
        const studentRoleId = roles.find(r => r.name === 'STUDENT')?.id;
        const [years] = await db.query("SELECT * FROM academic_years");
        const yearId = years.find(y => y.name === '3rd Year')?.id;

        console.log(`Student Role=${studentRoleId}, Year=${yearId}`);

        // Class
        // Check if class exists
        const className = "3rd Year BE CSE";
        let [classes] = await db.query("SELECT * FROM classes WHERE class_name=?", [className]);
        let classId;
        if (classes.length === 0) {
            console.log("Creating Class...");
            const [res] = await db.query("INSERT INTO classes (department_id, academic_year_id, class_name) VALUES (?, ?, ?)", [deptId, yearId, className]);
            classId = res.insertId;
        } else {
            classId = classes[0].id;
        }
        console.log("Class ID:", classId);

        console.log("Inserting Student...");
        await db.query(`
            INSERT INTO users (email, password_hash, full_name, role_id, department_id, academic_year_id, class_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ["student@cse.com", passHash, "Student CSE", studentRoleId, deptId, yearId, classId]);
        console.log("Student Inserted.");

        // Auth email
        await db.query(`INSERT IGNORE INTO authorized_emails (email, department_id, academic_year_id, allowed_roles) VALUES (?, ?, ?, 'STUDENT')`,
            ["student@cse.com", deptId, yearId]);

    } catch (e) {
        console.error("SEED ERROR:", e.message);
    } finally {
        await db.end();
    }
}
seed();
