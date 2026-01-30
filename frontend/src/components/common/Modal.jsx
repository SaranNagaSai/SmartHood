// Reusable modal for confirmations and alerts
// Used for work completion and notifications

import React from "react";
import Button from "../ui/Button";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        {children}
        <Button type="button" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "var(--surface-overlay)"
};

const modal = {
  background: "var(--surface-primary)",
  padding: "20px",
  margin: "100px auto",
  width: "300px"
};
