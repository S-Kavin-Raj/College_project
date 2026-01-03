const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");
const adminRoutes = require("./routes/admin"); // New
const { verifyToken } = require("./middleware/auth");

dotenv.config();
const path = require("path");
const app = express();

// Configure Content Security Policy to allow local dev tools and common remote assets
// Keep it permissive enough for development, but explicit about allowed sources
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
  styleSrc: ["'self'", "'unsafe-inline'", "https:"],
  imgSrc: ["'self'", "data:", "https:"],
  fontSrc: ["'self'", "https:", "data:"],
  connectSrc: [
    "'self'",
    "http://localhost:5173",
    "ws://localhost:5173",
    "http://localhost:4000",
    "https:",
  ],
};

// In production you might want to restrict 'https:' to only trusted CDNs and remove unsafe-* entries
if (process.env.NODE_ENV === "production") {
  // more restrictive - no unsafe-inline/eval
  cspDirectives.scriptSrc = ["'self'", "https:"];
  cspDirectives.styleSrc = ["'self'", "https:"];
}

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: cspDirectives,
    },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static frontend assets from repo root `public` directory
const publicDir = path.join(__dirname, "..", "public");
console.log("Serving static files from:", publicDir);
app.use(express.static(publicDir));

app.use("/auth", authRoutes);
// Protected routes
app.use("/attendance", verifyToken, attendanceRoutes);
app.use("/assignments", verifyToken, require("./routes/assignments"));
app.use("/syllabus", verifyToken, require("./routes/syllabus"));
app.use("/advisor", verifyToken, require("./routes/advisor"));
app.use("/classes", verifyToken, require("./routes/classes"));
app.use("/dashboard", verifyToken, require("./routes/dashboard"));
app.use("/admin", adminRoutes); // New

app.get("/", (req, res) => res.json({ status: "DAM Server running" }));

const port = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(port, () => console.log(`Server started on ${port}`));
}

module.exports = app;
