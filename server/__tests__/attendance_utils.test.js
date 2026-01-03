const { hmToMinutes, validateCREntries } = require("../utils/attendance_utils");

describe("attendance_utils", () => {
  test("hmToMinutes converts correctly", () => {
    expect(hmToMinutes("00:00")).toBe(0);
    expect(hmToMinutes("11:30")).toBe(690);
    expect(hmToMinutes("13:45")).toBe(825);
  });

  test("validateCREntries rejects future/past dates", () => {
    const today = "2025-12-28";
    const entries = [
      { student_id: 1, date: "2025-12-27", fn_status: "P", an_status: "NA" },
    ];
    const now = 600; // 10:00
    expect(validateCREntries(entries, now, 690, 810, today)).toMatch(
      /current date/
    );
  });

  test("validateCREntries rejects marking both FN and AN", () => {
    const today = "2025-12-28";
    const entries = [
      { student_id: 1, date: today, fn_status: "P", an_status: "A" },
    ];
    const now = 600; // 10:00
    expect(validateCREntries(entries, now, 690, 810, today)).toMatch(
      /both FN and AN/
    );
  });

  test("validateCREntries rejects outside window", () => {
    const today = "2025-12-28";
    const entries = [
      { student_id: 1, date: today, fn_status: "NA", an_status: "P" },
    ];
    const now = 750; // 12:30 between windows
    expect(validateCREntries(entries, now, 690, 810, today)).toMatch(
      /Outside CR attendance marking window/
    );
  });

  test("validateCREntries forbids AN during FN", () => {
    const today = "2025-12-28";
    const entries = [
      { student_id: 1, date: today, fn_status: "NA", an_status: "P" },
    ];
    const now = 600; // 10:00 FN window
    expect(validateCREntries(entries, now, 690, 810, today)).toMatch(
      /CR cannot mark AN attendance during FN window/
    );
  });

  test("validateCREntries forbids FN during AN", () => {
    const today = "2025-12-28";
    const entries = [
      { student_id: 1, date: today, fn_status: "P", an_status: "NA" },
    ];
    const now = 900; // 15:00 AN window
    expect(validateCREntries(entries, now, 690, 810, today)).toMatch(
      /CR cannot mark FN attendance during AN window/
    );
  });

  test("validateCREntries allows valid FN entries", () => {
    const today = "2025-12-28";
    const entries = [
      { student_id: 1, date: today, fn_status: "P", an_status: "NA" },
    ];
    const now = 600; // 10:00 FN window
    expect(validateCREntries(entries, now, 690, 810, today)).toBeNull();
  });

  test("validateCREntries allows valid AN entries", () => {
    const today = "2025-12-28";
    const entries = [
      { student_id: 1, date: today, fn_status: "NA", an_status: "P" },
    ];
    const now = 900; // 15:00 AN window
    expect(validateCREntries(entries, now, 690, 810, today)).toBeNull();
  });
});
