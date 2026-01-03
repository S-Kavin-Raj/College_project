# Deployment checklist — Department Academic Management System (DAMS)

1. Provision a secure MySQL instance (production-grade) and create a database `College_Management`.
2. Create a service account with least privilege for the application.
3. Set environment variables (do not commit them):
   - MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB
   - JWT_SECRET (strong random), JWT_EXPIRES_IN
   - FN_CUTOFF_TIME (e.g., 11:30), AN_START_TIME (e.g., 13:30)
   - NODE_ENV=production
4. Copy `server/.env.example` → `.env` and fill values securely.
5. Run migrations: `cd server && npm run migrate`.
6. Seed initial users for testing: `npm run seed-all` or `npm run seed-admin` as needed.
7. Start the server: `npm run start` (or use process manager like PM2).
8. Setup logging aggregation/watcher and backup schedules for DB.
9. Enforce HTTPS, set up reverse proxy, and enable security headers.
10. Rotate secrets periodically and keep audit logs retention policy in place.

Notes: Never commit credentials or JWT secrets to the repository. Use secrets manager for production.
