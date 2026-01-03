const {
  requireRole,
  requirePermission,
  enforceScopeFromBodyOrQuery,
} = require("../middleware/accessControl");

function mockReq(session, body = {}, query = {}) {
  return {
    session,
    body: Object.assign({}, body),
    query: Object.assign({}, query),
  };
}
function mockRes() {
  const res = {};
  res.status = (code) => {
    res._status = code;
    return res;
  };
  res.json = (obj) => {
    res._json = obj;
    return res;
  };
  return res;
}

describe("accessControl middleware", () => {
  test("requireRole blocks wrong role", () => {
    const mw = requireRole(["ADVISOR"]);
    const req = mockReq({ user_id: 1, role: "STUDENT" });
    const res = mockRes();
    let called = false;
    mw(req, res, () => {
      called = true;
    });
    expect(called).toBe(false);
    expect(res._status).toBe(403);
  });

  test("requireRole allows correct role", () => {
    const mw = requireRole(["ADVISOR", "ADMIN"]);
    const req = mockReq({ user_id: 1, role: "ADVISOR" });
    const res = mockRes();
    let called = false;
    mw(req, res, () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  test("enforceScopeFromBodyOrQuery blocks cross-department", () => {
    const req = mockReq(
      { department_id: 2, academic_year_id: 1 },
      { department_id: 3 },
      {}
    );
    const res = mockRes();
    let called = false;
    enforceScopeFromBodyOrQuery()(req, res, () => {
      called = true;
    });
    expect(called).toBe(false);
    expect(res._status).toBe(403);
  });

  test("enforceScopeFromBodyOrQuery blocks cross-year if session has year", () => {
    const req = mockReq(
      { department_id: 2, academic_year_id: 2 },
      { academic_year_id: 3 },
      {}
    );
    const res = mockRes();
    let called = false;
    enforceScopeFromBodyOrQuery()(req, res, () => {
      called = true;
    });
    expect(called).toBe(false);
    expect(res._status).toBe(403);
  });

  test("enforceScopeFromBodyOrQuery sets body values when missing", () => {
    const req = mockReq({ department_id: 5, academic_year_id: 2 }, {}, {});
    const res = mockRes();
    let called = false;
    enforceScopeFromBodyOrQuery()(req, res, () => {
      called = true;
    });
    expect(called).toBe(true);
    expect(req.body.department_id).toBe(5);
    expect(req.body.academic_year_id).toBe(2);
  });

  test("requirePermission blocks unauthorized action", () => {
    const mw = requirePermission("attendance", "approve");
    const req = mockReq({ user_id: 1, role: "STAFF" });
    const res = mockRes();
    let called = false;
    mw(req, res, () => {
      called = true;
    });
    expect(called).toBe(false);
    expect(res._status).toBe(403);
  });

  test("requirePermission allows authorized action", () => {
    const mw = requirePermission("assignments", "submit");
    const req = mockReq({ user_id: 1, role: "STUDENT" });
    const res = mockRes();
    let called = false;
    mw(req, res, () => {
      called = true;
    });
    expect(called).toBe(true);
  });
});
