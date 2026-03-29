const SESSION_KEY = 'starfruit_admin_session';
const PASSWORD_KEY = 'starfruit_admin_pw';

export function getAdminPassword() {
  return import.meta.env.VITE_ADMIN_PASSWORD || '';
}

export function isAdminAuthenticated() {
  return typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';
}

/** Call this on successful login, passing the password the user typed. */
export function setAdminAuthenticated(password) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, '1');
    if (password) sessionStorage.setItem(PASSWORD_KEY, password);
  }
}

/** Returns the password stored at login time — used as x-admin-password API header. */
export function getSessionPassword() {
  if (typeof window !== 'undefined') return sessionStorage.getItem(PASSWORD_KEY) || '';
  return '';
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PASSWORD_KEY);
  }
}
