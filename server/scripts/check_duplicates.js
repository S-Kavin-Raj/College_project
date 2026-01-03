const { getDBConnection } = require("../config/db_manager");

async function checkDuplicates() {
    try {
        const db = await getDBConnection("BE CSE");

        console.log("--- Departments ---");
        const [depts] = await db.query("SELECT * FROM departments");
        console.table(depts);

        console.log("--- Users ---");
        const [users] = await db.query("SELECT id, email, full_name, department_id FROM users");
        console.table(users);

        console.log("--- Authorized Emails ---");
        const [auth] = await db.query("SELECT * FROM authorized_emails");
        console.table(auth);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDuplicates();
