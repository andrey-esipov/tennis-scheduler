const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function formatHour(hour) {
  const period = hour >= 12 ? "pm" : "am";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}${period}`;
}

export function getAvailabilityStatus(court, now = new Date()) {
  const dayKey = dayKeys[now.getDay()];
  const schedule = court.hoursSchedule?.[dayKey];
  if (!schedule) {
    return { label: "See hours", state: "soon" };
  }
  const current = now.getHours() + now.getMinutes() / 60;
  if (current >= schedule.open && current < schedule.close) {
    return { label: "Open Now", state: "open" };
  }
  if (current < schedule.open) {
    return { label: `Opens at ${formatHour(schedule.open)}`, state: "soon" };
  }
  return { label: "Closed", state: "closed" };
}

export function getNextOpenTime(court, now = new Date()) {
  const dayKey = dayKeys[now.getDay()];
  const schedule = court.hoursSchedule?.[dayKey];
  if (!schedule) return "";
  if (now.getHours() < schedule.open) {
    return formatHour(schedule.open);
  }
  return formatHour(schedule.open);
}
