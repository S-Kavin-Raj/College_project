export const FRONTEND_PERMISSION_MAP = {
  STUDENT: {
    attendance: ["read"],
    assignments: ["view", "submit"],
    syllabus: ["read"],
  },
  CR: {
    attendance: ["mark_fn", "mark_an"],
  },
  STAFF: {
    attendance: ["mark_today", "read"],
    assignments: ["create", "evaluate"],
    syllabus: ["update_status"],
  },
  ADVISOR: {
    attendance: ["approve", "lock", "read"],
    cr: ["manage"],
    syllabus: ["lock", "read"],
    reports: ["view"],
  },
  ADMIN: {
    attendance: ["mark_today", "read"],
    users: ["manage"],
    staff: ["assign"],
    advisor: ["assign"],
    reports: ["view_all"],
    assignments: ["create", "evaluate", "view", "submit"],
    syllabus: ["read", "update_status"],
  },
};
