import React, { forwardRef } from "react";
import Field from "./Field";

const cx = (...parts) => parts.filter(Boolean).join(" ");

const isRightActionConfig = (value) =>
  Boolean(value) &&
  typeof value === "object" &&
  typeof value.onClick === "function";

const TextField = forwardRef(function TextField(
  {
    id,
    label,
    hint,
    error,
    required,
    unstyled,
    leftIcon,
    rightIcon,
    rightAddon,
    rightAction,
    inputClassName,
    wrapperClassName,
    className,
    ...props
  },
  ref
) {
  const hasRightAction = isRightActionConfig(rightAction);

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      unstyled={unstyled}
      className={className}
    >
      {({ id: resolvedId, hintId, errorId }) => (
        <div
          className={cx(
            leftIcon || rightIcon || rightAddon || hasRightAction ? "input-wrapper" : "",
            hasRightAction ? "has-right-action" : "",
            wrapperClassName
          )}
        >
          {leftIcon ? (
            <span className="input-icon-left" aria-hidden="true">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={resolvedId}
            className={cx("input", error ? "error" : "", inputClassName)}
            aria-invalid={error ? true : undefined}
            aria-describedby={cx(hintId, errorId) || undefined}
            required={required}
            {...props}
          />

          {hasRightAction ? (
            <button
              type="button"
              className={cx("input-action", rightAction.className)}
              onClick={rightAction.onClick}
              aria-label={rightAction.ariaLabel}
              aria-pressed={rightAction.pressed || undefined}
              disabled={rightAction.disabled || undefined}
            >
              {rightAction.icon}
            </button>
          ) : null}

          {rightAddon ? rightAddon : null}

          {rightIcon ? (
            <span className="input-icon-right" aria-hidden="true">
              {rightIcon}
            </span>
          ) : null}
        </div>
      )}
    </Field>
  );
});

export default TextField;
