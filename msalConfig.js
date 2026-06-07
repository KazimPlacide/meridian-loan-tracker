const msalConfig = {
  auth: {
    clientId: "37b49b1f-e37b-432c-ad82-7acec276af4c",
    authority: "https://login.microsoftonline.com/017fe191-8f70-4fe3-a87f-5a51d1967e94",
    redirectUri: "https://kazimplacide.github.io/meridian-loan-tracker/",
  },
  cache: { cacheLocation: "sessionStorage" }
};

const loginRequest = { scopes: ["openid", "profile", "User.Read"] };