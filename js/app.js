import { courts, players } from "./courts.js";
import { getWeather } from "./weather.js";
import { loadState, addSession } from "./storage.js";
import { getFairnessSummary, recommendCourt } from "./fairness.js";
import {
  initMap,
  renderRecommendation,
  renderWeather,
  renderFairness,
  renderCourts,
  renderSessionHistory,
  renderSessionForm,
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
      <span class="badge">${court.indoor ? "Indoor" : "Outdoor"}</span>
    </div>
    <div class="modal-actions">
      <a href="${court.bookingUrl}" target="_blank" class="primary-btn">Open ${court.bookingPlatform}</a>
      <a href="${court.website}" target="_blank" class="ghost-btn">Visit website</a>
      ${court.phone ? `<a href="tel:${court.phone}" class="ghost-btn">Call ${court.phone}</a>` : ""}
      <button class="ghost-btn" id="logAfterBook">Log this session</button>
    </div>
  `;

  openModal(modal, content, () => closeModal(modal));
  document.getElementById("logAfterBook")?.addEventListener("click", () => {
    closeModal(modal);
    sessionCourt.value = court.id;
    sessionDate.focus();
    window.scrollTo({ top: sessionForm.offsetTop - 40, behavior: "smooth" });
  });
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
  initMap({ courts, players, onBook: handleBook });
  updateRecommendation();
  renderAll();
  loadWeather();

  sessionForm.addEventListener("submit", handleSessionSubmit);
  refreshWeatherBtn.addEventListener("click", loadWeather);
}

initApp();
