// Audit Util

async function logAudit(db, {
  actor_id = null,
  action,
  target_table = null,
  target_id = null,
  details = null,
  ip_address = null,
}) {
  try {
    if (!db) {
      console.warn("Audit skipped: No DB connection provided");
      return;
    }
    await db.query(
      "INSERT INTO audit_logs (actor_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)",
      [
        actor_id,
        action,
        target_table,
        target_id,
        details ? JSON.stringify(details) : null,
        ip_address,
      ]
    );
  } catch (err) {
    console.error("Failed to write audit log", err.message);
  }
}

module.exports = { logAudit };
