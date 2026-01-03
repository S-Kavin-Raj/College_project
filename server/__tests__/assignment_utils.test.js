const { isLate } = require("../utils/assignment_utils");

describe("assignment_utils", () => {
  test("isLate returns false when on time", () => {
    expect(
      isLate("2050-01-01T12:00:00Z", new Date("2050-01-01T11:00:00Z"))
    ).toBe(false);
  });
  test("isLate returns true when after due", () => {
    expect(
      isLate("2020-01-01T12:00:00Z", new Date("2020-01-01T13:00:00Z"))
    ).toBe(true);
  });
});
