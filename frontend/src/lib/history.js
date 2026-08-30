const KEY = "phonepredict.history.v1";

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function pushHistory(entry) {
  const list = getHistory();
  list.unshift({ ...entry, id: crypto.randomUUID(), timestamp: Date.now() });
  const trimmed = list.slice(0, 25);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
