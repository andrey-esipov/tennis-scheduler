function modalHeader(court, subtitle) {
  return `
    <div class="modal-header">
      <div class="modal-logo">${court.shortName}</div>
      <div>
        <p class="eyebrow">Booking</p>
        <h2>${court.name}</h2>
        <p class="meta">${subtitle}</p>
      </div>
    </div>
  `;
}

function hoursList(hoursDisplay) {
  const rows = Object.entries(hoursDisplay)
    .map(([label, hours]) => `<li><span>${label}</span><span>${hours}</span></li>`)
    .join("");
  return `<ul class="hours-list">${rows}</ul>`;
}

function render316(court) {
  return `
    ${modalHeader(court, "Reserve courts via Court Reserve")}
    <div class="modal-body">
      <div class="modal-section">
        <h3>Hours of operation</h3>
        ${hoursList(court.hoursDisplay)}
      </div>
      <div class="modal-section">
        <h3>Pricing</h3>
        <p class="meta"><strong>${court.pricingDisplay}</strong> · ${court.pricingDetail}</p>
        <p class="meta">${court.bookingRules}</p>
      </div>
      <div class="modal-cta">
        <button class="btn primary" data-action="court-reserve">Open Court Reserve App</button>
        <div class="download-links">
          <a href="${court.bookingAppIos}" target="_blank" rel="noreferrer">Download iOS</a>
          <a href="${court.bookingAppAndroid}" target="_blank" rel="noreferrer">Download Android</a>
        </div>
      </div>
      <div class="modal-section">
        <p class="meta">Questions? Call <a href="tel:16156043218">${court.phone}</a></p>
        <a class="inline-link" href="${court.website}" target="_blank" rel="noreferrer">Visit website</a>
      </div>
    </div>
  `;
}

function renderFarmForge(court) {
  return `
    ${modalHeader(court, "Member-only booking via Club Automation")}
    <div class="modal-body">
      <div class="modal-section">
        <h3>Club access</h3>
        <p class="meta"><strong>Premium Private Club</strong></p>
        <p class="meta">High-performance tennis, youth development, and pro-led programs.</p>
      </div>
      <div class="modal-section">
        <h3>Hours</h3>
        ${hoursList(court.hoursDisplay)}
      </div>
      <div class="modal-actions">
        <a class="btn primary" href="${court.bookingUrl}" target="_blank" rel="noreferrer">Member Login</a>
        <a class="btn ghost" href="${court.tennisPage}" target="_blank" rel="noreferrer">View Tennis Programs</a>
        <a class="btn ghost" href="${court.website}" target="_blank" rel="noreferrer">Contact Us</a>
      </div>
      <div class="modal-section">
        <p class="meta">Instagram: <strong>${court.instagram}</strong></p>
      </div>
    </div>
  `;
}

function renderAdams(court) {
  return `
    ${modalHeader(court, "City of Murfreesboro reservations")}
    <div class="modal-body">
      <div class="modal-section">
        <h3>Hours</h3>
        ${hoursList(court.hoursDisplay)}
      </div>
      <div class="modal-section">
        <h3>Pricing</h3>
        <p class="meta">Members: FREE within 24hrs · <strong>$12/hr</strong> if reserved earlier</p>
        <p class="meta">Non-members (resident): $15/day + $15 court</p>
        <p class="meta">Non-members (non-resident): $20/day + $20 court</p>
      </div>
      <div class="modal-actions">
        <a class="btn primary" href="${court.bookingUrl}" target="_blank" rel="noreferrer">Reserve Online</a>
        <a class="btn ghost" href="tel:16155464000">Call to Book</a>
        <a class="btn ghost" href="${court.website}" target="_blank" rel="noreferrer">View Fees & Info</a>
      </div>
    </div>
  `;
}

export function openBookingModal(court) {
  const modal = document.getElementById("bookingModal");
  const content = document.getElementById("bookingModalContent");
  if (!modal || !content || !court) return;

  if (court.id === "316-tennis") {
    content.innerHTML = render316(court);
  } else if (court.id === "farm-forge") {
    content.innerHTML = renderFarmForge(court);
  } else {
    content.innerHTML = renderAdams(court);
  }

  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");

  const courtReserveBtn = content.querySelector("[data-action='court-reserve']");
  if (courtReserveBtn) {
    courtReserveBtn.addEventListener("click", () => {
      window.location.href = court.bookingUrl;
      window.setTimeout(() => {
        window.open(court.bookingUrl, "_blank", "noopener");
      }, 600);
    });
  }
}

export function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (!modal) return;
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
}

export function setupBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (!modal) return;
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close='modal']")) {
      closeBookingModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBookingModal();
    }
  });
}
