// Stores notifications + unread count globally
// Used by notification page + navbar/side badges

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import API from "../services/api";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { data } = await API.get("/notifications/unread-count");
      setUnreadCount(Number(data?.count || 0));
    } catch {
      // keep last known count
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    refreshUnreadCount();
  }, [user, refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
