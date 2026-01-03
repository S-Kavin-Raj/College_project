const pool = require("../db");
require('dotenv').config();


async function runSchemaUpdate() {
    try {
        console.log("Adding admin_change_requests table...");
        await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_change_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_name ENUM('attendance', 'assignments', 'syllabus') NOT NULL,
        record_id INT, 
        change_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
        new_data JSON,
        requested_by INT NOT NULL,
        department_id INT NOT NULL,
        academic_year_id INT NOT NULL,
        class_id INT,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        advisor_comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        FOREIGN KEY (requested_by) REFERENCES users(id),
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
      );
    `);

        // Check if index exists usually requires checking information_schema, but CREATE INDEX IF NOT EXISTS is valid in newer MySQL or MariaDB.
        // Standard MySQL doesn't support IF NOT EXISTS for indexes easily. 
        // We'll skip index creation for this simple script logic or wrap in try-catch.
        try {
            await pool.query("CREATE INDEX idx_requests_dept_class ON admin_change_requests(department_id, class_id)");
        } catch (e) {
            if (!e.message.includes("Duplicate key")) console.log("Index creation skipped/failed: " + e.message);
        }

        console.log("Schema update complete.");
        process.exit(0);
    } catch (error) {
        console.error("Schema update failed:", error);
        process.exit(1);
    }
}

runSchemaUpdate();
