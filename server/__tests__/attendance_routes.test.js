const request = require("supertest");
const app = require("../server");
const { createToken } = require("../middleware/auth");

// Mock DB manager
jest.mock("../config/db_manager", () => ({
  getDBConnection: jest.fn(async (dept) => {
    return {
      query: async (sql, params) => {
        const s = sql.toString();

        // Class lookup
        if (s.includes("SELECT * FROM classes WHERE id = ?")) {
          return [[{ id: params[0], department_id: 2, academic_year_id: 3 }]];
        }

        // Student lookup
        if (
          s.includes(
            "SELECT id, department_id, academic_year_id, class_id FROM users WHERE id = ?"
          )
        ) {
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

        // Insert attendance (returns insertId)
        if (s.startsWith("INSERT INTO attendance")) {
          return [{ insertId: 999 }];
        }

        // Audit insert
        if (s.startsWith("INSERT INTO audit_logs")) {
          return [{ insertId: 2000 }];
        }

        return [[]];
      },
      getConnection: async () => ({
        query: async (sql, params) => {
          // For transactional inserts
          if (sql.startsWith("INSERT INTO attendance"))
            return [{ insertId: 999 }];
          if (sql.startsWith("SELECT id, department_id"))
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

describe("Attendance marking windows", () => {
  beforeAll(() => {
    // Force a deterministic FN window by setting server time and windows
    jest.useFakeTimers("modern");
    // December 28, 2025 10:00 local
    jest.setSystemTime(new Date(2025, 11, 28, 10, 0, 0));
    process.env.FN_CUTOFF_TIME = "11:30";
    process.env.AN_START_TIME = "13:30";
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("CR can mark FN during FN window", async () => {
    const token = createToken({
      user_id: 1,
      role: "CR",
      department_name: "BE CSE",
      department_id: 2,
      academic_year_id: 3,
      class_id: 10,
    });

    // Use date and times such that nowMinutes is within FN window (default: FN before 11:30)
    // We can't control server time easily, but the route uses process.env to set windows; simulate an entry that should be accepted logically

    const res = await request(app)
      .post("/attendance/mark")
      .set("Authorization", `Bearer ${token}`)
      .send({
        class_id: 10,
        entries: [
          {
            student_id: 500,
            date: new Date().toISOString().slice(0, 10),
            fn_status: "P",
            an_status: "NA",
          },
        ],
        department_id: 2,
        academic_year_id: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("CR cannot mark AN during FN window", async () => {
    const token = createToken({
      user_id: 1,
      role: "CR",
      department_name: "BE CSE",
      department_id: 2,
      academic_year_id: 3,
      class_id: 10,
    });

    // Force-time: simulate that current time is in FN window by passing FN-only entry alongside AN to provoke validation
    const res = await request(app)
      .post("/attendance/mark")
      .set("Authorization", `Bearer ${token}`)
      .send({
        class_id: 10,
        entries: [
          {
            student_id: 501,
            date: new Date().toISOString().slice(0, 10),
            fn_status: "NA",
            an_status: "P",
          },
        ],
        department_id: 2,
        academic_year_id: 3,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(
      /CR cannot mark AN attendance during FN window/
    );
  });

  test("CR cannot mark for a different class", async () => {
    const token = createToken({
      user_id: 1,
      role: "CR",
      department_name: "BE CSE",
      department_id: 2,
      academic_year_id: 3,
      class_id: 11,
    });

    const res = await request(app)
      .post("/attendance/mark")
      .set("Authorization", `Bearer ${token}`)
      .send({
        class_id: 10,
        entries: [
          {
            student_id: 501,
            date: new Date().toISOString().slice(0, 10),
            fn_status: "P",
            an_status: "NA",
          },
        ],
        department_id: 2,
        academic_year_id: 3,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(
      "Access denied. You are restricted to your assigned class."
    );
  });
});
