const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { getDBConnection } = require("../config/db_manager");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "replace_me";

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });
}

async function verifyToken(req, res, next) {
  try {
    const authHeader =
      req.headers["authorization"] || (req.cookies && req.cookies["token"]);
    if (!authHeader)
      return res.status(401).json({ error: "Missing authorization token" });

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    const data = jwt.verify(token, JWT_SECRET);

    // Attach session info
    const sessionObj = {
      user_id: data.user_id,
      role: data.role,
      department_id: data.department_id,
      department_name: data.department_name, // CRITICAL for routing
      academic_year_id: data.academic_year_id,
      class_id: data.class_id,
    };
    req.session = sessionObj;
    req.user = sessionObj;

    // MULTI-TENANT DB ATTACHMENT
    if (data.department_name) {
      try {
        req.db = await getDBConnection(data.department_name);
      } catch (dbErr) {
        console.error("DB Connection Failed:", dbErr);
        return res
          .status(500)
          .json({ error: "Database connection failed for this department." });
      }
    } else {
      // Fallback for super-admin or pre-login (should not happen in verifyToken)
      return res.status(403).json({ error: "Token missing department scope." });
    }

    next();
  } catch (err) {
    console.warn("Token verify failed", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { createToken, verifyToken };
