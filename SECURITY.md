# Security overview — DAMS

- Authentication: bcrypt for password hashing; JWT for session tokens.
- Authorization: strict RBAC enforced on server side using `requireRole` and `enforceScopeFromBodyOrQuery` middleware.
- Data scoping: every query is filtered by `department_id` and `academic_year_id` (if provided).
- Email whitelist: Only `authorized_emails` entries can log in (admins are exempted by design).
- Admin changes: Admins can request changes that must be approved by Class Advisor (auditable). Admins cannot assign CRs.
- Audit logs: All changes are written to `audit_logs` with actor, action, target, and JSON details.
- DB constraints: Unique class per department+year, max 4 CRs enforced by trigger and validated in code.
- Secrets: Keep `JWT_SECRET` and DB credentials in environment variables or a secrets manager.

Recommendations:

- Use TLS/HTTPS for all endpoints.
- Implement rate-limiting on auth endpoints.
- Monitor audit logs for anomalies and failed RBAC attempts.
