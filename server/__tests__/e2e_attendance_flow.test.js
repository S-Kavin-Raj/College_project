const request = require("supertest");
const app = require("../server");
const { createToken } = require("../middleware/auth");

// Mock DB manager for E2E flow
jest.mock("../config/db_manager", () => ({
  getDBConnection: jest.fn(async (dept) => {
    return {
      query: async (sql, params) => {
        const s = sql.toString();

        // Login: fetch user by email
        if (s.startsWith("SELECT * FROM users WHERE email = ?")) {
          // return a student who is also CR
          return [
            [
              {
                id: 800,
                password_hash: "$2b$10$dummyhash",
                role_id: 5,
                department_id: 2,
                class_id: 10,
                academic_year_id: 3,
              },
            ],
          ];
        }

        // Role name for role_id
        if (s.startsWith("SELECT name FROM roles WHERE id = ?")) {
          return [[{ name: "STUDENT" }]];
        }

        // class_roles detection for CR
        if (
          s.includes(
            "SELECT id FROM class_roles WHERE user_id = ? AND role_id = (SELECT id FROM roles WHERE name = 'CR')"
          )
        ) {
          return [[{ id: 900 }]];
        }

        // Authorized emails check
        if (s.startsWith("SELECT id FROM authorized_emails")) {
          return [[{ id: 1 }]];
        }

        // Attendance insert via connection will be handled in getConnection below

        // Generic fallthrough
        return [[]];
      },
      getConnection: async () => ({
        query: async (sql, params) => {
          const s = sql.toString();
          if (s.startsWith("INSERT INTO attendance")) {
            return [{ insertId: 4000 }];
          }
          if (s.startsWith("UPDATE attendance")) return [{ affectedRows: 1 }];
          if (s.startsWith("INSERT INTO audit_logs"))
            return [{ insertId: 5000 }];
          if (s.startsWith("SELECT id, department_id")) {
            // student lookup in transaction
            return [
              [
                {
                  id: params[0],
                  department_id: 2,
                  academic_year_id: 3,
                  class_id: 10,
                },
              ],
            ];
          }
          return [[]];
        },
        beginTransaction: async () => {},
        commit: async () => {},
        rollback: async () => {},
        release: () => {},
      }),
    };
  }),
}));

// Mock bcrypt to succeed
jest.mock("bcrypt", () => ({
  compare: jest.fn(async () => true),
  hash: jest.fn(async (s) => "hashed"),
}));

describe("E2E: CR mark → Advisor approve attendance", () => {
  beforeAll(() => {
    // Force the server to be in FN window only (set AN start in the far future)
    process.env.FN_CUTOFF_TIME = "23:59";
    process.env.AN_START_TIME = "23:59";
  });

  test("Full flow: login as CR, mark attendance, advisor approves", async () => {
    // Login as the student (CR)
    const loginRes = await request(app).post("/auth/login").send({
      email: "crstudent@example.com",
      password: "pw",
      department_id: "BE CSE",
      academic_year_id: 3,
    });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeTruthy();
    const attendanceDate = new Date().toISOString().slice(0, 10);

    // CR marks attendance
    const markRes = await request(app)
      .post("/attendance/mark")
      .set("Authorization", `Bearer ${token}`)
      .send({
        class_id: 10,
        entries: [
          {
            student_id: 800,
            date: attendanceDate,
            fn_status: "P",
            an_status: "NA",
          },
        ],
        department_id: 2,
        academic_year_id: 3,
      });

    expect(markRes.status).toBe(200);
    expect(markRes.body.ok).toBe(true);

    // Advisor approves
    const advisorToken = createToken({
      user_id: 30,
      role: "ADVISOR",
      department_name: "BE CSE",
      department_id: 2,
      academic_year_id: 3,
    });

    const approveRes = await request(app)
      .post("/attendance/approve")
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({
        id: 4000,
        action: "APPROVE",
        department_id: 2,
        academic_year_id: 3,
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.ok).toBe(true);
  });

  test("Staff cannot approve attendance (only ADVISOR)", async () => {
    const staffToken = createToken({
      user_id: 40,
      role: "STAFF",
      department_name: "BE CSE",
      department_id: 2,
      academic_year_id: 3,
    });

    const res = await request(app)
      .post("/attendance/approve")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        id: 4001,
        action: "APPROVE",
        department_id: 2,
        academic_year_id: 3,
      });

    expect(res.status).toBe(403);
  });
});
