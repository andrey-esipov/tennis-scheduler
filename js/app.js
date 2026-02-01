import { defaultPlayers, days, slots } from "./players.js";
import { courts } from "./courts.js";
import { loadState, saveState } from "./storage.js";
import { buildSuggestions } from "./scheduler.js";
import { renderCalendar } from "./calendar.js";
import { renderAvailabilityHeatmap, renderCommuteChart, renderHistoryChart } from "./charts.js";

const state = loadState() || {
  players: defaultPlayers.map((p) => ({
    ...p,
    availability: defaultAvailability()
  })),
  sessions: [],
  history: [],
  weekView: "this"
};

function defaultAvailability() {
  const map = {};
  days.forEach((day) => {
    map[day] = {};
    slots.forEach((slot) => {
      map[day][slot] = day === "Sat" && slot === "8-10 AM";
    });
  });
  return map;
}

function save() {
  saveState(state);
}

function renderPlayers() {
  const container = document.getElementById("players");
  container.innerHTML = "";
  state.players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "card player-card";
    card.innerHTML = `
      <div class="badge">${player.location}</div>
      <div class="player-header">
        <img src="${player.avatar}" alt="${player.name}" />
        <div>
          <h3>${player.name}</h3>
          <div class="meta">Skill level: <strong>${player.skill}</strong></div>
        </div>
      </div>
      <div>
        <label>Skill level</label>
        <input type="range" min="1" max="10" value="${player.skill}" data-skill="${player.id}" />
      </div>
      <div class="preference-row">
        ${["indoor", "outdoor", "clay", "hard"].map((pref) => `
          <label><input type="checkbox" data-pref="${pref}" data-player="${player.id}" ${player.preferences[pref] ? "checked" : ""}> ${pref}</label>
        `).join("")}
      </div>
      <div class="availability-grid" data-player="${player.id}"></div>
    `;

    const grid = card.querySelector(".availability-grid");
    days.forEach((day) => {
      slots.forEach((slot) => {
        const btn = document.createElement("button");
        btn.textContent = day.slice(0, 1) + slot.split(" ")[0];
        btn.className = player.availability[day][slot] ? "active" : "";
        btn.addEventListener("click", () => {
          player.availability[day][slot] = !player.availability[day][slot];
          save();
          render();
        });
        grid.appendChild(btn);
      });
    });

    card.querySelectorAll("input[type=range]").forEach((input) => {
      input.addEventListener("input", (e) => {
        player.skill = Number(e.target.value);
        save();
        render();
      });
    });

    card.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const pref = e.target.dataset.pref;
        player.preferences[pref] = e.target.checked;
        save();
        render();
      });
    });

    container.appendChild(card);
  });
}

function renderCourts() {
  const container = document.getElementById("courts");
  container.innerHTML = "";
  const filter = {
    indoor: document.getElementById("filterIndoor").checked,
    outdoor: document.getElementById("filterOutdoor").checked,
    clay: document.getElementById("filterClay").checked,
    hard: document.getElementById("filterHard").checked,
  };

  courts.filter((court) => filter[court.type.toLowerCase()] && filter[court.surface.toLowerCase()])
    .forEach((court) => {
      const card = document.createElement("div");
      card.className = "card court-card";
      card.innerHTML = `
        <div class="title-row">
          <h3>${court.name}</h3>
          <span class="tag">${court.rating} ★</span>
        </div>
        <p class="meta">${court.address}</p>
        <div class="tags">
          <span class="tag">${court.type}</span>
          <span class="tag">${court.surface}</span>
          <span class="tag">${court.courts} courts</span>
        </div>
        <p class="meta">Busy times: ${court.busyTimes}</p>
        <div class="tags">
          ${court.amenities.map((a) => `<span class="tag">${a}</span>`).join("")}
        </div>
        <a class="btn ghost" href="${court.bookingUrl}" target="_blank">Booking info</a>
      `;
      container.appendChild(card);
    });
}

function renderSuggestions() {
  const suggestions = buildSuggestions(state.players, mergePreferences());
  const container = document.getElementById("suggestions");
  container.innerHTML = "";

  suggestions.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "suggestion-card";
    card.innerHTML = `
      ${i === 0 ? '<div class="match-week">Match of the Week</div>' : ""}
      <h3>${s.day} · ${s.slot}</h3>
      <p><strong>${s.court.name}</strong> · ${s.court.type} ${s.court.surface}</p>
      <p class="meta">Drive: Andrey ${s.drive1}m · Alex ${s.drive2}m</p>
      <p class="meta">${s.reason}</p>
      ${s.weatherRisk ? '<p class="meta">⚠️ Possible rain for outdoor court</p>' : ""}
      <button class="btn primary" data-add="${s.id}">Add to calendar</button>
    `;
    card.querySelector("button").addEventListener("click", () => addSession(s));
    container.appendChild(card);
  });

  renderAvailabilityHeatmap(document.getElementById("availabilityHeatmap"), state.players);
}

function mergePreferences() {
  return ["indoor", "outdoor", "clay", "hard"].reduce((acc, key) => {
    acc[key] = state.players.every((p) => p.preferences[key]);
    return acc;
  }, {});
}

function addSession(suggestion) {
  state.sessions.push({
    id: `session-${Date.now()}`,
    day: suggestion.day,
    slot: suggestion.slot,
    courtName: suggestion.court.name,
    color: suggestion.court.type === "Indoor" ? "#1B5E20" : "#2E7D32"
  });
  state.history.unshift({
    date: `${suggestion.day} ${suggestion.slot}`,
    court: suggestion.court.name,
    result: "W"
  });
  save();
  render();
}

function renderCalendarView() {
  renderCalendar(document.getElementById("calendar"), state.sessions, (sessionId, day, slot) => {
    const session = state.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.day = day;
      session.slot = slot;
      save();
      render();
    }
  });
}

function renderStats() {
  const container = document.getElementById("stats");
  const total = state.history.length;
  const favoriteCourt = state.history.reduce((acc, h) => {
    acc[h.court] = (acc[h.court] || 0) + 1;
    return acc;
  }, {});
  const favorite = Object.entries(favoriteCourt).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const avgDrive = { andrey: 20, alex: 18 };
  const streak = Math.min(total, 5);

  container.innerHTML = `
    <div class="stat-card"><h3>${total}</h3><p>Total sessions</p></div>
    <div class="stat-card"><h3>${favorite}</h3><p>Favorite court</p></div>
    <div class="stat-card"><h3>${avgDrive.andrey}m</h3><p>Avg drive (Andrey)</p></div>
    <div class="stat-card"><h3>${avgDrive.alex}m</h3><p>Avg drive (Alex)</p></div>
    <div class="stat-card"><h3>${streak} wk</h3><p>Current streak</p></div>
  `;
}

function renderHistory() {
  const container = document.getElementById("history");
  container.innerHTML = "";
  state.history.slice(0, 6).forEach((h) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `<div><strong>${h.court}</strong><div class="meta">${h.date}</div></div><div class="tag">${h.result}</div>`;
    container.appendChild(item);
  });
  renderHistoryChart(document.getElementById("historyChart"), state.history);
}

function renderBadges() {
  const container = document.getElementById("badges");
  const total = state.history.length;
  const badges = [
    { label: "10 Sessions", earned: total >= 10 },
    { label: "5-Week Streak", earned: total >= 5 },
    { label: "First Match", earned: total >= 1 }
  ];
  container.innerHTML = badges.map((b) => `<div class="badge-pill">${b.earned ? "🏅" : "🎾"} ${b.label}</div>`).join("");
}

function attachHandlers() {
  document.getElementById("runScheduler").addEventListener("click", renderSuggestions);
  document.getElementById("thisWeek").addEventListener("click", () => {
    state.weekView = "this";
    renderCalendarView();
  });
  document.getElementById("nextWeek").addEventListener("click", () => {
    state.weekView = "next";
    renderCalendarView();
  });
  document.getElementById("addResult").addEventListener("click", () => {
    state.history.unshift({
      date: "Manual entry",
      court: courts[0].name,
      result: Math.random() > 0.5 ? "W" : "L"
    });
    save();
    render();
  });
  document.getElementById("shareLink").addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Share link copied!");
  });
  ["filterIndoor", "filterOutdoor", "filterClay", "filterHard"].forEach((id) => {
    document.getElementById(id).addEventListener("change", render);
  });
}

function updateWeatherWidget() {
  const widget = document.getElementById("weatherWidget");
  const messages = [
    "Perfect 72°F for outdoor play",
    "Warm breeze in Smyrna",
    "Light clouds, low rain risk",
    "Golden hour court lighting"
  ];
  widget.querySelector(".weather-desc").textContent = messages[Math.floor(Math.random() * messages.length)];
}

function render() {
  renderPlayers();
  renderCourts();
  renderSuggestions();
  renderCalendarView();
  renderStats();
  renderHistory();
  renderBadges();
  renderCommuteChart(document.getElementById("commuteChart"));
  updateWeatherWidget();
}

attachHandlers();
render();
