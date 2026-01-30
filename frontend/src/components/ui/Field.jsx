import React, { useId } from "react";

const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function Field({
  id: idProp,
  label,
  hint,
  error,
  required,
  unstyled = false,
  className,
  children,
}) {
  const reactId = useId();
  const id = idProp || `field-${reactId}`;

  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const content = typeof children === "function" ? children({ id, hintId, errorId }) : children;

  if (unstyled && !label && !hint && !error && !className) {
    return content;
  }

  return (
    <div className={cx(unstyled ? "" : "form-group", className)}>
      {label ? (
        <label
          className={cx("form-label", required ? "form-label-required" : "")}
          htmlFor={id}
        >
          {label}
        </label>
      ) : null}

      {content}

      {hint ? (
        <div className="form-hint" id={hintId}>
          {hint}
        </div>
      ) : null}

      {error ? (
        <div className="form-error" id={errorId}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
