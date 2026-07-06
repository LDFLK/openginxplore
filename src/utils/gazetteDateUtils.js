export function parseDepartmentHistoryPeriod(period) {
  const [start, end] = period.split(" - ").map((s) => s.trim());
  return {
    startDate: start,
    endDate:
      end === "Present" ? new Date().toISOString().split("T")[0] : end,
  };
}

export function resolveGazetteDateOnOrBefore(targetDate, gazetteData) {
  const dates = (Array.isArray(gazetteData) ? gazetteData : [])
    .map((d) => d.date)
    .filter(Boolean)
    .sort();

  if (dates.length === 0) return targetDate;
  if (dates.includes(targetDate)) return targetDate;

  const prior = dates.filter((d) => d < targetDate);
  return prior.length > 0 ? prior[prior.length - 1] : dates[0];
}

export function resolveGazetteDateOnOrAfter(targetDate, gazetteData) {
  const dates = (Array.isArray(gazetteData) ? gazetteData : [])
    .map((d) => d.date)
    .filter(Boolean)
    .sort();

  if (dates.length === 0) return targetDate;
  if (dates.includes(targetDate)) return targetDate;

  const onOrAfter = dates.find((d) => d >= targetDate);
  return onOrAfter ?? dates[dates.length - 1];
}
