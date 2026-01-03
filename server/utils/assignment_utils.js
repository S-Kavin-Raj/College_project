function isLate(dueDateStr, when = new Date()) {
  const due = new Date(dueDateStr);
  return when > due;
}

module.exports = { isLate };
