import { courts } from "./courts.js";
import { defaultPlayers } from "./players.js";

const state = {
  filter: "all",
  query: "",
  activeCourtId: courts[0]?.id
};

const map = L.map("map", {
  zoomControl: false,
  scrollWheelZoom: true
}).setView([35.9105, -86.7005], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

L.control.zoom({ position: "topright" }).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
const playerLayer = L.layerGroup().addTo(map);

const bookingModal = document.getElementById("bookingModal");
const openCourtReserveBtn = document.getElementById("openCourtReserve");

function openBookingModal() {
  if (!bookingModal) return;
  bookingModal.classList.add("is-visible");
  bookingModal.setAttribute("aria-hidden", "false");
}

function closeBookingModal() {
  if (!bookingModal) return;
  bookingModal.classList.remove("is-visible");
  bookingModal.setAttribute("aria-hidden", "true");
}

function openCourtReserve() {
  const court = courts.find((c) => c.id === "316-tennis");
  if (!court) return;
  window.location.href = court.bookingDeepLink || court.bookingUrl;
  window.setTimeout(() => {
    window.open(court.bookingFallbackUrl || court.bookingUrl, "_blank", "noopener");
  }, 600);
}

if (openCourtReserveBtn) {
  openCourtReserveBtn.addEventListener("click", openCourtReserve);
}

function markerHtml(court, selected = false) {
  return `
    <div class="map-marker ${selected ? "is-selected" : ""}">
      <div class="marker-badge">
        <span class="marker-icon">🎾</span>
        <span class="marker-label">${court.shortName}</span>
        <span class="marker-meta">${court.drive.andrey} · ${court.drive.lucas}</span>
      </div>
      <div class="marker-dot"></div>
    </div>
  `;
}

function filteredCourts() {
  return courts.filter((court) => {
    const matchesFilter = state.filter === "all"
      || (state.filter === "indoor" && court.type.toLowerCase().includes("indoor"))
      || (state.filter === "clay" && court.surface === "Clay")
      || (state.filter === "hard" && court.surface === "Hard");
    const search = state.query.trim();
    const matchesSearch = !search || `${court.name} ${court.address}`.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });
}

function renderMarkers() {
  markerLayer.clearLayers();
  filteredCourts().forEach((court) => {
    const marker = L.marker(court.coords, {
      icon: L.divIcon({
        className: "",
        html: markerHtml(court, court.id === state.activeCourtId),
        iconSize: [160, 40],
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
  if (!court) return;
  const detail = document.getElementById("mapDetail");
  const is316 = court.id === "316-tennis";
  detail.innerHTML = `
    <p class="eyebrow">Selected court</p>
    <h3>${court.name}</h3>
    <p class="meta">${court.address}</p>
    <div class="court-badges">
      <span class="badge">${court.type}</span>
      <span class="badge">${court.surface}</span>
      <span class="badge">${court.courts} courts</span>
    </div>
    <p class="meta">Drive: Andrey ${court.drive.andrey} · Lucas ${court.drive.lucas}</p>
    ${is316 ? `<button class="cta booking-btn" data-booking="${court.id}"><span class="booking-logo">CR</span><span data-hover>Book Court</span></button>` : `<a class="cta" href="${court.bookingUrl}" target="_blank" rel="noreferrer">Book or directions →</a>`}
  `;
  if (is316) {
    detail.querySelector("[data-booking]").addEventListener("click", openBookingModal);
  }
}

function renderCourtGrid() {
  const container = document.getElementById("courtsGrid");
  container.innerHTML = "";
  const sortedCourts = [...filteredCourts()].sort((a, b) => {
    if (a.id === "316-tennis") return -1;
    if (b.id === "316-tennis") return 1;
    return Number(b.featured) - Number(a.featured);
  });
  sortedCourts.forEach((court) => {
    const card = document.createElement("article");
    card.className = `court-card ${court.featured ? "featured" : "standard"} ${court.id === state.activeCourtId ? "is-active" : ""}`;
    const is316 = court.id === "316-tennis";
    card.innerHTML = `
      ${court.featured ? `<span class="feature-tag">Featured</span>` : ""}
      <img src="${court.image}" alt="${court.name}">
      <div>
        <h3>${court.name}</h3>
        <p class="meta">${court.address}</p>
      </div>
      <div class="court-badges">
        <span class="badge">${court.type}</span>
        <span class="badge">${court.surface}</span>
        <span class="badge">${court.rating} ★</span>
        ${is316 ? `<span class="badge price-tag">$40/hr</span>` : ""}
      </div>
      ${is316 ? `
        <div class="booking-section">
          <div class="booking-row"><span>Hours</span><span>${court.hours["Mon-Fri"]} weekdays</span></div>
          <div class="booking-row"><span>Questions</span><span>${court.phone}</span></div>
          <button class="booking-btn" data-booking="${court.id}">
            <span class="booking-logo">CR</span>
            <span data-hover>Book Court</span>
          </button>
          <a class="inline-link" href="${court.website}" target="_blank" rel="noreferrer">Visit website</a>
        </div>
      ` : ""}
      <div class="card-action">
        <div class="meta">Drive ${court.drive.andrey} · ${court.drive.lucas}</div>
        <button class="select-btn" data-court="${court.id}">Select</button>
      </div>
    `;
    card.querySelector(".select-btn").addEventListener("click", () => setActiveCourt(court.id));
    if (is316) {
      card.querySelector("[data-booking]").addEventListener("click", openBookingModal);
    }
    container.appendChild(card);
  });
}

function renderAvailability() {
  const availability = [
    { day: "Tue", slots: ["6-8 PM", "8-10 PM"], overlap: ["6-8 PM"] },
    { day: "Wed", slots: ["7-9 PM"], overlap: [] },
    { day: "Thu", slots: ["6-8 PM"], overlap: ["6-8 PM"] },
    { day: "Sat", slots: ["9-11 AM", "11 AM-1 PM"], overlap: ["9-11 AM"] },
    { day: "Sun", slots: ["10 AM-12 PM"], overlap: [] }
  ];
  const container = document.getElementById("availabilityGrid");
  container.innerHTML = "";
  availability.forEach((block) => {
    const card = document.createElement("div");
    card.className = "availability-card";
    card.innerHTML = `<h3>${block.day}</h3>`;
    block.slots.forEach((slot) => {
      const row = document.createElement("div");
      row.className = `slot ${block.overlap.includes(slot) ? "is-overlap" : ""}`;
      row.innerHTML = `<span>${slot}</span><span>${block.overlap.includes(slot) ? "Both" : "One"}</span>`;
      card.appendChild(row);
    });
    container.appendChild(card);
  });
}

function renderSuggestions() {
  const suggestions = [
    { id: 1, courtId: "316-tennis", day: "Thursday", time: "6:30 PM", weather: "Clear 71°F" },
    { id: 2, courtId: "farm-forge", day: "Saturday", time: "10:00 AM", weather: "Indoor backup" },
    { id: 3, courtId: "franklin-athletic", day: "Tuesday", time: "7:00 PM", weather: "Low rain risk" }
  ];
  const container = document.getElementById("suggestions");
  container.innerHTML = "";
  suggestions.forEach((s) => {
    const court = courts.find((c) => c.id === s.courtId);
    const card = document.createElement("div");
    card.className = "suggestion-card";
    card.innerHTML = `
      <h3>${s.day} · ${s.time}</h3>
      <p><strong>${court?.name}</strong></p>
      <p class="meta">Drive: Andrey ${court?.drive.andrey} · Lucas ${court?.drive.lucas}</p>
      <p class="meta">${s.weather}</p>
      <button class="btn ghost" data-select="${court?.id}">Select court</button>
    `;
    card.querySelector("button").addEventListener("click", () => setActiveCourt(court?.id));
    container.appendChild(card);
  });
}

function renderUpcoming() {
  const upcoming = [
    { date: "Aug 14", time: "6:30 PM", court: "316 Tennis Center", note: "Indoor court 3" },
    { date: "Aug 19", time: "7:00 PM", court: "Farm & Forge", note: "Drills + match" },
    { date: "Aug 24", time: "9:30 AM", court: "Old Fort Park", note: "Outdoor warmup" }
  ];
  const container = document.getElementById("upcoming");
  container.innerHTML = "";
  upcoming.forEach((item) => {
    const card = document.createElement("div");
    card.className = "upcoming-card";
    card.innerHTML = `
      <h3>${item.date} · ${item.time}</h3>
      <p><strong>${item.court}</strong></p>
      <p class="meta">${item.note}</p>
    `;
    container.appendChild(card);
  });
}

function setActiveCourt(id) {
  state.activeCourtId = id;
  renderAll();
}

function attachHandlers() {
  document.getElementById("courtSearch").addEventListener("input", (event) => {
    state.query = event.target.value.toLowerCase();
    renderAll();
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.filter = btn.dataset.filter;
      renderAll();
    });
  });

  if (bookingModal) {
    bookingModal.addEventListener("click", (event) => {
      if (event.target === bookingModal || event.target.closest("[data-close='modal']")) {
        closeBookingModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBookingModal();
    }
  });
}

function renderAll() {
  renderMarkers();
  renderPlayers();
  renderMapDetail();
  renderCourtGrid();
  renderAvailability();
  renderSuggestions();
  renderUpcoming();
}

attachHandlers();
renderAll();
