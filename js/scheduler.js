import { days, slots } from "./players.js";
import { courts } from "./courts.js";

const driveTimes = {
  franklin: { franklin: 5, murfreesboro: 30, smyrna: 20 },
  murfreesboro: { franklin: 30, murfreesboro: 5, smyrna: 15 },
};

export function getDriveTime(playerLocation, courtLocation) {
  const base = driveTimes[playerLocation] || {};
  return base[courtLocation] || 25;
}

function eveningBonus(dayIndex, slotIndex) {
  const isWeekday = dayIndex < 5;
  const isEvening = slotIndex >= 5;
  return isWeekday && isEvening ? 8 : 0;
}

export function weatherRisk(dayIndex, slotIndex, isOutdoor) {
  if (!isOutdoor) return false;
  return (dayIndex === 2 || dayIndex === 4) && slotIndex >= 5;
}

export function buildSuggestions(players, preferences) {
  const [p1, p2] = players;
  const suggestions = [];

  days.forEach((day, dayIndex) => {
    slots.forEach((slot, slotIndex) => {
      const available = p1.availability?.[day]?.[slot] && p2.availability?.[day]?.[slot];
      if (!available) return;

      courts.forEach((court) => {
        if (!preferences[court.surface.toLowerCase()]) return;
        if (!preferences[court.type.toLowerCase()]) return;

        const drive1 = getDriveTime("franklin", court.locationCategory);
        const drive2 = getDriveTime("murfreesboro", court.locationCategory);
        const totalCommute = drive1 + drive2;
        const fairness = Math.abs(drive1 - drive2);
        const qualityScore = court.rating * 6;
        const timeBonus = eveningBonus(dayIndex, slotIndex);
        const score = 100 - totalCommute - fairness + qualityScore + timeBonus;

        suggestions.push({
          id: `${dayIndex}-${slotIndex}-${court.id}`,
          day,
          slot,
          dayIndex,
          slotIndex,
          court,
          drive1,
          drive2,
          totalCommute,
          fairness,
          score,
          reason: buildReason(totalCommute, fairness, court.rating),
          weatherRisk: weatherRisk(dayIndex, slotIndex, court.type === "Outdoor")
        });
      });
    });
  });

  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

function buildReason(totalCommute, fairness, rating) {
  if (fairness <= 5 && rating >= 4.6) return "Best balance of commute and quality";
  if (totalCommute <= 40) return "Shortest total drive time";
  if (rating >= 4.7) return "Top-rated courts";
  return "Great overall balance";
}
