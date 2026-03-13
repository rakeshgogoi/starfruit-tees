const SESSION_KEY = 'starfruit_admin_session';

export function getAdminPassword() {
  return import.meta.env.VITE_ADMIN_PASSWORD || '';
}

export function isAdminAuthenticated() {
  return typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';
}

export function setAdminAuthenticated() {
  if (typeof window !== 'undefined') sessionStorage.setItem(SESSION_KEY, '1');
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') sessionStorage.removeItem(SESSION_KEY);
}
