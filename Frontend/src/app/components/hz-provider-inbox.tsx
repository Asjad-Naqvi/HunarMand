import React, { useState, useEffect } from "react";
import { Bell, Info, BarChart2, Home, User } from "lucide-react";

/* ─── Types ─── */
type ProviderTab = "dashboard" | "inbox" | "profile";

/* ─── Countdown hook ─── */
function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return { display: `${mm}:${ss}`, seconds };
}

/* ─── Countdown pill ─── */
const CountdownPill: React.FC<{ initialSeconds: number }> = ({ initialSeconds }) => {
  const { display, seconds } = useCountdown(initialSeconds);
  const isLow = seconds <= 300;
  return (
    <span
      role="timer"
      aria-live="polite"
      aria-label={`${display} remaining`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "22px",
        paddingLeft: "8px",
        paddingRight: "8px",
        borderRadius: "11px",
        backgroundColor: isLow ? "#E8872A" : "#F5A623",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 500,
        lineHeight: "16px",
        color: "#FFFFFF",
        whiteSpace: "nowrap",
        flexShrink: 0,
        transition: "background-color 0.4s ease",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {display} remaining
    </span>
  );
};

/* ─── Job request card ─── */
interface JobRequestCardProps {
  service: string;
  location: string;
  datetime: string;
  earn: string;
  consumerRating: string;
  countdownSeconds: number;
  onAccept?: () => void;
  onDecline?: () => void;
  onPress?: () => void;
}

const JobRequestCard: React.FC<JobRequestCardProps> = ({
  service,
  location,
  datetime,
  earn,
  consumerRating,
  countdownSeconds,
  onAccept,
  onDecline,
  onPress,
}) => (
  <div
    role="article"
    aria-label={`Job request: ${service}`}
    onClick={onPress}
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.09)",
      border: "1px solid #E8E3DB",
      borderLeft: "4px solid #F5A623",
      padding: "16px",
      cursor: "pointer",
    }}
  >
    {/* Top row */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "22px",
          color: "#F5A623",
        }}
      >
        New Job Request
      </span>
      <CountdownPill initialSeconds={countdownSeconds} />
    </div>

    {/* Service */}
    <p
      style={{
        margin: 0,
        marginTop: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "22px",
        color: "#1A1A1A",
      }}
    >
      {service}
    </p>

    {/* Location + time */}
    <p
      style={{
        margin: 0,
        marginTop: "4px",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#9B9B9B",
      }}
    >
      {location} · {datetime}
    </p>

    {/* Earnings */}
    <p style={{ margin: 0, marginTop: "4px", display: "flex", alignItems: "baseline", gap: "4px", flexWrap: "wrap" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          color: "#4CAF84",
        }}
      >
        Est. earn: {earn}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "16px",
          color: "#9B9B9B",
        }}
      >
        (Haazir subsidy incl.)
      </span>
    </p>

    {/* Consumer rating */}
    <p
      style={{
        margin: 0,
        marginTop: "4px",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "16px",
        color: "#9B9B9B",
      }}
    >
      Consumer Rating: {consumerRating}
    </p>

    {/* Divider + action buttons */}
    <div
      aria-hidden="true"
      style={{ height: "1px", backgroundColor: "#EFEFEF", marginTop: "12px" }}
    />
    <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onAccept?.(); }}
        style={{
          flex: 1,
          height: "48px",
          borderRadius: "12px",
          backgroundColor: "#F5A623",
          border: "none",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
          color: "#FFFFFF",
          cursor: "pointer",
        }}
      >
        Accept
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDecline?.(); }}
        style={{
          flex: 1,
          height: "48px",
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #D94F4F",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          color: "#D94F4F",
          cursor: "pointer",
        }}
      >
        Decline
      </button>
    </div>
  </div>
);

/* ─── Section header ─── */
const SectionHeader: React.FC<{ title: string; badge?: number }> = ({ title, badge }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
    {badge != null && (
      <span
        aria-label={`${badge} new`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#F5A623",
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          lineHeight: "15px",
          color: "#FFFFFF",
        }}
      >
        {badge}
      </span>
    )}
  </div>
);

/* ─── General notification row ─── */
interface NotifRowProps {
  icon: React.ReactNode;
  text: string;
  time: string;
  unread?: boolean;
  last?: boolean;
}

const NotifRow: React.FC<NotifRowProps> = ({ icon, text, time, unread, last }) => (
  <div
    style={{
      minHeight: "56px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: unread ? "#FFF9F4" : "#FFFFFF",
      borderBottom: last ? "none" : "1px solid #EFEFEF",
      paddingTop: "8px",
      paddingBottom: "8px",
      paddingLeft: "16px",
      paddingRight: "16px",
    }}
  >
    <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{icon}</span>
    <span
      style={{
        flex: 1,
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: unread ? "#1A1A1A" : "#9B9B9B",
      }}
    >
      {text}
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 400,
        lineHeight: "15px",
        color: "#9B9B9B",
        flexShrink: 0,
      }}
    >
      {time}
    </span>
  </div>
);

/* ─── Bottom nav ─── */
const ProviderBottomNav: React.FC<{
  active: ProviderTab;
  onChange: (tab: ProviderTab) => void;
}> = ({ active, onChange }) => {
  const tabs: { id: ProviderTab; label: string; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "inbox",     label: "Inbox",     badge: 2 },
    { id: "profile",   label: "Profile" },
  ];

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
            }}
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              {id === "dashboard" && <Home size={24} color={color} aria-hidden="true" />}
              {id === "inbox"     && <Bell size={24} color={color} aria-hidden="true" />}
              {id === "profile"   && <User size={24} color={color} aria-hidden="true" />}
              {badge != null && (
                <span
                  aria-hidden="true"
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
                    color: "#FFFFFF",
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
interface HzProviderInboxProps {
  onViewJobRequest?: () => void;
  onAcceptJob?: () => void;
}

export const HzProviderInbox: React.FC<HzProviderInboxProps> = ({ onViewJobRequest, onAcceptJob }) => {
  const [activeTab, setActiveTab] = useState<ProviderTab>("inbox");

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
        <span style={{ width: "80px", flexShrink: 0 }} aria-hidden="true" />

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
          Inbox
        </span>

        <button
          type="button"
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            padding: "4px",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "#F5A623",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Mark all read
        </button>
      </header>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: "24px",
        }}
      >
        {/* New Job Requests section */}
        <div style={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "16px" }}>
          <SectionHeader title="New Job Requests" badge={2} />
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <JobRequestCard
              service="AC Repairing"
              location="G-13, Islamabad"
              datetime="Tomorrow 9:00 AM"
              earn="PKR 2,873"
              consumerRating="★ 4.7"
              countdownSeconds={683}
              onAccept={onAcceptJob}
              onDecline={() => {}}
              onPress={onViewJobRequest}
            />
            <JobRequestCard
              service="Sofa Cleaning"
              location="F-7, Islamabad"
              datetime="Mon 20 May · 11 AM"
              earn="PKR 1,500"
              consumerRating="★ 4.9"
              countdownSeconds={291}
              onAccept={onAcceptJob}
              onDecline={() => {}}
              onPress={onViewJobRequest}
            />
          </div>
        </div>

        {/* Other Notifications section */}
        <div style={{ paddingLeft: "16px", paddingRight: "16px", marginTop: "24px" }}>
          <SectionHeader title="Other Notifications" />
        </div>
        <div style={{ marginTop: "12px" }}>
          <NotifRow
            icon={<Bell size={20} color="#F5A623" aria-hidden="true" />}
            text="Consumer Sana Malik left you a 4.8 rating."
            time="2h ago"
            unread
          />
          <NotifRow
            icon={<Info size={20} color="#9B9B9B" aria-hidden="true" />}
            text="Your availability for Sunday has been updated."
            time="Yesterday"
          />
          <NotifRow
            icon={<BarChart2 size={20} color="#9B9B9B" aria-hidden="true" />}
            text="Haazir Advisor: High AC Repair demand in G-10 this weekend."
            time="2d ago"
            last
          />
        </div>
      </div>

      {/* Bottom navigation */}
      <ProviderBottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};
