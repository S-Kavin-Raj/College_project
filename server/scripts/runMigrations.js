const fs = require("fs");
const pool = require("../db");

async function run() {
  try {
    let sql = fs.readFileSync(__dirname + "/../migrations/init.sql", "utf8");
    // Normalize line endings
    sql = sql.replace(/\r/g, "");

    // We'll extract critical statements and execute in dependency order to avoid FK race conditions
    const mysql = require("mysql2/promise");
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      multipleStatements: false,
    });

    function extract(regex) {
      const m = sql.match(regex);
      return m ? m[0].trim() : null;
    }

    // Run CREATE DATABASE first if present
    const createDb = extract(/CREATE\s+DATABASE[\s\S]*?;/i);
    if (createDb) {
      console.log("RUNNING:", createDb.replace(/\n/g, " ").slice(0, 200));
      try {
        await conn.query(createDb);
      } catch (e) {
        console.error("CREATE DATABASE failed:", e.message);
        throw e;
      }
    }

    // Use the database
    try {
      console.log("RUNNING: USE College_Management");
      await conn.query("USE College_Management");
    } catch (e) {
      console.error("USE failed:", e.message);
      throw e;
    }

    // Tables in safe dependency order
    const tableOrder = [
      "departments",
      "academic_years",
      "roles",
      "classes",
      "users",
      "class_roles",
      "attendance",
      "assignments",
      "assignment_submissions",
      "syllabus",
      "syllabus_units",
      "authorized_emails",
    ];

    for (const t of tableOrder) {
      const re = new RegExp(
        "CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+" + t + "[\\s\\S]*?;",
        "i"
      );
      const stmt = extract(re);
      if (stmt) {
        console.log("RUNNING TABLE:", t);
        try {
          await conn.query(stmt);
        } catch (e) {
          console.error(`Table ${t} failed:`, e.message);
          throw e;
        }
      } else {
        console.log(`No statement found for table ${t} (skipping)`);
      }
    }

    // Run indexes
    const idxRe = /CREATE\s+INDEX[\s\S]*?;/gi;
    let idxMatch;
    while ((idxMatch = idxRe.exec(sql)) !== null) {
      const stmt = idxMatch[0];
      console.log("RUNNING INDEX:", stmt.replace(/\n/g, " ").slice(0, 200));
      try {
        await conn.query(stmt);
      } catch (e) {
        if (e.message.includes("Duplicate key")) {
          console.log("Index already exists (skipping)");
        } else {
          console.error("Index failed:", e.message);
          throw e;
        }
      }
    }

    // Run INSERT IGNORE statements
    const insertRe = /INSERT\s+IGNORE[\s\S]*?;/gi;
    let insMatch;
    while ((insMatch = insertRe.exec(sql)) !== null) {
      const stmt = insMatch[0];
      console.log("RUNNING INSERT:", stmt.replace(/\n/g, " ").slice(0, 200));
      try {
        await conn.query(stmt);
      } catch (e) {
        console.error("Insert failed:", e.message);
        throw e;
      }
    }

    await conn.end();

    console.log("Migration completed");
    process.exit(0);
  } catch (err) {
    console.error("Migration error", err.message);
    process.exit(1);
  }
}
run();
