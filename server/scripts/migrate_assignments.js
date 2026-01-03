const { getDBConnection } = require("../config/db_manager");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function migrate() {
    try {
        const department = "BE CSE";
        const db = await getDBConnection(department);
        console.log(`Running migrations for ${department}...`);

        // Check columns in assignments
        const [cols] = await db.query("SHOW COLUMNS FROM assignments");
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('subject')) {
            console.log("Adding 'subject' column to assignments...");
            await db.query("ALTER TABLE assignments ADD COLUMN subject VARCHAR(255) AFTER due_date");
        }

        if (!colNames.includes('max_marks')) {
            console.log("Adding 'max_marks' column to assignments...");
            await db.query("ALTER TABLE assignments ADD COLUMN max_marks INT DEFAULT 100 AFTER subject");
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
