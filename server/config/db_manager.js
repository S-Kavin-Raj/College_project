const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

// Department Name -> Database Name Mapping
const DEPT_DB_MAP = {
    "BE CSE": "college_cse_db",
    "BE AI-ML": "college_aiml_db",
    "B.Tech AIDS": "college_aids_db",
    "BE MECH": "college_mech_db",
    "BE ECE": "college_ece_db",
    "BE EEE": "college_eee_db",
    "BE CCE": "college_cce_db",
    // Fallback or System DB if needed, though we aim for total isolation
    "SYSTEM": "College_Management"
};

// Connection Pool Cache
const pools = {};

/**
 * Get a connection pool for a specific department
 * @param {string} departmentName - Full name like "BE CSE"
 * @returns {Promise<mysql.Pool>}
 */
async function getDBConnection(departmentName) {
    const dbName = DEPT_DB_MAP[departmentName];
    if (!dbName) {
        throw new Error(`Unknown department: ${departmentName}`);
    }

    if (!pools[dbName]) {
        // Create new pool
        console.log(`Creating connection pool for [${departmentName}] -> ${dbName}`);
        pools[dbName] = mysql.createPool({
            host: process.env.MYSQL_HOST || "localhost",
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || "root",
            password: process.env.MYSQL_PASSWORD || "", // Ensure .env has this
            database: dbName,
            connectionLimit: 10,
            waitForConnections: true,
            multipleStatements: true // Needed for migrations
        });
    }
    return pools[dbName];
}

/**
 * Get the DB name for a department
 */
function getDBName(departmentName) {
    return DEPT_DB_MAP[departmentName];
}

module.exports = {
    getDBConnection,
    getDBName,
    DEPT_DB_MAP
};
