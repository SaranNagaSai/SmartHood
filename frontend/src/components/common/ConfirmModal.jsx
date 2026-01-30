import React from "react";
import Button from "../ui/Button";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary",
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal modal-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Confirm"}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title || "Confirm"}</h3>
          <Button type="button" variant="ghost" size="sm" className="modal-close" onClick={onCancel} aria-label="Close">
            ✕
          </Button>
        </div>
        <div className="modal-body">
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>{message}</p>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button type="button" variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
