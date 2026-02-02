import { formatMinutes, getCombinedCommute } from "./commute.js";

export function calculateTotals(sessions) {
  return sessions.reduce(
    (acc, session) => {
      acc.andrey += session.andreyDrive;
      acc.lucas += session.lucasDrive;
      return acc;
    },
    { andrey: 0, lucas: 0 }
  );
}

export function getLastSession(sessions) {
  if (!sessions.length) return null;
  return [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

export function getFairnessSummary(sessions) {
  const totals = calculateTotals(sessions);
  const diff = Math.abs(totals.andrey - totals.lucas);
  const lead = totals.andrey === totals.lucas ? "Even" : totals.andrey > totals.lucas ? "Andrey" : "Lucas";
  return {
    totals,
    diff,
    lead,
    summary: `${formatMinutes(totals.andrey)} vs ${formatMinutes(totals.lucas)} (diff ${formatMinutes(diff)})`,
  };
}

export function recommendCourt({ courts, sessions, weather }) {
  const totals = calculateTotals(sessions);
  const last = getLastSession(sessions);
  const lastDrivenMore = last
    ? last.andreyDrive > last.lucasDrive
      ? "andrey"
      : last.lucasDrive > last.andreyDrive
      ? "lucas"
      : null
    : null;
  const rainy = weather?.forecast?.some((day) => day.chanceOfRain >= 50);

  const scored = courts.map((court) => {
    const projectedAndrey = totals.andrey + court.drive.andrey;
    const projectedLucas = totals.lucas + court.drive.lucas;
    const balanceDiff = Math.abs(projectedAndrey - projectedLucas);
    const combined = getCombinedCommute(court);

    let score = balanceDiff + combined * 0.6;

    if (rainy && !court.indoor) {
      score += 40;
    }

    if (lastDrivenMore) {
      const favored = lastDrivenMore === "andrey" ? court.drive.andrey < court.drive.lucas : court.drive.lucas < court.drive.andrey;
      score += favored ? -8 : 8;
    }

    return { court, score, balanceDiff, combined };
  });

  scored.sort((a, b) => a.score - b.score);
  const best = scored[0];

  const reasons = [];
  if (lastDrivenMore) {
    reasons.push(
      lastDrivenMore === "andrey"
        ? "It’s Andrey’s turn for the shorter drive."
        : "It’s Lucas’s turn for the shorter drive."
    );
  } else {
    reasons.push("Balanced drive times for both players.");
  }
  if (rainy) {
    reasons.push("Rain is likely — indoor courts keep it on track.");
  }
  reasons.push(`Combined commute: ${formatMinutes(best.combined)} total.`);

  return {
    court: best.court,
    reasoning: reasons.join(" "),
  };
}
