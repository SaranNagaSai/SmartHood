// Displays individual notification
// Used inside NotificationList

import React from "react";

export default function NotificationCard({ text }) {
  return (
    <div style={{ border: "1px solid var(--border-primary)", margin: "8px", padding: "8px" }}>
      {text}
    </div>
  );
}
