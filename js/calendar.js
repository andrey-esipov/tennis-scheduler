import { days, slots } from "./players.js";

export function renderCalendar(container, sessions, onReschedule) {
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  grid.appendChild(document.createElement("div"));
  days.forEach((day) => {
    const header = document.createElement("div");
    header.className = "calendar-cell";
    header.innerHTML = `<header>${day}</header>`;
    grid.appendChild(header);
  });

  slots.forEach((slot) => {
    const slotLabel = document.createElement("div");
    slotLabel.className = "calendar-cell";
    slotLabel.innerHTML = `<header>${slot}</header>`;
    grid.appendChild(slotLabel);

    days.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      cell.dataset.day = day;
      cell.dataset.slot = slot;

      const daySessions = sessions.filter((s) => s.day === day && s.slot === slot);
      daySessions.forEach((session) => {
        const chip = document.createElement("div");
        chip.className = "session-chip";
        chip.textContent = `${session.courtName}`;
        chip.draggable = true;
        chip.dataset.sessionId = session.id;
        chip.style.background = session.color || "#2E7D32";

        chip.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", session.id);
        });
        cell.appendChild(chip);
      });

      cell.addEventListener("dragover", (e) => e.preventDefault());
      cell.addEventListener("drop", (e) => {
        e.preventDefault();
        const sessionId = e.dataTransfer.getData("text/plain");
        onReschedule(sessionId, day, slot);
      });

      grid.appendChild(cell);
    });
  });

  container.appendChild(grid);
}
