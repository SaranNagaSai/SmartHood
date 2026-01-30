import React, { forwardRef } from "react";
import Field from "./Field";

const cx = (...parts) => parts.filter(Boolean).join(" ");

const SelectField = forwardRef(function SelectField(
  { id, label, hint, error, required, unstyled, className, selectClassName, children, ...props },
  ref
) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} unstyled={unstyled} className={className}>
      {({ id: resolvedId, hintId, errorId }) => (
        <select
          ref={ref}
          id={resolvedId}
          className={cx("select", error ? "error" : "", selectClassName)}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(hintId, errorId) || undefined}
          required={required}
          {...props}
        >
          {children}
        </select>
      )}
    </Field>
  );
});

export default SelectField;
