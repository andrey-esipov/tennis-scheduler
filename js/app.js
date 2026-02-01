import { courts } from "./courts.js";
import { defaultPlayers } from "./players.js";
import { getAvailabilityStatus } from "./availability.js";
import { openBookingModal, setupBookingModal } from "./booking.js";

const state = {
  activeCourtId: courts[0]?.id
};

const playerLookup = defaultPlayers.reduce((acc, player) => {
  acc[player.id] = player;
  return acc;
}, {});

function setActiveCourt(id) {
  state.activeCourtId = id;
  renderAll();
}

function updateActiveMarker() {
  document.querySelectorAll(".map-marker").forEach((marker) => {
    marker.classList.toggle("is-selected", marker.dataset.courtId === state.activeCourtId);
  });
}

function renderMapDetail() {
  const court = courts.find((c) => c.id === state.activeCourtId) || courts[0];
  const detail = document.getElementById("mapDetail");
  if (!detail || !court) return;
  const availability = getAvailabilityStatus(court);
  const andrey = playerLookup.andrey;
  const lucas = playerLookup.lucas;

  detail.innerHTML = `
    <p class="eyebrow">Selected court</p>
    <h3>${court.name}</h3>
    <p class="meta">${court.address}</p>
    <div class="court-badges">
      <span class="badge">${court.bookingPlatform}</span>
      <span class="badge">${court.pricingDisplay}</span>
    </div>
    <div class="availability-pill ${availability.state}">${availability.label}</div>
    <p class="meta">Drive: ${andrey.name} (${andrey.location}) ${court.drive.andrey} · ${lucas.name} (${lucas.location}) ${court.drive.lucas}</p>
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
  const andrey = playerLookup.andrey;
  const lucas = playerLookup.lucas;

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
          <span class="badge">${andrey.name}: ${court.drive.andrey} · ${andrey.location}</span>
          <span class="badge">${lucas.name}: ${court.drive.lucas} · ${lucas.location}</span>
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

function attachHandlers() {
  document.querySelectorAll(".map-marker").forEach((marker) => {
    marker.addEventListener("click", () => setActiveCourt(marker.dataset.courtId));
  });
}

function renderAll() {
  updateActiveMarker();
  renderMapDetail();
  renderCourtGrid();
}

setupBookingModal();
attachHandlers();
renderAll();
