// Displays footer with ratings and copyright
// Appears at the bottom of all main pages

import React from "react";

export default function Footer() {
  return (
    <footer style={{ padding: "10px", textAlign: "center", borderTop: "1px solid #ddd" }}>
      <p>⭐ Community Rating: 4.6 / 5</p>
      <p>© 2026 Smart Hood</p>
    </footer>
  );
}
