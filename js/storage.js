const STORAGE_KEY = "tennisScheduler";

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { sessions: [], settings: { lastUpdated: new Date().toISOString().split("T")[0] } };
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse storage", error);
    return { sessions: [], settings: { lastUpdated: new Date().toISOString().split("T")[0] } };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addSession(state, session) {
  const sessions = [...state.sessions, session];
  const nextState = {
    ...state,
    sessions,
    settings: { ...state.settings, lastUpdated: new Date().toISOString().split("T")[0] },
  };
  saveState(nextState);
  return nextState;
}
