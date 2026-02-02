import { formatMinutes, getCombinedCommute, getDriveDifference } from "./commute.js";

const iconSvgs = {
  leaf: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 3.6C14.3 4 9.4 6.2 6.3 9.3c-3.6 3.6-4.4 7.7-4.6 10.9 3.2-.2 7.3-1 10.9-4.6 3.1-3.1 5.3-8 5.8-14zm-9.7 9.7c-1.5 1.5-3.5 2.6-5.3 3.3.7-1.8 1.8-3.8 3.3-5.3 2.4-2.4 5.7-4 9-4.6-.6 3.3-2.2 6.6-4.6 9z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.7 5.7 6.3.9-4.5 4.4 1.1 6.3L12 16.9 6.4 19.3l1.1-6.3L3 8.6l6.3-.9L12 2z"/></svg>`,
  building: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V3h10v6h6v12H4zm2-2h4v-2H6v2zm0-4h4v-2H6v2zm0-4h4V9H6v2zm0-4h4V5H6v2zm6 12h6v-2h-6v2zm0-4h6v-2h-6v2z"/></svg>`,
};

function getMarkerHtml(court) {
  const { color, icon, label } = court.marker || { color: "#FF5A5F", icon: "text", label: "" };
  const inner = icon === "text" ? `<span>${label || court.name.charAt(0)}</span>` : iconSvgs[icon] || "";
  return `
    <div class="court-marker">
      <div class="marker-circle" style="border-color:${color}; color:${color};">
        ${inner}
      </div>
      <div class="marker-label">${court.price}</div>
    </div>
  `;
}

function formatDayLabel(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { weekday: "short" });
}

function getWeatherIcon(desc = "") {
  const text = desc.toLowerCase();
  if (text.includes("storm") || text.includes("thunder")) return "⛈️";
  if (text.includes("rain") || text.includes("shower")) return "🌧️";
  if (text.includes("cloud")) return text.includes("partly") ? "⛅" : "☁️";
  return "☀️";
}

export function initMap({ courts, players, onSelect }) {
  const map = L.map("map", { zoomControl: true, scrollWheelZoom: true }).setView([35.85, -86.6], 10);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "©OpenStreetMap, ©CartoDB",
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  const courtIcon = (court) =>
    L.divIcon({
      className: "custom-marker",
      html: getMarkerHtml(court),
      iconSize: [90, 90],
      iconAnchor: [45, 80],
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
      .on("click", () => onSelect?.(court));
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
      <div class="weather-card">
        <div class="weather-loading" style="width:140px"></div>
        <div class="weather-loading" style="width:220px"></div>
        <div class="weather-loading" style="width:180px"></div>
      </div>
    `;
    return;
  }

  const forecastHtml = weather.forecast
    .map(
      (day) => `
      <div class="forecast-day">
        <span>${formatDayLabel(day.date)}</span>
        <span>${getWeatherIcon(day.desc)}</span>
        <span>${day.maxTemp}°C</span>
      </div>`
    )
    .join("");

  container.innerHTML = `
    <p class="eyebrow">Weather</p>
    <div class="weather-card">
      <div class="weather-current">
        <span class="weather-icon">${getWeatherIcon(weather.desc)}</span>
        <span class="weather-temp">${weather.temp}°C</span>
        <span class="weather-desc">${weather.desc}</span>
      </div>
      <div class="weather-forecast">${forecastHtml}</div>
      <div class="weather-recommendation">${weather.recommendation}</div>
    </div>
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
    container.innerHTML = `<div class="empty-state">No sessions yet. Log the next match to start tracking fairness.</div>`;
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

export function renderCourtDetailPanel(container, court, weather, onBook, onClose) {
  if (!container || !court) return;
  const rainy = weather?.forecast?.some((day) => day.chanceOfRain >= 50);
  const suitability = !weather
    ? "Weather loading…"
    : rainy && !court.indoor
    ? "Rain likely — indoor courts recommended."
    : rainy && court.indoor
    ? "Rain is likely, but indoor courts work great."
    : "Great day for outdoor courts.";

  container.innerHTML = `
    <div class="court-detail-header">
      <div>
        <p class="eyebrow">Court details</p>
        <h3>${court.name}</h3>
        <p class="muted">${court.address}</p>
      </div>
      <button class="court-detail-close" aria-label="Close">✕</button>
    </div>
    <div class="court-detail-meta">
      <div><strong>Hours:</strong> ${court.hours || "Visit website"}</div>
      <div><strong>Pricing:</strong> ${court.pricingDetails || court.price}</div>
      <div><strong>Drive times:</strong> Andrey ${court.drive.andrey}m · Lucas ${court.drive.lucas}m</div>
      <div><strong>Weather:</strong> ${suitability}</div>
      ${court.bookingRules ? `<div><strong>Booking rules:</strong> ${court.bookingRules}</div>` : ""}
    </div>
    <div class="court-detail-tags">
      <span class="badge">${court.type}</span>
      ${court.amenities?.slice(0, 3).map((item) => `<span class="badge">${item}</span>`).join("")}
    </div>
    <div class="modal-actions">
      <button class="primary-btn" id="detailBook">Book now</button>
    </div>
  `;
  container.classList.add("active");
  container.setAttribute("aria-hidden", "false");
  container.querySelector("#detailBook")?.addEventListener("click", () => onBook(court));
  container.querySelector(".court-detail-close")?.addEventListener("click", () => onClose?.(), { once: true });
}

export function closeCourtDetailPanel(container) {
  if (!container) return;
  container.classList.remove("active");
  container.setAttribute("aria-hidden", "true");
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
