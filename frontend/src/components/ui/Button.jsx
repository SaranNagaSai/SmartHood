import React from "react";

const cx = (...parts) => parts.filter(Boolean).join(" ");

const Button = React.forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    block = false,
    loading = false,
    unstyled = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref
) {
  const sizeClass =
    size === "xs"
      ? "btn-xs"
      : size === "sm"
        ? "btn-sm"
        : size === "lg"
          ? "btn-lg"
          : size === "xl"
            ? "btn-xl"
            : "";

  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      ref={ref}
      type={type}
      className={unstyled ? className : cx(
          "btn",
          `btn-${variant}`,
          sizeClass,
          block ? "btn-block" : "",
          loading ? "is-loading" : "",
          className
        )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
