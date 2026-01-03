function hmToMinutes(hm) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function nowToMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function isFNWindow(nowMinutes, fnCutoffMin) {
  return nowMinutes <= fnCutoffMin;
}

function isANWindow(nowMinutes, anStartMin) {
  return nowMinutes >= anStartMin;
}

function validateCREntries(
  entries,
  nowMinutes,
  fnCutoffMin,
  anStartMin,
  currentDateStr
) {
  // Returns null if valid, else error message
  for (const e of entries) {
    if (e.date && e.date !== currentDateStr)
      return "CR can only mark attendance for the current date.";
    const fnMarked = e.fn_status && e.fn_status !== "NA";
    const anMarked = e.an_status && e.an_status !== "NA";
    if (fnMarked && anMarked)
      return "CR cannot mark both FN and AN for the same student.";
  }

  const inFN = isFNWindow(nowMinutes, fnCutoffMin);
  const inAN = isANWindow(nowMinutes, anStartMin);
  if (!inFN && !inAN) return "Outside CR attendance marking window.";

  if (inFN) {
    if (entries.some((e) => e.an_status && e.an_status !== "NA"))
      return "CR cannot mark AN attendance during FN window.";
  }
  if (inAN) {
    if (entries.some((e) => e.fn_status && e.fn_status !== "NA"))
      return "CR cannot mark FN attendance during AN window.";
  }

  return null;
}

module.exports = {
  hmToMinutes,
  nowToMinutes,
  isFNWindow,
  isANWindow,
  validateCREntries,
};
