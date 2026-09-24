import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
Bell,
BookCopy,
ChartNoAxesCombined,
ShieldCheck,
UserRound,
Menu,
X,
ChevronRight,
UserPlus,
LogIn,
} from "lucide-react";
import "./Sidebar.css";

const iconMap = {
dashboard: ChartNoAxesCombined,
books: BookCopy,
alerts: Bell,
admin: ShieldCheck,
users: UserRound,
};

const Sidebar = ({
title,
subtitle,
badge,
navItems = [],
footerItems = [],
accent = "user",
logoSrc,
}) => {
const location = useLocation();
const [open, setOpen] = useState(false);

const isAdmin = accent === "admin";

return (
<>
{/* Mobile Menu Button */}
<button
type="button"
onClick={() => setOpen(true)}
className="sidebar-mobile-menu"
aria-label="Open navigation menu"
> <Menu size={20} /> </button>

  {/* Mobile Overlay */}
  <div
    className={`sidebar-overlay ${
      open ? "sidebar-overlay-open" : ""
    }`}
    onClick={() => setOpen(false)}
  />

  {/* Sidebar */}
  <aside
    className={`sidebar ${
      open ? "sidebar-open" : "sidebar-closed"
    }`}
  >
    {/* Header */}
    <div className="sidebar-header">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          {logoSrc ? (
            <img src={logoSrc} alt="Readora logo" />
          ) : (
            <BookCopy size={22} />
          )}
        </div>

        <h2 className="sidebar-title">{title}</h2>

        <p className="sidebar-subtitle">{subtitle}</p>

        {badge && (
          <span
            className={`sidebar-badge ${
              isAdmin
                ? "sidebar-badge-admin"
                : "sidebar-badge-user"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Mobile Close Button */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="sidebar-close"
        aria-label="Close navigation menu"
      >
        <X size={18} />
      </button>
    </div>

    {/* Navigation */}
    <nav className="sidebar-nav">
      {navItems.map((item) => {
        const Icon = iconMap[item.icon] ?? ChevronRight;

        const active =
          location.pathname === item.href ||
          (item.match &&
            location.pathname.startsWith(item.match));

        return (
          <Link
            key={item.label}
            to={item.href}
            onClick={() => setOpen(false)}
            className={`sidebar-nav-link ${
              active
                ? "sidebar-nav-link-active"
                : "sidebar-nav-link-inactive"
            }`}
          >
            <span
              className={`sidebar-nav-icon ${
                active
                  ? "sidebar-nav-icon-active"
                  : "sidebar-nav-icon-inactive"
              }`}
            >
              <Icon size={18} />
            </span>

            <span className="sidebar-nav-content">
              <span className="sidebar-nav-label">
                {item.label}
              </span>

              {item.description && (
                <span
                  className={`sidebar-nav-description ${
                    active
                      ? "sidebar-nav-description-active"
                      : "sidebar-nav-description-inactive"
                  }`}
                >
                  {item.description}
                </span>
              )}
            </span>

            <ChevronRight
              size={16}
              className={`sidebar-chevron ${
                active
                  ? "sidebar-chevron-active"
                  : "sidebar-chevron-inactive"
              }`}
            />
          </Link>
        );
      })}
    </nav>

    {/* Footer Actions */}
    <div className="sidebar-footer">
      {footerItems.map((item) => {
        const Icon =
          item.icon === "signup" ? UserPlus : LogIn;

        const buttonClass =
          item.kind === "primary"
            ? "sidebar-footer-primary"
            : "sidebar-footer-secondary";

        if (item.action) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className={`sidebar-footer-button ${buttonClass}`}
            >
              <span className="sidebar-footer-content">
                <Icon size={16} />
                {item.label}
              </span>

              <ChevronRight size={16} />
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.href}
            onClick={() => setOpen(false)}
            className={`sidebar-footer-button ${buttonClass}`}
          >
            <span className="sidebar-footer-content">
              <Icon size={16} />
              {item.label}
            </span>

            <ChevronRight size={16} />
          </Link>
        );
      })}
    </div>
  </aside>
</>


);
};

export default Sidebar;
