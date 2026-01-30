import React, { forwardRef } from "react";
import Field from "./Field";

const cx = (...parts) => parts.filter(Boolean).join(" ");

const TextAreaField = forwardRef(function TextAreaField(
  { id, label, hint, error, required, unstyled, className, textareaClassName, ...props },
  ref
) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} unstyled={unstyled} className={className}>
      {({ id: resolvedId, hintId, errorId }) => (
        <textarea
          ref={ref}
          id={resolvedId}
          className={cx("textarea", error ? "error" : "", textareaClassName)}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(hintId, errorId) || undefined}
          required={required}
          {...props}
        />
      )}
    </Field>
  );
});

export default TextAreaField;
