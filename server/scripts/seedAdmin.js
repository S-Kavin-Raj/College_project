/*
  Seed an admin user for a given department.
  Usage: `node seedAdmin.js --email admin@cse.example --password secret --dept "BE CSE" --name "Dept Admin"`
*/
const pool = require("../db");
const bcrypt = require("bcrypt");
const argv = require("minimist")(process.argv.slice(2));

async function run() {
  const email = argv.email || "admin@cse.local";
  const password = argv.password || "Admin@1234";
  const dept = argv.dept || "BE CSE";
  const name = argv.name || "Dept Admin";

  try {
    const [drows] = await pool.query(
      "SELECT id FROM departments WHERE name = ?",
      [dept]
    );
    if (!drows.length)
      throw new Error("Department not found; run migrations first");
    const department_id = drows[0].id;
    const [rrows] = await pool.query("SELECT id FROM roles WHERE name = ?", [
      "ADMIN",
    ]);
    const role_id = rrows[0].id;

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO users (email,password_hash,full_name,role_id,department_id) VALUES (?,?,?,?,?)",
      [email, hash, name, role_id, department_id]
    );
    console.log("Admin seeded:", email, "department:", dept);
    process.exit(0);
  } catch (err) {
    console.error("Seed error", err.message);
    process.exit(1);
  }
}
run();
