export const ADMIN_STORAGE_KEY = "adminLoggedIn";
export const CAIXA_LOGGED_ID_STORAGE_KEY = "caixa_logged_id";
export const LEGACY_CAIXA_STORAGE_KEY = "caixa";
export const AUTH_TOKEN_STORAGE_KEY = "auth_token";
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
  clearAuthToken();
}

export function getAuthToken() {
  if (!canUseStorage()) return null;
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (!canUseStorage()) return;
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function clearCaixaSessionStorage() {
  if (!canUseStorage()) return;

  localStorage.removeItem(CAIXA_LOGGED_ID_STORAGE_KEY);
  localStorage.removeItem(LEGACY_CAIXA_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  emitAuthSessionChanged();
}

export function clearAuthSessionStorage() {
  if (!canUseStorage()) return;
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  localStorage.removeItem(CAIXA_LOGGED_ID_STORAGE_KEY);
  localStorage.removeItem(LEGACY_CAIXA_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  emitAuthSessionChanged();
}
