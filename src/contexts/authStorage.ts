export const ADMIN_STORAGE_KEY = "adminLoggedIn";
export const CAIXA_LOGGED_ID_STORAGE_KEY = "caixa_logged_id";
export const LEGACY_CAIXA_STORAGE_KEY = "caixa";
export const AUTH_SESSION_CHANGED_EVENT = "auth-session-change";

const canUseStorage = () => typeof window !== "undefined";

export function emitAuthSessionChanged() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function getStoredAdminSession() {
  if (!canUseStorage()) return false;
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
}

export function setAdminSessionStorage(isAdmin: boolean) {
  if (!canUseStorage()) return;

  if (isAdmin) {
    localStorage.setItem(ADMIN_STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  emitAuthSessionChanged();
}

export function clearAdminSessionStorage() {
  setAdminSessionStorage(false);
}

export function clearCaixaSessionStorage() {
  if (!canUseStorage()) return;

  localStorage.removeItem(CAIXA_LOGGED_ID_STORAGE_KEY);
  localStorage.removeItem(LEGACY_CAIXA_STORAGE_KEY);
  emitAuthSessionChanged();
}
