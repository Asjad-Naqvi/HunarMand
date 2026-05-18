import React, { useState } from "react";
import { Bell, Home, User, ChevronRight } from "lucide-react";

/* ─── Availability toggle ─── */
const AvailabilityToggle: React.FC = () => {
  const [available, setAvailable] = useState(true);

  return (
    <div>
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
          Your Status
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={available}
          aria-label={available ? "Set yourself unavailable" : "Set yourself available"}
          onClick={() => setAvailable((v) => !v)}
          style={{
            width: "128px",
            height: "44px",
            borderRadius: "22px",
            backgroundColor: available ? "#4CAF84" : "#9B9B9B",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s ease",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {available ? "Available ✓" : "Unavailable"}
          </span>
        </button>
      </div>
      <p
        style={{
          margin: 0,
          marginTop: "4px",
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "16px",
          color: available ? "#4CAF84" : "#9B9B9B",
          textAlign: "right",
          transition: "color 0.2s ease",
        }}
      >
        {available ? "You are visible to consumers" : "You are hidden from consumers"}
      </p>
    </div>
  );
};

/* ─── Stats card ─── */
const StatTile: React.FC<{
  value: string;
  label: string;
  borderRight?: boolean;
  borderBottom?: boolean;
}> = ({ value, label, borderRight, borderBottom }) => (
  <div
    style={{
      flex: "1 1 50%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2px",
      padding: "12px 8px",
      borderRight: borderRight ? "1px solid #EFEFEF" : "none",
      borderBottom: borderBottom ? "1px solid #EFEFEF" : "none",
      boxSizing: "border-box",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "20px",
        fontWeight: 600,
        lineHeight: "26px",
        color: "#1A1A1A",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 400,
        lineHeight: "15px",
        color: "#9B9B9B",
        textAlign: "center",
      }}
    >
      {label}
    </span>
  </div>
);

const StatsCard: React.FC = () => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      border: "1px solid #E8E3DB",
      padding: "16px",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 400,
        lineHeight: "15px",
        color: "#9B9B9B",
      }}
    >
      This Month
    </span>
    {/* 2×2 grid */}
    <div
      style={{
        marginTop: "8px",
        display: "flex",
        flexWrap: "wrap",
        border: "1px solid #EFEFEF",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <StatTile value="18"           label="Jobs"    borderRight borderBottom />
      <StatTile value="★ 4.8"        label="Rating"  borderBottom />
      <StatTile value="94%"          label="On Time" borderRight />
      <StatTile value="PKR 42,000 *" label="Earned"  />
    </div>
    <p
      style={{
        margin: 0,
        marginTop: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 400,
        fontStyle: "italic",
        lineHeight: "15px",
        color: "#9B9B9B",
        textAlign: "right",
      }}
    >
      * Simulated earnings for demo purposes.
    </p>
  </div>
);

/* ─── Advisor card ─── */
interface AdvisorCardProps {
  emoji: string;
  type: string;
  typeColor: string;
  body: string;
  linkLabel?: string;
  linkColor?: string;
}

const AdvisorCard: React.FC<AdvisorCardProps> = ({
  emoji,
  type,
  typeColor,
  body,
  linkLabel,
  linkColor,
}) => (
  <div
    style={{
      width: "200px",
      minHeight: "120px",
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      border: "1px solid #E8E3DB",
      padding: "16px",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      boxSizing: "border-box",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "18px",
        color: typeColor,
      }}
    >
      {emoji} {type}
    </span>
    <p
      style={{
        margin: 0,
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "18px",
        color: "#1A1A1A",
        flex: 1,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {body}
    </p>
    {linkLabel && (
      <button
        type="button"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          lineHeight: "16px",
          color: linkColor ?? typeColor,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {linkLabel}
      </button>
    )}
  </div>
);

/* ─── Job card ─── */
interface JobCardProps {
  service: string;
  timePill: string;
  location: string;
  estimate: string;
  onView?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ service, timePill, location, estimate, onView }) => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      border: "1px solid #E8E3DB",
      padding: "16px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "22px",
          color: "#1A1A1A",
        }}
      >
        {service}
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: "22px",
          paddingLeft: "8px",
          paddingRight: "8px",
          borderRadius: "11px",
          backgroundColor: "#F5A623",
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          lineHeight: "16px",
          color: "#FFFFFF",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {timePill}
      </span>
    </div>
    <p
      style={{
        margin: 0,
        marginTop: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "18px",
        color: "#9B9B9B",
      }}
    >
      {location}
    </p>
    <div style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          color: "#1A1A1A",
        }}
      >
        {estimate}
      </span>
      <button
        type="button"
        onClick={onView}
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
        View →
      </button>
    </div>
  </div>
);

/* ─── Quick link row ─── */
const QuickLinkRow: React.FC<{ label: string; last?: boolean; onPress?: () => void }> = ({
  label,
  last,
  onPress,
}) => (
  <button
    type="button"
    onClick={onPress}
    style={{
      width: "100%",
      height: "48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "none",
      border: "none",
      borderBottom: last ? "none" : "1px solid #EFEFEF",
      padding: 0,
      cursor: "pointer",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#1A1A1A",
      }}
    >
      {label}
    </span>
    <ChevronRight size={18} color="#9B9B9B" aria-hidden="true" />
  </button>
);

/* ─── Section header ─── */
const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({
  title,
  action,
  onAction,
}) => (
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
        onClick={onAction}
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
        {action}
      </button>
    )}
  </div>
);

/* ─── Bottom nav ─── */
type ProviderTab = "dashboard" | "inbox" | "profile";

const ProviderBottomNav: React.FC<{
  active: ProviderTab;
  onChange: (tab: ProviderTab) => void;
}> = ({ active, onChange }) => {
  const tabs: { id: ProviderTab; label: string; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "inbox",     label: "Inbox",     badge: 2 },
    { id: "profile",   label: "Profile" },
  ];

  const icons: Record<ProviderTab, React.ReactNode> = {
    dashboard: (tab: ProviderTab) => <Home size={24} color={active === "dashboard" ? "#F5A623" : "#9B9B9B"} aria-hidden="true" />,
    inbox:     (tab: ProviderTab) => <Bell size={24} color={active === "inbox"     ? "#F5A623" : "#9B9B9B"} aria-hidden="true" />,
    profile:   (tab: ProviderTab) => <User size={24} color={active === "profile"   ? "#F5A623" : "#9B9B9B"} aria-hidden="true" />,
  };

  return (
    <nav
      aria-label="Provider navigation"
      style={{
        height: "64px",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #EFEFEF",
        display: "flex",
        flexShrink: 0,
      }}
    >
      {tabs.map(({ id, label, badge }) => {
        const isActive = id === active;
        const color = isActive ? "#F5A623" : "#9B9B9B";
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
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
              padding: 0,
              position: "relative",
            }}
          >
            {/* Icon + badge wrapper */}
            <div style={{ position: "relative", display: "inline-flex" }}>
              {id === "dashboard" && <Home size={24} color={color} aria-hidden="true" />}
              {id === "inbox"     && <Bell size={24} color={color} aria-hidden="true" />}
              {id === "profile"   && <User size={24} color={color} aria-hidden="true" />}
              {badge != null && (
                <span
                  aria-label={`${badge} notifications`}
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-6px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "#F5A623",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    lineHeight: "16px",
                    color: "#FFFFFF",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
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
};

/* ─── Main screen ─── */
interface HzProviderDashboardProps {
  onViewJob?: () => void;
  onViewInbox?: () => void;
  onViewPastJobs?: () => void;
  onViewProfile?: () => void;
}

export const HzProviderDashboard: React.FC<HzProviderDashboardProps> = ({ onViewJob, onViewInbox, onViewPastJobs, onViewProfile }) => {
  const [activeTab, setActiveTab] = useState<ProviderTab>("dashboard");

  const handleTabChange = (tab: ProviderTab) => {
    setActiveTab(tab);
    if (tab === "inbox") onViewInbox?.();
    if (tab === "profile") onViewProfile?.();
  };

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
          justifyContent: "space-between",
        }}
      >
        {/* Left: logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            aria-hidden="true"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#F5A623",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#FFFFFF",
                lineHeight: 1,
              }}
            >
              H
            </span>
          </div>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              lineHeight: "22px",
              color: "#1A1A1A",
            }}
          >
            Haazir
          </span>
        </div>

        {/* Right: bell + badge */}
        <button
          type="button"
          aria-label="Notifications, 2 unread"
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Bell size={24} color="#1A1A1A" aria-hidden="true" />
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#F5A623",
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              lineHeight: "16px",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            2
          </span>
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
          paddingBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "0px",
        }}
      >
        {/* Availability toggle */}
        <AvailabilityToggle />

        {/* Stats card */}
        <div style={{ marginTop: "16px" }}>
          <StatsCard />
        </div>

        {/* AI Advisor */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Haazir Advisor" action="See all" />
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              overflowY: "hidden",
              scrollbarWidth: "none",
              marginLeft: "-16px",
              marginRight: "-16px",
              paddingLeft: "16px",
              paddingRight: "16px",
            }}
          >
            <AdvisorCard
              emoji="💡"
              type="Opportunity"
              typeColor="#F5A623"
              body="High demand for AC Repair in G-10 this weekend"
              linkLabel="Expand service areas"
              linkColor="#F5A623"
            />
            <AdvisorCard
              emoji="⭐"
              type="Rating"
              typeColor="#F5A623"
              body="Your punctuality score dropped to 88%. Aim to arrive 10 min early."
            />
            <AdvisorCard
              emoji="⚠"
              type="Non-Response"
              typeColor="#E8872A"
              body="You missed 2 job requests this week. 5 more and your visibility will reduce."
              linkLabel="View missed requests"
              linkColor="#E8872A"
            />
            {/* trailing spacer */}
            <span style={{ width: "8px", flexShrink: 0 }} aria-hidden="true" />
          </div>
        </div>

        {/* Upcoming jobs */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Upcoming Jobs" action="View all" />
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <JobCard
              service="AC Repairing"
              timePill="Tomorrow · 9 AM"
              location="G-13 · House 12, Street 4"
              estimate="Est. PKR 2,873"
              onView={onViewJob}
            />
            <JobCard
              service="Sofa Cleaning"
              timePill="Mon 20 May · 11 AM"
              location="F-7 · Apartment 3B"
              estimate="Est. PKR 1,500"
              onView={onViewJob}
            />
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: "24px", paddingBottom: "16px" }}>
          <SectionHeader title="Quick Links" />
          <div style={{ marginTop: "8px" }}>
            <QuickLinkRow label="Past Jobs" onPress={onViewPastJobs} />
            <QuickLinkRow label="Update My Profile / Skills" last />
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <ProviderBottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  );
};
