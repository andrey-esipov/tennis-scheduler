const STORAGE_KEY = "tennisScheduler";

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateState(partial) {
  const current = loadState() || {};
  const next = { ...current, ...partial };
  saveState(next);
  return next;
}
