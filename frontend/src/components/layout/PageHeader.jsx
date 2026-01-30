import React from 'react';

/**
 * PageHeader
 * Layout-only wrapper for consistent page header spacing.
 *
 * Rules for Step 3:
 * - No token/color/typography changes here
 * - Uses existing CSS classes from the design system
 */
export default function PageHeader({ title, subtitle, actions, children }) {
  if (children) {
    return <div className="page-header">{children}</div>;
  }

  if (!title && !subtitle && !actions) {
    return null;
  }

  return (
    <div className="page-header">
      <div className="page-header-top">
        <div>
          {title ? <h1 className="page-title">{title}</h1> : null}
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
