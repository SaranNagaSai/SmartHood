// Reusable modal for confirmations and alerts
// Used for work completion and notifications

import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)"
};

const modal = {
  background: "#fff",
  padding: "20px",
  margin: "100px auto",
  width: "300px"
};
