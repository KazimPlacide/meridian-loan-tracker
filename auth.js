// ── AUTH ──────────────────────────────────────────────────────────────────────
// Simple session stored in sessionStorage.
// Replace this module with MSAL.js calls once Azure App Registration is set up.

const Auth = (() => {
  const SESSION_KEY = 'meridian_session';

  function login(username, password) {
    const user = getUserByUsername(username.trim().toLowerCase());
    if (!user || user.password !== password) return null;
    const session = { userId: user.id, username: user.username, displayName: user.displayName, role: user.role, branch: user.branch };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  function isAdmin() {
    const s = getSession();
    return s && s.role === 'admin';
  }

  return { login, logout, getSession, isAdmin };
})();
