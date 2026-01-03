// LEGACY DB MODULE - DO NOT USE
// We have switched to Multi-Tenant architecture.
// Use req.db attached by auth middleware instead.

module.exports = {
  query: () => { throw new Error("LEGACY DB POOL ACCESSED. Use req.db!"); },
  getConnection: () => { throw new Error("LEGACY DB POOL ACCESSED. Use req.db!"); }
};
