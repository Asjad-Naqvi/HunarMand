import React from "react";
import {
  Settings,
  User,
  Home,
  Briefcase,
  ChevronRight,
  Clock,
  MessageCircle,
  Heart,
} from "lucide-react";

/* ─── Types ─── */
type ChatTab = "chat" | "bookings" | "favourites" | "profile";

/* ─── Section header ─── */
const SectionHeader: React.FC<{
  title: string;
  action?: { label: string; onPress?: () => void };
}> = ({ title, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "22px",
        color: "#1A1A1A",
      }}
    >
      {title}
    </span>
    {action && (
      <button
        type="button"
        onClick={action.onPress}
        style={{
          background: "none",
          border: "none",
          padding: "4px",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: "18px",
          color: "#F5A623",
          cursor: "pointer",
        }}
      >
        {action.label}
      </button>
    )}
  </div>
);

/* ─── List row ─── */
const ListRow: React.FC<{
  leadingIcon?: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  last?: boolean;
  onPress?: () => void;
}> = ({ leadingIcon, label, trailing, last, onPress }) => (
  <button
    type="button"
    onClick={onPress}
    style={{
      width: "100%",
      minHeight: "48px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "transparent",
      border: "none",
      borderBottom: last ? "none" : "1px solid #EFEFEF",
      padding: "0",
      cursor: "pointer",
      textAlign: "left",
      boxSizing: "border-box",
    }}
  >
    {leadingIcon && (
      <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
        {leadingIcon}
      </span>
    )}
    <span
      style={{
        flex: 1,
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#1A1A1A",
      }}
    >
      {label}
    </span>
    {trailing ?? <ChevronRight size={18} color="#9B9B9B" aria-hidden="true" />}
  </button>
);

/* ─── Bottom nav ─── */
const TABS: {
  id: ChatTab;
  Icon: React.FC<{ size: number; color: string; fill?: string }>;
  label: string;
}[] = [
  { id: "chat",       Icon: MessageCircle, label: "Chat"       },
  { id: "bookings",   Icon: ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: "Bookings"   },
  { id: "favourites", Icon: Heart,         label: "Favourites" },
  { id: "profile",    Icon: User,          label: "Profile"    },
];

/* ─── Main screen ─── */
interface HzProfileScreenProps {
  onSignOut?: () => void;
  onTabChange?: (tab: ChatTab) => void;
}

export const HzProfileScreen: React.FC<HzProfileScreenProps> = ({ onSignOut, onTabChange }) => {
  const activeTab: ChatTab = "profile";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF8F5",
        overflow: "hidden",
      }}
    >
      {/* Status bar */}
      <div
        aria-hidden="true"
        style={{ height: "24px", flexShrink: 0, backgroundColor: "#FFFFFF" }}
      />

      {/* Top app bar */}
      <header
        style={{
          height: "56px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EFEFEF",
          display: "flex",
          alignItems: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <span style={{ width: "40px", flexShrink: 0 }} aria-hidden="true" />

        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
            pointerEvents: "none",
          }}
        >
          Profile
        </span>

        <button
          type="button"
          aria-label="Settings"
          style={{
            marginLeft: "auto",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Settings size={24} color="#1A1A1A" aria-hidden="true" />
        </button>
      </header>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "16px",
          paddingBottom: "32px",
        }}
      >
        {/* Profile header card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
            border: "1px solid #E8E3DB",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <div
            aria-hidden="true"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#E8E3DB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User size={32} color="#FFFFFF" aria-hidden="true" />
          </div>

          {/* Name + contact */}
          <div style={{ marginTop: "12px", textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "26px",
                color: "#1A1A1A",
              }}
            >
              Sana Malik
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "20px",
                color: "#9B9B9B",
              }}
            >
              +92 321 4567890
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                lineHeight: "18px",
                color: "#9B9B9B",
              }}
            >
              sana.malik@email.com
            </span>
          </div>

          {/* Loyalty badges */}
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "28px",
                paddingLeft: "12px",
                paddingRight: "12px",
                borderRadius: "14px",
                backgroundColor: "#CD7F32",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "18px",
                color: "#FFFFFF",
                whiteSpace: "nowrap",
              }}
            >
              Bronze · 5% off
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "28px",
                paddingLeft: "12px",
                paddingRight: "12px",
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E3DB",
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "16px",
                color: "#9B9B9B",
                whiteSpace: "nowrap",
              }}
            >
              8 bookings completed
            </span>
          </div>
        </div>

        {/* Saved Addresses */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Saved Addresses" action={{ label: "+ Add" }} />
          <div style={{ marginTop: "12px" }}>
            <ListRow
              leadingIcon={<Home size={20} color="#9B9B9B" aria-hidden="true" />}
              label="Home · G-13, Street 4, House 12"
            />
            <ListRow
              leadingIcon={<Briefcase size={20} color="#9B9B9B" aria-hidden="true" />}
              label="Office · F-7, Blue Area"
              last
            />
          </div>
        </div>

        {/* Preferences */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Preferences" />
          <div style={{ marginTop: "12px" }}>
            <ListRow
              leadingIcon={<Clock size={20} color="#9B9B9B" aria-hidden="true" />}
              label="Preferred Time"
              trailing={
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      color: "#9B9B9B",
                    }}
                  >
                    Morning
                  </span>
                  <ChevronRight size={18} color="#9B9B9B" aria-hidden="true" />
                </div>
              }
              last
            />
          </div>
        </div>

        {/* Account */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Account" />
          <div style={{ marginTop: "12px" }}>
            <ListRow label="My Disputes" />
            <ListRow label="Privacy & Data" />
            <ListRow label="About Haazir" last />
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={onSignOut}
          style={{
            display: "block",
            width: "100%",
            height: "48px",
            marginTop: "24px",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #D94F4F",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            fontWeight: 500,
            lineHeight: "22px",
            color: "#D94F4F",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          Sign Out
        </button>

        {/* Version */}
        <p
          style={{
            margin: 0,
            marginTop: "12px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
            textAlign: "center",
          }}
        >
          Haazir v1.0.0 — Hackathon Build
        </p>
      </div>

      {/* Bottom navigation */}
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
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              onClick={() => !isActive && onTabChange?.(id)}
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
                padding: 0,
                minWidth: "48px",
              }}
            >
              <Icon
                size={24}
                color={color}
                fill={isActive && id === "favourites" ? "#F5A623" : "none"}
                aria-hidden="true"
              />
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
    </div>
  );
};
