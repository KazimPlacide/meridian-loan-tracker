# Meridian Loan Tracker

A browser-based loan process tracking app for lending institutions. Built with vanilla HTML/CSS/JS — no build step required.

---

## 🚀 Deploy to GitHub Pages

### Step 1 — Create the repository

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create meridian-loan-tracker --public --source=. --push
# or push to an existing repo
```

### Step 2 — Enable GitHub Pages

1. Go to your repo → **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` will run automatically
4. Your app will be live at: `https://<your-username>.github.io/<repo-name>/`

---

## 🔐 Microsoft App Registration (Azure AD)

The app currently uses local username/password auth stored in `js/data.js`. To upgrade to Microsoft SSO via **MSAL.js**:

### Step 1 — Register the app in Azure

1. Go to [portal.azure.com](https://portal.azure.com) → **Microsoft Entra ID → App registrations → New registration**
2. Name: `Meridian Loan Tracker`
3. Supported account types: **Accounts in this organizational directory only** (single tenant)
4. Redirect URI: `Single-page application (SPA)` → `https://<your-username>.github.io/<repo-name>/`
5. Click **Register** — note your **Application (client) ID** and **Directory (tenant) ID**

### Step 2 — Configure the app

Create a file `js/msalConfig.js`:

```js
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: "https://<your-username>.github.io/<repo-name>/",
  },
  cache: { cacheLocation: "sessionStorage" }
};

const loginRequest = { scopes: ["openid", "profile", "User.Read"] };
```

### Step 3 — Swap in MSAL

Add to `index.html` before your scripts:

```html
<script src="https://alcdn.msauth.net/browser/2.38.0/js/msal-browser.min.js"></script>
<script src="js/msalConfig.js"></script>
```

Then replace the `Auth.login()` call in `js/auth.js` with:

```js
const msalInstance = new msal.PublicClientApplication(msalConfig);

async function msalLogin() {
  const response = await msalInstance.loginPopup(loginRequest);
  const account = response.account;
  const session = {
    username: account.username,
    displayName: account.name,
    role: 'officer', // map roles via Azure AD app roles or groups
    branch: 'Castries Main'
  };
  sessionStorage.setItem('meridian_session', JSON.stringify(session));
  return session;
}
```

> **Tip:** Use [Azure AD App Roles](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-add-app-roles-in-apps) to assign `admin` and `officer` roles to users in the portal — these flow through the ID token as `roles` claims.

---

## 👥 Demo Accounts

| Username | Password  | Role    | Branch        |
|----------|-----------|---------|---------------|
| admin    | admin123  | Admin   | Castries Main |
| derick   | pass123   | Officer | Castries Main |
| sandra   | pass123   | Officer | Vieux Fort    |
| marie    | pass123   | Officer | Soufrière     |
| kevin    | pass123   | Officer | Gros Islet    |

---

## 📁 Project structure

```
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js      # users, loan data, CRUD helpers
│   ├── auth.js      # session management (swap for MSAL)
│   └── app.js       # routing, rendering, events
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## ⚠️ Production notes

- Move user credentials and loan data to a real backend (e.g. Azure SQL, Cosmos DB, or Supabase)
- Use MSAL.js + Azure AD for authentication in production
- Protect the API with Azure API Management or Azure Functions
