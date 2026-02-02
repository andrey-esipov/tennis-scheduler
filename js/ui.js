import { formatMinutes, getCombinedCommute, getDriveDifference } from "./commute.js";

export function initMap({ courts, players, onBook }) {
  const map = L.map("map", { zoomControl: true, scrollWheelZoom: true }).setView([35.85, -86.60], 10);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "©OpenStreetMap, ©CartoDB",
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  const courtIcon = (court) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-pill" style="border-left: 4px solid ${court.theme ? "#fff" : "#FF5A5F"}">
        <span class="marker-icon">🎾</span>
        <span class="marker-name">${court.name}</span>
        <span class="marker-price">${court.price}</span>
      </div>`,
      iconSize: [150, 52],
      iconAnchor: [75, 50],
    });

  const playerIcon = (player) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div class="player-dot" style="background:${player.color}">${player.name.charAt(0)}</div>
        <span class="player-name-label">${player.name}</span>`,
      iconSize: [60, 50],
      iconAnchor: [30, 25],
    });

  courts.forEach((court) => {
    L.marker([court.lat, court.lng], { icon: courtIcon(court) })
      .addTo(map)
      .on("click", () => onBook(court));
  });

  players.forEach((player) => {
    L.marker([player.lat, player.lng], { icon: playerIcon(player) }).addTo(map);
  });

  const bounds = [
    ...courts.map((court) => [court.lat, court.lng]),
    ...players.map((player) => [player.lat, player.lng]),
  ];
  map.fitBounds(bounds, { padding: [40, 40] });

  return map;
}

export function renderRecommendation(container, recommendation, onBook) {
  if (!container || !recommendation) return;
  const { court, reasoning } = recommendation;
  container.innerHTML = `
    <p class="eyebrow">Recommended for next session</p>
    <h2 class="hero-title">${court.name}</h2>
    <p class="hero-reason">${reasoning}</p>
    <div class="hero-meta">
      <span class="badge">${court.price}</span>
      <span class="badge">${court.indoor ? "Indoor" : "Outdoor"}</span>
      <span class="badge">${formatMinutes(getCombinedCommute(court))} total commute</span>
    </div>
    <button class="primary-btn" id="heroBook">Book ${court.name}</button>
  `;
  container.querySelector("#heroBook").addEventListener("click", () => onBook(court));
}

export function renderWeather(container, weather) {
  if (!container) return;
  if (!weather) {
    container.innerHTML = `
      <p class="eyebrow">Weather</p>
      <h3>Loading forecast</h3>
      <p class="muted">Fetching current conditions…</p>
    `;
    return;
  }

  const forecastHtml = weather.forecast
    .map(
      (day) => `
      <div class="session-item">
        <strong>${day.date}</strong>
        <span>${day.desc} · ${day.minTemp}–${day.maxTemp}°F</span>
        <span class="muted">Rain chance ${day.chanceOfRain}%</span>
      </div>`
    )
    .join("");

  container.innerHTML = `
    <p class="eyebrow">Weather</p>
    <h3>${weather.temp}°F · ${weather.desc}</h3>
    <p class="muted">Next 3 days</p>
    <div class="session-list">${forecastHtml}</div>
  `;
}

export function renderFairness(container, fairness, suggestion) {
  if (!container) return;
  const maxTotal = Math.max(fairness.totals.andrey, fairness.totals.lucas, 1);
  const andreyWidth = Math.round((fairness.totals.andrey / maxTotal) * 100);
  const lucasWidth = Math.round((fairness.totals.lucas / maxTotal) * 100);

  container.innerHTML = `
    <p class="eyebrow">Fairness</p>
    <h3>Drive balance</h3>
    <p class="muted">Andrey has driven ${formatMinutes(fairness.totals.andrey)} total. Lucas has driven ${formatMinutes(fairness.totals.lucas)} total.</p>
    <div class="fairness-bars">
      <div>
        <div class="muted small">Andrey</div>
        <div class="fairness-bar andrey"><span style="width:${andreyWidth}%"></span></div>
      </div>
      <div>
        <div class="muted small">Lucas</div>
        <div class="fairness-bar"><span style="width:${lucasWidth}%"></span></div>
      </div>
    </div>
    <p class="muted small" style="margin-top:12px;">Suggested next: ${suggestion}</p>
  `;
}

export function renderCourts(container, courts, weather, onBook) {
  if (!container) return;
  container.innerHTML = "";
  const rainy = weather?.forecast?.some((day) => day.chanceOfRain >= 50);

  courts.forEach((court) => {
    const card = document.createElement("article");
    const weatherLabel = !weather
      ? "Weather loading"
      : rainy && !court.indoor
      ? "🌧️ Consider indoor"
      : "☀️ Great for outdoor";

    card.className = "court-card";
    card.innerHTML = `
      <div class="court-hero" style="background:${court.theme}">
        <p class="eyebrow">${court.priceNote}</p>
        <h3>${court.name}</h3>
        <div class="weather-pill">${weatherLabel}</div>
      </div>
      <div class="court-body">
        <div class="court-meta">${court.address}</div>
        <div class="hero-meta">
          <span class="badge">Andrey ${court.drive.andrey}m • Lucas ${court.drive.lucas}m</span>
          <span class="badge">${formatMinutes(getCombinedCommute(court))} total</span>
          <span class="badge">${formatMinutes(getDriveDifference(court))} diff</span>
        </div>
        <div class="court-actions">
          <button class="primary-btn">Book court</button>
        </div>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => onBook(court));
    container.appendChild(card);
  });
}

export function renderSessionHistory(container, sessions) {
  if (!container) return;
  if (!sessions.length) {
    container.innerHTML = `<div class="session-item">No sessions yet. Log the next match to start tracking fairness.</div>`;
    return;
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  container.innerHTML = sorted
    .map((session) => {
      const who = session.andreyDrive === session.lucasDrive
        ? "Even drive"
        : session.andreyDrive > session.lucasDrive
        ? "Andrey drove further"
        : "Lucas drove further";
      return `
        <div class="session-item">
          <strong>${session.date}</strong>
          <span>${session.courtName}</span>
          <span class="muted">${who}</span>
        </div>
      `;
    })
    .join("");
}

export function renderSessionForm(selectEl, courts) {
  if (!selectEl) return;
  selectEl.innerHTML = courts
    .map((court) => `<option value="${court.id}">${court.name}</option>`)
    .join("");
}

export function openModal(modal, content, onClose) {
  if (!modal) return;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  const closeBtn = modal.querySelector(".modal-close");
  const overlayHandler = (event) => {
    if (event.target === modal) {
      onClose();
    }
  };
  closeBtn?.addEventListener("click", onClose, { once: true });
  modal.addEventListener("click", overlayHandler, { once: true });
  modal.querySelector("#bookingModalContent").innerHTML = content;
}

export function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}
