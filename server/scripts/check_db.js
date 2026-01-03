const mysql = require("mysql2/promise");
const { getDBConnection } = require("../config/db_manager");

async function check() {
    try {
        const db = await getDBConnection("BE CSE");
        console.log("Connected to BE CSE DB.");

        const [tables] = await db.query("SHOW TABLES");
        console.log("Tables:", tables.map(RowDataPacket => Object.values(RowDataPacket)[0]));

        const [users] = await db.query("SELECT * FROM users");
        console.log("Users:", users);

        const [depts] = await db.query("SELECT * FROM departments");
        console.log("Departments:", depts);

        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
check();
