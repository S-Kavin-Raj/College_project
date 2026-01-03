const child_process = require("child_process");
const pool = require("../db");
const bcrypt = require("bcrypt");

async function runMigrations() {
  console.log("Running migrations...");
  const r = child_process.spawnSync("node", [__dirname + "/runMigrations.js"], {
    stdio: "inherit",
  });
  if (r.status !== 0) throw new Error("Migrations failed");
}

async function ensureUser(
  email,
  password,
  roleName,
  deptName,
  yearName = null,
  name
) {
  const [drows] = await pool.query(
    "SELECT id FROM departments WHERE name = ?",
    [deptName]
  );
  if (!drows.length) throw new Error("Dept missing");
  const deptId = drows[0].id;
  const [rrows] = await pool.query("SELECT id FROM roles WHERE name = ?", [
    roleName,
  ]);
  if (!rrows.length) throw new Error("Role missing");
  const roleId = rrows[0].id;
  let yearId = null;
  if (yearName) {
    const [yrows] = await pool.query(
      "SELECT id FROM academic_years WHERE name = ?",
      [yearName]
    );
    if (yrows.length) yearId = yrows[0].id;
  }
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  const pwHash = await bcrypt.hash(password, 12);
  if (existing.length) {
    await pool.query(
      "UPDATE users SET password_hash = ?, full_name = ?, role_id = ?, department_id = ?, academic_year_id = ? WHERE id = ?",
      [pwHash, name, roleId, deptId, yearId, existing[0].id]
    );
    return existing[0].id;
  }
  const res = await pool.query(
    "INSERT INTO users (email,password_hash,full_name,role_id,department_id,academic_year_id) VALUES (?,?,?,?,?,?)",
    [email, pwHash, name, roleId, deptId, yearId]
  );
  return res[0].insertId;
}

async function addAuthorized(email, deptName, yearName = null) {
  const [drows] = await pool.query(
    "SELECT id FROM departments WHERE name = ?",
    [deptName]
  );
  const deptId = drows[0].id;
  let yId = null;
  if (yearName) {
    const [yr] = await pool.query(
      "SELECT id FROM academic_years WHERE name = ?",
      [yearName]
    );
    yId = yr[0].id;
  }
  const [existing] = await pool.query(
    "SELECT id FROM authorized_emails WHERE email = ? AND department_id = ? AND academic_year_id <=> ?",
    [email, deptId, yId]
  );
  if (existing.length) return;
  await pool.query(
    "INSERT INTO authorized_emails (email, department_id, academic_year_id, added_by) VALUES (?, ?, ?, NULL)",
    [email, deptId, yId]
  );
}

async function seed() {
  try {
    await runMigrations();
    // Create per-department Admins, Advisors, Staff, Sample Students
    const depts = [
      "BE CSE",
      "B.Tech AIDS",
      "BE AI-ML",
      "BE EEE",
      "BE ECE",
      "BE CCE",
    ];
    for (const dept of depts) {
      const adminEmail = `admin.${
        dept.split(" ")[1]
          ? dept
              .split(" ")[1]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
          : dept.replace(/\s+/g, "").toLowerCase()
      }@example.local`;
      await ensureUser(
        adminEmail,
        "Admin@1234",
        "ADMIN",
        dept,
        null,
        `HOD ${dept}`
      );
      await addAuthorized(adminEmail, dept, null);

      const advisorEmail = `advisor.${
        dept.split(" ")[1]
          ? dept
              .split(" ")[1]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
          : dept.replace(/\s+/g, "").toLowerCase()
      }@example.local`;
      await ensureUser(
        advisorEmail,
        "Advisor@1234",
        "ADVISOR",
        dept,
        "1st Year",
        `Advisor ${dept}`
      );
      await addAuthorized(advisorEmail, dept, "1st Year");

      const staffEmail = `staff.${
        dept.split(" ")[1]
          ? dept
              .split(" ")[1]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
          : dept.replace(/\s+/g, "").toLowerCase()
      }@example.local`;
      await ensureUser(
        staffEmail,
        "Staff@1234",
        "STAFF",
        dept,
        "2nd Year",
        `Staff ${dept}`
      );
      await addAuthorized(staffEmail, dept, "2nd Year");

      // Add 2 sample students per year
      const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
      for (const y of years) {
        for (let i = 1; i <= 2; i++) {
          const semail = `${
            dept.split(" ")[1]
              ? dept
                  .split(" ")[1]
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "")
              : dept.replace(/\s+/g, "").toLowerCase()
          }.${y.split(" ")[0].toLowerCase()}.student${i}@example.local`;
          await ensureUser(
            semail,
            "Student@1234",
            "STUDENT",
            dept,
            y,
            `Student ${i} ${y} ${dept}`
          );
          await addAuthorized(semail, dept, y);
        }
      }
    }
    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
}

seed();
