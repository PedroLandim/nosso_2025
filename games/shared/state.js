const STORAGE_KEY = "duda_game_state";

const defaultState = {
  points: 0,
  inventory: [],
};

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { ...defaultState };
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getPoints() {
  return loadState().points;
}

export function addPoints(amount) {
  const state = loadState();
  state.points += amount;
  saveState(state);
  return state.points;
}

export function spendPoints(amount) {
  const state = loadState();
  if (state.points < amount) return false;
  state.points -= amount;
  saveState(state);
  return true;
}

export function addItem(item) {
  const state = loadState();
  state.inventory.push(item);
  saveState(state);
}

export function getInventory() {
  return loadState().inventory;
}

window.__ADD_POINTS__ = (n) => addPoints(n);
window.__SET_POINTS__ = (n) => {
  const cur = getPoints();
  addPoints(Math.max(0, n) - cur);
};
