const fs = require("fs");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const { DEPT_DB_MAP } = require("../config/db_manager");

dotenv.config();

async function setup() {
    console.log("Starting Multi-Tenant Database Setup...");

    let rootConn;
    try {
        rootConn = await mysql.createConnection({
            host: process.env.MYSQL_HOST || "localhost",
            port: parseInt(process.env.MYSQL_PORT) || 3306,
            user: process.env.MYSQL_USER || "root",
            password: process.env.MYSQL_PASSWORD || "",
            multipleStatements: true,
        });
        console.log("SUCCESS: Connected to MySQL host.");
    } catch (err) {
        console.error("FAILED TO CONNECT TO MYSQL ROOT:", err.message);
        process.exit(1);
    }

    const rawSql = fs.readFileSync(__dirname + "/../migrations/init.sql", "utf8");

    // EXTRACT TRIGGERS (Blocks between DELIMITER $$ and $$)
    const triggerRegex = /DELIMITER\s+\$\$\s*([\s\S]+?)\s*\$\$\s*DELIMITER\s+;/gi;
    const triggers = [];
    let tMatch;
    let sqlClean = rawSql;

    while ((tMatch = triggerRegex.exec(rawSql)) !== null) {
        triggers.push(tMatch[1].trim()); // The CREATE TRIGGER ... END
    }
    // Remove trigger blocks from sqlClean to avoid splitting errors
    sqlClean = sqlClean.replace(triggerRegex, "");

    // Remove USE and CREATE DATABASE
    sqlClean = sqlClean.replace(/USE College_Management;/g, "");
    sqlClean = sqlClean.replace(/CREATE DATABASE IF NOT EXISTS College_Management.*;/g, "");

    // Normalize delimiters to be sure
    sqlClean = sqlClean.replace(/DELIMITER ;/g, "");

    // Split remaining into statements
    const statements = sqlClean.split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const [deptName, dbName] of Object.entries(DEPT_DB_MAP)) {
        if (deptName === "SYSTEM") continue;

        console.log(`\nProcessing: ${deptName} (${dbName})`);

        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

        // Connect to DB
        const dbConn = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: dbName,
            multipleStatements: true,
        });

        try {
            // 1. Run Tables and Inserts
            for (const stmt of statements) {
                // Skip Drop Trigger if it was there (we handle triggers separately)
                if (stmt.toUpperCase().startsWith("DROP TRIGGER")) continue;
                try {
                    await dbConn.query(stmt);
                } catch (err) {
                    // Ignore "Table exists" or "Duplicate entry" warnings to allow re-run
                    if (!err.message.includes("already exists") && !err.message.includes("Duplicate entry")) {
                        console.error(`Error confirming statement: ${stmt.slice(0, 50)}... -> ${err.message}`);
                    }
                }
            }

            // 2. Run Triggers
            for (const trigSql of triggers) {
                // We need to run DROP TRIGGER separate if needed, but INSERT usually handles it? 
                // Better: Extract trigger name and DROP it first.
                const nameMatch = trigSql.match(/TRIGGER\s+(\w+)/i);
                if (nameMatch) {
                    await dbConn.query(`DROP TRIGGER IF EXISTS ${nameMatch[1]}`);
                }
                try {
                    await dbConn.query(trigSql);
                    console.log(`Trigger ${nameMatch ? nameMatch[1] : '?'} created.`);
                } catch (err) {
                    console.error(`Trigger error: ${err.message}`);
                }
            }

            // 3. Seed Local Data
            await dbConn.query(`INSERT IGNORE INTO departments (name) VALUES ('${deptName}')`);

            const deptTag = deptName.split(' ')[1] || 'DEPT';

            // Fetch IDs
            const [rRows] = await dbConn.query("SELECT id FROM roles WHERE name='ADMIN'");
            const [dRows] = await dbConn.query("SELECT id FROM departments WHERE name=?", [deptName]);

            if (rRows.length && dRows.length) {
                const adminRoleId = rRows[0].id;
                const deptId = dRows[0].id;
                const email = `admin@${deptTag.toLowerCase()}.com`;
                const passHash = "$2b$10$MUDrHa9N6Y3RHgYVtW4hcegCmI0UHmdHGQCBf2Z/gIXATFbkqj7.m";

                console.log(`Seeding Admin: ${email}`);
                await dbConn.query(`INSERT INTO users (email, password_hash, full_name, role_id, department_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
                    [email, passHash, `Admin ${deptTag}`, adminRoleId, deptId]);
            }

            // Seed Student
            const [rsRows] = await dbConn.query("SELECT id FROM roles WHERE name='STUDENT'");
            const [yRows] = await dbConn.query("SELECT id FROM academic_years WHERE name='3rd Year'");
            if (rsRows.length && yRows.length && dRows.length) {
                const studentRoleId = rsRows[0].id;
                const yearId = yRows[0].id;
                const deptId = dRows[0].id;
                const className = `3rd Year ${deptName}`;

                // Ensure class
                await dbConn.query(`INSERT IGNORE INTO classes (department_id, academic_year_id, class_name) VALUES (?, ?, ?)`, [deptId, yearId, className]);
                const [cRows] = await dbConn.query("SELECT id FROM classes WHERE class_name=?", [className]);

                if (cRows.length) {
                    const classId = cRows[0].id;
                    const sEmail = `student@${deptTag.toLowerCase()}.com`;
                    console.log(`Seeding Student: ${sEmail}`);
                    await dbConn.query(`INSERT INTO users (email, password_hash, full_name, role_id, department_id, academic_year_id, class_id) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
                        [sEmail, "$2b$10$MUDrHa9N6Y3RHgYVtW4hcegCmI0UHmdHGQCBf2Z/gIXATFbkqj7.m", `Student ${deptTag}`, studentRoleId, deptId, yearId, classId]);

                    // Auth Email
                    await dbConn.query(`INSERT IGNORE INTO authorized_emails (email, department_id, academic_year_id, allowed_roles) VALUES (?, ?, ?, 'STUDENT')`,
                        [sEmail, deptId, yearId]);
                }
            }

        } catch (dbErr) {
            console.error(`Setup Error for ${dbName}: ${dbErr.message}`);
        } finally {
            await dbConn.end();
        }
    }

    await rootConn.end();
    console.log("Done.");
    process.exit(0);
}

setup();
