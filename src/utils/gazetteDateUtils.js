export function resolveGazetteDate(targetDate, gazetteData) {
  const dates = (Array.isArray(gazetteData) ? gazetteData : [])
    .map((d) => d.date)
    .filter(Boolean)
    .sort();

  if (dates.length === 0) return targetDate;
  if (dates.includes(targetDate)) return targetDate;

  const prior = dates.filter((d) => d < targetDate);
  return prior.length > 0 ? prior[prior.length - 1] : dates[0];
}
