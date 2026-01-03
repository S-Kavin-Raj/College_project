/*
Permission map: single source of truth for role -> module -> allowed actions
Use atomic action names (strings) so routes can check for specific behaviour.
*/

const PERMISSION_MAP = {
  STUDENT: {
    attendance: ["read"],
    assignments: ["view", "submit"],
    syllabus: ["read"],
  },
  CR: {
    // CRs can mark attendance for their class (marking is time/window constrained by business logic)
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
    classes: ["view"],
  },
  ADMIN: {
    attendance: ["mark_today", "read"],
    users: ["manage"],
    staff: ["assign"],
    advisor: ["assign"],
    reports: ["view_all"],
    classes: ["view"],
  },
};

function normalizeRole(role) {
  return (role || "").toString().toUpperCase();
}

function roleHasPermission(role, moduleName, action) {
  const rn = normalizeRole(role);
  const rolePerms = PERMISSION_MAP[rn];
  if (!rolePerms) return false;
  const actions = rolePerms[moduleName];
  if (!actions) return false;
  return actions.includes(action);
}

module.exports = { PERMISSION_MAP, roleHasPermission };
