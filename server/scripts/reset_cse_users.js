const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config();

async function reset() {
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: "college_cse_db"
    });

    try {
        await db.query("DELETE FROM authorized_emails");
        await db.query("DELETE FROM users");
        console.log("Deleted all users/auth emails.");

        const passHash = await bcrypt.hash("admin123", 10);

        // Re-insert Admin
        const [roles] = await db.query("SELECT id FROM roles WHERE name='ADMIN'");
        const [depts] = await db.query("SELECT id FROM departments WHERE name='BE CSE'");

        await db.query(`INSERT INTO users (email, password_hash, full_name, role_id, department_id) 
            VALUES ('admin@cse.com', ?, 'Admin CSE', ?, ?)`,
            [passHash, roles[0].id, depts[0].id]);

        console.log("Inserted Admin.");

        // Re-insert Student
        const [sRoles] = await db.query("SELECT id FROM roles WHERE name='STUDENT'");
        const [years] = await db.query("SELECT id FROM academic_years WHERE name='3rd Year'");
        const [classes] = await db.query("SELECT id FROM classes WHERE class_name='3rd Year BE CSE'");

        await db.query(`INSERT INTO users (email, password_hash, full_name, role_id, department_id, academic_year_id, class_id) 
            VALUES ('student@cse.com', ?, 'Student CSE', ?, ?, ?, ?)`,
            [passHash, sRoles[0].id, depts[0].id, years[0].id, classes[0].id]);

        await db.query(`INSERT INTO authorized_emails (email, department_id, academic_year_id, allowed_roles) VALUES ('student@cse.com', ?, ?, 'STUDENT')`,
            [depts[0].id, years[0].id]);

        console.log("Inserted Student.");

    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
}
reset();
