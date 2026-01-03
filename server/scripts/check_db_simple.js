const { getDBConnection } = require("../config/db_manager");

async function check() {
    try {
        const db = await getDBConnection("BE CSE");
        const [users] = await db.query("SELECT id, email, role_id, department_id FROM users");
        console.log("USERS IN BE CSE:");
        console.table(users);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
