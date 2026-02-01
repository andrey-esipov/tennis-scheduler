import { courts } from "./courts.js";
import { defaultPlayers } from "./players.js";
import { getAvailabilityStatus } from "./availability.js";
import { openBookingModal, setupBookingModal } from "./booking.js";

const state = {
  activeCourtId: courts[0]?.id
};

const map = L.map("map", {
  zoomControl: false,
  scrollWheelZoom: true
}).setView([35.835, -86.650], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

L.control.zoom({ position: "topright" }).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
const playerLayer = L.layerGroup().addTo(map);

function markerHtml(court, selected = false) {
  const availability = getAvailabilityStatus(court);
  return `
    <div class="map-marker ${selected ? "is-selected" : ""}">
      <div class="marker-badge">
        <span class="marker-icon">🎾</span>
        <span class="marker-label">${court.shortName}</span>
        <span class="marker-meta">${court.pricingDisplay}</span>
        <span class="marker-meta">${availability.label}</span>
      </div>
      <div class="marker-dot"></div>
    </div>
  `;
}

function renderMarkers() {
  markerLayer.clearLayers();
  courts.forEach((court) => {
    const marker = L.marker(court.coords, {
      icon: L.divIcon({
        className: "",
        html: markerHtml(court, court.id === state.activeCourtId),
        iconSize: [190, 40],
        iconAnchor: [18, 40]
      })
    });
    marker.on("click", () => setActiveCourt(court.id));
    marker.addTo(markerLayer);
  });
}

function renderPlayers() {
  playerLayer.clearLayers();
  defaultPlayers.forEach((player) => {
    L.circleMarker(player.coords, {
      radius: 8,
      color: player.color,
      fillColor: player.color,
      fillOpacity: 1
    }).addTo(playerLayer).bindTooltip(`${player.name} · ${player.location}`);
  });
}

function renderMapDetail() {
  const court = courts.find((c) => c.id === state.activeCourtId) || courts[0];
  const detail = document.getElementById("mapDetail");
  if (!detail || !court) return;
  const availability = getAvailabilityStatus(court);
  detail.innerHTML = `
    <p class="eyebrow">Selected court</p>
    <h3>${court.name}</h3>
    <p class="meta">${court.address}</p>
    <div class="court-badges">
      <span class="badge">${court.bookingPlatform}</span>
      <span class="badge">${court.pricingDisplay}</span>
    </div>
    <div class="availability-pill ${availability.state}">${availability.label}</div>
    <p class="meta">Drive: Andrey ${court.drive.andrey} · Lucas ${court.drive.lucas}</p>
    <button class="booking-btn" data-booking="${court.id}">
      <span class="booking-logo">BOOK</span>
      <span>Book now</span>
    </button>
  `;
  detail.querySelector("[data-booking]").addEventListener("click", () => openBookingModal(court));
}

function renderCourtGrid() {
  const container = document.getElementById("courtsGrid");
  if (!container) return;
  container.innerHTML = "";
  courts.forEach((court, index) => {
    const availability = getAvailabilityStatus(court);
    const card = document.createElement("article");
    card.className = `court-card ${index === 0 ? "featured" : "standard"}`;
    card.innerHTML = `
      <div class="court-hero ${court.theme}">
        <p class="eyebrow">${court.bookingPlatform}</p>
        <h3>${court.shortName}</h3>
        <p class="meta">${court.address}</p>
        <div class="court-badges">
          <span class="badge price-tag">${court.pricingDisplay}</span>
          <span class="badge">${court.drive.andrey} · Andrey</span>
          <span class="badge">${court.drive.lucas} · Lucas</span>
        </div>
      </div>
      <div class="court-detail">
        <div><strong>Hours:</strong> ${Object.values(court.hoursDisplay).join(" · ")}</div>
        <div><strong>Booking rules:</strong> ${court.bookingRules}</div>
      </div>
      <div class="card-actions">
        <div class="availability-pill ${availability.state}">${availability.label}</div>
        <button class="booking-btn" data-booking="${court.id}">
          <span class="booking-logo">BOOK</span>
          <span>Book Now</span>
        </button>
      </div>
    `;
    card.querySelector("[data-booking]").addEventListener("click", () => openBookingModal(court));
    container.appendChild(card);
  });
}

function renderPriceComparison() {
  const tableBody = document.querySelector("#priceComparison tbody");
  if (!tableBody) return;
  tableBody.innerHTML = courts
    .map(
      (court) => `
      <tr>
        <td><strong>${court.shortName}</strong></td>
        <td>${court.pricingDisplay}</td>
        <td>${court.drive.andrey}</td>
        <td>${court.drive.lucas}</td>
      </tr>
    `
    )
    .join("");
}

function renderOptimalMeetup() {
  const container = document.getElementById("optimalMeetup");
  if (!container) return;
  const bestForAndrey = [...courts].sort((a, b) => a.driveMinutes.andrey - b.driveMinutes.andrey)[0];
  const bestForLucas = [...courts].sort((a, b) => a.driveMinutes.lucas - b.driveMinutes.lucas)[0];
  const bestBalance = [...courts].sort(
    (a, b) =>
      a.driveMinutes.andrey + a.driveMinutes.lucas -
      (b.driveMinutes.andrey + b.driveMinutes.lucas)
  )[0];

  container.innerHTML = `
    <div class="section-head">
      <div>
        <p class="eyebrow">Optimal meetup</p>
        <h2>Best balance callout</h2>
      </div>
    </div>
    <div class="optimal-card">
      <p class="meta">Best for Andrey</p>
      <strong>${bestForAndrey.name}</strong>
      <p class="meta">${bestForAndrey.drive.andrey} drive</p>
    </div>
    <div class="optimal-card">
      <p class="meta">Best for Lucas</p>
      <strong>${bestForLucas.name}</strong>
      <p class="meta">${bestForLucas.drive.lucas} drive</p>
    </div>
    <div class="optimal-card">
      <p class="meta">Best balance</p>
      <strong>${bestBalance.name}</strong>
      <p class="meta">Combined ${bestBalance.driveMinutes.andrey + bestBalance.driveMinutes.lucas} min</p>
    </div>
  `;
}

function setActiveCourt(id) {
  state.activeCourtId = id;
  renderAll();
}

function attachHandlers() {
  const refresh = document.getElementById("refreshAvailability");
  if (refresh) {
    refresh.addEventListener("click", renderAll);
  }
}

function renderAll() {
  renderMarkers();
  renderPlayers();
  renderMapDetail();
  renderCourtGrid();
  renderPriceComparison();
  renderOptimalMeetup();
}

setupBookingModal();
attachHandlers();
renderAll();
