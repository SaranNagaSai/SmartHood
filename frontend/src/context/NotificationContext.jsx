// Stores notifications and unread count globally
// Used by notification page and navbar badge

import React, { createContext, useState } from "react";

export const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
