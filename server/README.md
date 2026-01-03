# Department Academic Management (DAM) - Server

Quick start:

1. Copy `.env.example` to `.env` and set values (MYSQL_PASSWORD = kavin@2006, JWT_SECRET, etc.)
2. Install dependencies: `npm install`
3. Run migrations: `npm run migrate` (creates database and tables)
4. Seed an admin: `npm run seed-admin -- --email admin@cse.local --password Admin@1234 --dept "BE CSE"`
5. Start server: `npm run dev`

Testing:

- Install dev dependencies: `npm install` (in `server` directory)
- Run tests: `npm test`

Seeding:

- To seed a full dev dataset: `npm run seed-all` (creates admin/advisor/staff/students for each department)

Security notes:

- JWT tokens are used; store them in secure HttpOnly cookies in production.
- All API calls are scoped to session department and academic_year on the server side.
- Do not expose DB credentials in source control.
