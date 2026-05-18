import React from "react";
import { Home, Search, CalendarDays, User } from "lucide-react";

export type HzNavTabId = "home" | "explore" | "bookings" | "profile";

interface HzBottomNavProps {
  activeTab: HzNavTabId;
  onTabChange: (id: HzNavTabId) => void;
}

const TABS: { id: HzNavTabId; Icon: React.FC<{ size: number; color: string }>; label: string }[] = [
  { id: "home",     Icon: Home,          label: "Home"     },
  { id: "explore",  Icon: Search,        label: "Explore"  },
  { id: "bookings", Icon: CalendarDays,  label: "Bookings" },
  { id: "profile",  Icon: User,          label: "Profile"  },
];

export const HzBottomNav: React.FC<HzBottomNavProps> = ({ activeTab, onTabChange }) => (
  <nav
    aria-label="Main navigation"
    style={{
      height: "64px",
      backgroundColor: "#FFFFFF",
      borderTop: "1px solid #EFEFEF",
      display: "flex",
      flexShrink: 0,
    }}
  >
    {TABS.map(({ id, Icon, label }) => {
      const isActive = id === activeTab;
      const color = isActive ? "#F5A623" : "#9B9B9B";
      return (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          aria-current={isActive ? "page" : undefined}
          aria-label={label}
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color,
            padding: 0,
            minWidth: "48px",
          }}
        >
          <Icon size={24} color={color} />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: isActive ? 500 : 400,
              lineHeight: "15px",
              color,
            }}
          >
            {label}
          </span>
        </button>
      );
    })}
  </nav>
);
