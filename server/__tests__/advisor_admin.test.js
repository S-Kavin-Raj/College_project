const request = require("supertest");
const app = require("../server");
const { createToken } = require("../middleware/auth");

// Mock DB manager to return controlled query results
jest.mock("../config/db_manager", () => {
  return {
    getDBConnection: jest.fn(async (dept) => {
      return {
        query: async (sql, params) => {
          // Simple query routing
          const s = sql.toString();

          if (s.includes("SELECT * FROM classes WHERE id = ?")) {
            return [[{ id: 10, department_id: 2, academic_year_id: 3 }]];
          }

          if (s.includes("SELECT * FROM users WHERE id = ?")) {
            // return a student by default
            return [
              [
                {
                  id: params[0],
                  department_id: 2,
                  academic_year_id: 3,
                  class_id: 10,
                  role_id: 5,
                },
              ],
            ];
          }

          if (s.includes("SELECT name FROM roles WHERE id = ?")) {
            // role id 5 => STUDENT
            return [[{ name: "STUDENT" }]];
          }

          if (s.includes("SELECT id FROM roles WHERE name = 'CR'")) {
            return [[{ id: 9 }]];
          }

          if (s.includes("SELECT COUNT(*) as cnt FROM class_roles")) {
            return [[{ cnt: 2 }]]; // default less than 4
          }

          if (s.startsWith("INSERT INTO class_roles")) {
            return [{ insertId: 123 }];
          }

          if (s.includes("SELECT id FROM roles WHERE name = 'STAFF'")) {
            return [[{ id: 6 }]];
          }

          if (s.includes("SELECT id FROM roles WHERE name = 'ADVISOR'")) {
            return [[{ id: 7 }]];
          }

          if (s.includes("FROM roles WHERE name")) {
            console.log("MOCK QUERY ROLES", s, params);
            // Return a role id based on param
            const roleParam =
              params && params[0] ? params[0].toString().toUpperCase() : "";
            if (roleParam === "STAFF") return [[{ id: 6 }]];
            if (roleParam === "ADVISOR") return [[{ id: 7 }]];
            if (roleParam === "CR") return [[{ id: 9 }]];
            if (roleParam === "STUDENT") return [[{ id: 5 }]];
            return [[{ id: 6 }]];
          }

          if (s.startsWith("SELECT id FROM academic_years WHERE id = ?")) {
            return [[{ id: params[0] }]];
          }

          if (s.startsWith("SELECT id FROM users WHERE email = ?")) {
            return [[]]; // no existing user
          }

          if (s.startsWith("INSERT INTO users")) {
            return [{ insertId: 55 }];
          }

          if (
            s.includes(
              "SELECT id FROM class_roles WHERE user_id = ? AND role_id = (SELECT id FROM roles WHERE name = 'CR')"
            )
          ) {
            return [[{ id: 200 }]]; // simulate CR exists for login test
          }

          if (s.includes("SELECT * FROM users WHERE email = ?")) {
            // Return a user with password_hash and role_id
            return [
              [
                {
                  id: 500,
                  password_hash: "$2b$10$abcdefghijklmnopqrstuv",
                  role_id: 5,
                  department_id: 2,
                  class_id: 10,
                  academic_year_id: 3,
                },
              ],
            ];
          }

          if (s.includes("SELECT id FROM authorized_emails")) {
            return [[{ id: 1 }]]; // authorized
          }

          return [[]];
        },
      };
    }),
  };
});

// Mock bcrypt compare to always succeed where needed
jest.mock("bcrypt", () => ({
  compare: jest.fn(async () => true),
  hash: jest.fn(async (s) => "hashed"),
}));

describe("Advisor CR management and Admin user flows", () => {
  test("Advisor can assign CR to a student in scope", async () => {
    const token = createToken({
      user_id: 1,
      role: "ADVISOR",
      department_name: "BE CSE",
      department_id: 2,
      academic_year_id: 3,
    });

    const res = await request(app)
      .post("/advisor/cr/assign")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: 500, class_id: 10 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ ok: true }));
  });

  test("Non-advisor cannot assign CR", async () => {
    const token = createToken({
      user_id: 2,
      role: "STAFF",
      department_name: "BE CSE",
      department_id: 2,
      academic_year_id: 3,
    });

    const res = await request(app)
      .post("/advisor/cr/assign")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: 500, class_id: 10 });

    expect(res.status).toBe(403);
  });

  test("Cannot assign non-student as CR", async () => {
    // Mock the roles lookup to return STAFF for this user
    const dbManager = require("../config/db_manager");
    dbManager.getDBConnection.mockImplementationOnce(async () => ({
      query: async (sql, params) => {
        const s = sql.toString();
        if (s.includes("SELECT * FROM classes WHERE id = ?")) {
          return [[{ id: 10, department_id: 2, academic_year_id: 3 }]];
        }
        if (s.includes("SELECT * FROM users WHERE id = ?")) {
          return [
            [
              {
                id: params[0],
                department_id: 2,
                academic_year_id: 3,
                class_id: 10,
                role_id: 6,
              },
            ],
          ]; // role_id 6 -> STAFF
        }
        if (s.includes("SELECT name FROM roles WHERE id = ?")) {
          return [[{ name: "STAFF" }]];
        }
        if (s.includes("SELECT id FROM roles WHERE name = 'CR'")) {
          return [[{ id: 9 }]];
        }
        if (s.includes("SELECT COUNT(*) as cnt FROM class_roles"))
          return [[{ cnt: 0 }]];
        return [[]];
      },
    }));

    const token = createToken({
      user_id: 1,
      role: "ADVISOR",
      department_name: "BE CSE",
      department_id: 2,
      academic_year_id: 3,
    });

    const res = await request(app)
      .post("/advisor/cr/assign")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: 501, class_id: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/CR can only be assigned to a STUDENT/);
  });

  test("Admin can create Staff/Advisor users but not CR", async () => {
    const token = createToken({
      user_id: 1,
      role: "ADMIN",
      department_name: "BE CSE",
      department_id: 2,
    });

    // Create Staff
    const res1 = await request(app)
      .post("/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        role: "STAFF",
        email: "staff@example.com",
        full_name: "Staff A",
        password: "pass",
        academic_year_id: 3,
        department_id: 2,
      });
    console.log("ADMIN CREATE RES1", res1.status, res1.body);
    expect(res1.status).toBe(200);
    expect(res1.body.ok).toBe(true);

    // Cannot create CR via this endpoint
    const res2 = await request(app)
      .post("/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        role: "CR",
        email: "cr@example.com",
        full_name: "CR",
        password: "pass",
        academic_year_id: 3,
        department_id: 2,
      });
    console.log("ADMIN CREATE RES2", res2.status, res2.body);
    expect(res2.status).toBe(400);
  });

  test("CR assignment reflected in login (role becomes CR)", async () => {
    // When login is attempted, the mock returns class_roles entry -> roleName should change to CR
    const res = await request(app).post("/auth/login").send({
      email: "student@example.com",
      password: "pw",
      department_id: "BE CSE",
      academic_year_id: 3,
    });

    console.log("LOGIN RES", res.status, res.body);

    expect(res.status).toBe(200);
    expect(res.body.profile.role).toBe("CR");
  });
});
