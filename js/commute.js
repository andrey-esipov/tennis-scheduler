export function formatMinutes(minutes) {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  }
  return `${minutes}m`;
}

export function getCombinedCommute(court) {
  return court.drive.andrey + court.drive.lucas;
}

export function getDriveDifference(court) {
  return Math.abs(court.drive.andrey - court.drive.lucas);
}
