import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// CSS ordering matters.
// Load legacy styles first, then let the unified design system override.
import "./index.css";
import "./styles/main.css";

// 🔴 THIS LINE IS MANDATORY
import "./i18n/i18nConfig";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageProvider";
import { LocationProvider } from "./context/LocationProvider";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <LocationProvider>
          <NotificationProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </NotificationProvider>
        </LocationProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
