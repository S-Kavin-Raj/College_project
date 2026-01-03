/*
 Middleware helpers to enforce global isolation rules:
 - Enforce department and academic_year bound to session
 - Provide role check helpers
 - Permission checks via single source-of-truth permission map
 - Log violations to audit
*/
const winston = require("winston");
const { logAudit } = require("../utils/audit");
const { roleHasPermission } = require("../config/permissions");

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const role = req.session && req.session.role;
    if (!role) return res.status(403).json({ error: "No role in session" });
    if (!allowedRoles.includes(role)) {
      logger.warn(
        `Access violation: user ${req.session.user_id} with role ${role} attempted ${req.method} ${req.originalUrl}`
      );
      // Audit the attempt
      logAudit(req.db, {
        actor_id: req.session && req.session.user_id,
        action: "unauthorized_role",
        details: { attempted_roles: allowedRoles, role, url: req.originalUrl },
        ip_address:
          req.ip || (req.headers && req.headers["x-forwarded-for"]) || null,
      }).catch(() => { });
      return res.status(403).json({ error: "Insufficient role permission" });
    }
    next();
  };
}

function requirePermission(moduleName, action) {
  return (req, res, next) => {
    const role = req.session && req.session.role;
    if (!role) return res.status(403).json({ error: "No role in session" });

    if (!roleHasPermission(role, moduleName, action)) {
      logger.warn(
        `Permission violation: user ${req.session.user_id} with role ${role} attempted action ${action} on module ${moduleName} for ${req.method} ${req.originalUrl}`
      );
      // Audit the attempt
      logAudit(req.db, {
        actor_id: req.session && req.session.user_id,
        action: "unauthorized_permission",
        details: { module: moduleName, action, role, url: req.originalUrl },
        ip_address:
          req.ip || (req.headers && req.headers["x-forwarded-for"]) || null,
      }).catch(() => { });

      return res
        .status(403)
        .json({ error: "Insufficient permission for requested action" });
    }

    next();
  };
}

function enforceScopeFromBodyOrQuery() {
  return (req, res, next) => {
    // All APIs must be executed within session department + academic year.
    // Normalize numeric scope values to integers for robust comparisons
    const sessionDept = req.session.department_id
      ? parseInt(req.session.department_id, 10)
      : null;
    const sessionYear = req.session.academic_year_id
      ? parseInt(req.session.academic_year_id, 10)
      : null;
    const sessionClass = req.session.class_id
      ? parseInt(req.session.class_id, 10)
      : null;

    // If sessionYear is null (e.g., Admin), allow any academic_year but ensure department matches.
    const bodyDeptRaw = req.body.department_id || req.query.department_id;
    const bodyYearRaw = req.body.academic_year_id || req.query.academic_year_id;
    const bodyClassRaw = req.body.class_id || req.query.class_id;

    const bodyDept = bodyDeptRaw ? parseInt(bodyDeptRaw, 10) : null;
    const bodyYear = bodyYearRaw ? parseInt(bodyYearRaw, 10) : null;
    const bodyClass = bodyClassRaw ? parseInt(bodyClassRaw, 10) : null;

    if (bodyDept && bodyDept !== sessionDept) {
      logger.warn(
        `Cross-department access attempt by user ${req.session.user_id}`
      );
      logAudit(req.db, {
        actor_id: req.session && req.session.user_id,
        action: "cross_department_attempt",
        details: { sessionDept, bodyDept, url: req.originalUrl },
        ip_address:
          req.ip || (req.headers && req.headers["x-forwarded-for"]) || null,
      }).catch(() => { });
      return res.status(403).json({ error: "Cross-department access denied" });
    }

    if (sessionYear && bodyYear && bodyYear !== sessionYear) {
      logger.warn(`Cross-year access attempt by user ${req.session.user_id}`);
      logAudit(req.db, {
        actor_id: req.session && req.session.user_id,
        action: "cross_year_attempt",
        details: { sessionYear, bodyYear, url: req.originalUrl },
        ip_address:
          req.ip || (req.headers && req.headers["x-forwarded-for"]) || null,
      }).catch(() => { });
      return res.status(403).json({ error: "Cross-year access denied" });
    }

    // STRICT CLASS ISOLATION (New)
    // If user is bound to a specific class (Student, CR, Staff), they cannot access other classes.
    // Debugging: log the types and values when a mismatch occurs
    if (sessionClass && bodyClass && bodyClass !== sessionClass) {
      logger.warn(
        `Cross-class access attempt by user ${req.session.user_id} (Role: ${req.session.role})`
      );
      logAudit(req.db, {
        actor_id: req.session && req.session.user_id,
        action: "cross_class_attempt",
        details: { sessionClass, bodyClass, url: req.originalUrl },
        ip_address:
          req.ip || (req.headers && req.headers["x-forwarded-for"]) || null,
      }).catch(() => { });
      return res.status(403).json({
        error: "Access denied. You are restricted to your assigned class.",
      });
    }

    // Force filters to session values if not provided (server-side scoping)
    // Apply to both body and query for consistency across GET/POST
    req.body.department_id = sessionDept;
    req.query.department_id = sessionDept;

    if (sessionYear) {
      req.body.academic_year_id = sessionYear;
      req.query.academic_year_id = sessionYear;
    }

    if (sessionClass) {
      req.body.class_id = sessionClass;
      req.query.class_id = sessionClass;
    }

    next();
  };
}

module.exports = {
  requireRole,
  requirePermission,
  enforceScopeFromBodyOrQuery,
};
