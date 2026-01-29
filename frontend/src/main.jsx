import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 🔴 THIS LINE IS MANDATORY
import "./i18n/i18nConfig";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageProvider";
import { LocationProvider } from "./context/LocationProvider";
import { NotificationProvider } from "./context/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <LocationProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </LocationProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
