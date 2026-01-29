// Displays list of notifications
// Fetches notifications from context

import React from "react";
import NotificationCard from "./NotificationCard";

export default function NotificationList() {
  const dummy = ["Service Request", "Emergency Alert"];

  return (
    <>
      {dummy.map((n, i) => (
        <NotificationCard key={i} text={n} />
      ))}
    </>
  );
}
