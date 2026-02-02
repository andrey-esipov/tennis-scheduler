import { courts, players } from "./courts.js";
import { getWeather } from "./weather.js";
import { loadState, addSession } from "./storage.js";
import { getFairnessSummary, recommendCourt } from "./fairness.js";
import { formatMinutes } from "./commute.js";
import {
  initMap,
  renderRecommendation,
  renderWeather,
  renderFairness,
  renderCourts,
  renderSessionHistory,
  renderSessionForm,
  renderCourtDetailPanel,
  closeCourtDetailPanel,
  openModal,
  closeModal,
} from "./ui.js";

const state = {
  weather: null,
  storage: loadState(),
};

const recommendationCard = document.getElementById("recommendationCard");
const weatherCard = document.getElementById("weatherCard");
const fairnessCard = document.getElementById("fairnessCard");
const courtsGrid = document.getElementById("courtsGrid");
const sessionList = document.getElementById("sessionList");
const sessionForm = document.getElementById("sessionForm");
const sessionDate = document.getElementById("sessionDate");
const sessionCourt = document.getElementById("sessionCourt");
const refreshWeatherBtn = document.getElementById("refreshWeather");
const modal = document.getElementById("bookingModal");
const detailPanel = document.getElementById("courtDetailPanel");
const andreyPill = document.querySelector(".andrey-pill");
const lucasPill = document.querySelector(".lucas-pill");

function renderAll() {
  const fairness = getFairnessSummary(state.storage.sessions);
  const suggestion = recommendation.court.name;

  renderRecommendation(recommendationCard, recommendation, handleBook);
  renderWeather(weatherCard, state.weather);
  renderFairness(fairnessCard, fairness, suggestion);
  renderCourts(courtsGrid, courts, state.weather, handleBook);
  renderSessionHistory(sessionList, state.storage.sessions);
}

let recommendation = recommendCourt({ courts, sessions: state.storage.sessions, weather: state.weather });

function updateRecommendation() {
  recommendation = recommendCourt({ courts, sessions: state.storage.sessions, weather: state.weather });
}

async function loadWeather() {
  renderWeather(weatherCard, null);
  state.weather = await getWeather();
  updateRecommendation();
  renderAll();
}

function handleBook(court) {
  const content = `
    <p class="eyebrow">${court.priceNote}</p>
    <h2>${court.name}</h2>
    <p class="muted">${court.address}</p>
    <div class="hero-meta" style="margin-top:12px;">
      <span class="badge">Andrey ${court.drive.andrey}m</span>
      <span class="badge">Lucas ${court.drive.lucas}m</span>
      <span class="badge">${court.type}</span>
    </div>
    <div class="modal-actions">
      <a href="${court.bookingUrl}" target="_blank" class="primary-btn">Open ${court.bookingPlatform}</a>
      <a href="${court.website}" target="_blank" class="ghost-btn">Visit website</a>
      ${court.phone ? `<a href="tel:${court.phone}" class="ghost-btn">Call ${court.phone}</a>` : ""}
      <button class="ghost-btn" id="logAfterBook">Log this session</button>
    </div>
  `;

  closeCourtDetailPanel(detailPanel);
  openModal(modal, content, () => closeModal(modal));
  document.getElementById("logAfterBook")?.addEventListener("click", () => {
    closeModal(modal);
    sessionCourt.value = court.id;
    sessionDate.focus();
    window.scrollTo({ top: sessionForm.offsetTop - 40, behavior: "smooth" });
  });
}

function handleCourtSelect(court) {
  renderCourtDetailPanel(detailPanel, court, state.weather, handleBook, () => closeCourtDetailPanel(detailPanel));
}

function getPlayerStats(playerId) {
  const sessions = state.storage.sessions;
  const totalSessions = sessions.length;
  const totalDrive = sessions.reduce((sum, session) => sum + (session[`${playerId}Drive`] || 0), 0);
  const avgDrive = totalSessions ? Math.round(totalDrive / totalSessions) : 0;

  const favoriteCounts = sessions.reduce((acc, session) => {
    acc[session.courtId] = (acc[session.courtId] || 0) + 1;
    return acc;
  }, {});
  const favoriteCourtId = Object.keys(favoriteCounts).sort((a, b) => favoriteCounts[b] - favoriteCounts[a])[0];
  const favoriteCourt = courts.find((court) => court.id === favoriteCourtId)?.name || "-";

  const lastSession = sessions.length
    ? [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  return {
    totalSessions,
    totalDrive,
    avgDrive,
    favoriteCourt,
    lastSession,
  };
}

function handlePlayerStats(playerId, name) {
  const stats = getPlayerStats(playerId);
  const lastLabel = stats.lastSession
    ? `${stats.lastSession.date} · ${stats.lastSession.courtName}`
    : "No sessions yet";

  const content = `
    <p class="eyebrow">Player stats</p>
    <h2>${name}</h2>
    <div class="session-list" style="margin-top:16px;">
      <div class="session-item"><strong>Total sessions</strong><span>${stats.totalSessions}</span></div>
      <div class="session-item"><strong>Total drive time</strong><span>${formatMinutes(stats.totalDrive)}</span></div>
      <div class="session-item"><strong>Favorite court</strong><span>${stats.favoriteCourt}</span></div>
      <div class="session-item"><strong>Average drive</strong><span>${formatMinutes(stats.avgDrive)}</span></div>
      <div class="session-item"><strong>Last session</strong><span>${lastLabel}</span></div>
    </div>
  `;

  openModal(modal, content, () => closeModal(modal));
}

function handleSessionSubmit(event) {
  event.preventDefault();
  const courtId = sessionCourt.value;
  const court = courts.find((item) => item.id === courtId);
  if (!court) return;

  const session = {
    id: Date.now(),
    date: sessionDate.value,
    courtId: court.id,
    courtName: court.name,
    andreyDrive: court.drive.andrey,
    lucasDrive: court.drive.lucas,
  };

  state.storage = addSession(state.storage, session);
  updateRecommendation();
  renderAll();
  sessionForm.reset();
  sessionDate.value = new Date().toISOString().split("T")[0];
}

function initForm() {
  sessionDate.value = new Date().toISOString().split("T")[0];
  renderSessionForm(sessionCourt, courts);
}

function initApp() {
  initForm();
  initMap({ courts, players, onSelect: handleCourtSelect });
  updateRecommendation();
  renderAll();
  loadWeather();

  sessionForm.addEventListener("submit", handleSessionSubmit);
  refreshWeatherBtn.addEventListener("click", loadWeather);
  andreyPill?.addEventListener("click", () => handlePlayerStats("andrey", "Andrey"));
  lucasPill?.addEventListener("click", () => handlePlayerStats("lucas", "Lucas"));
}

initApp();
