import React from "react";
import { ArrowLeft, ArrowUpDown, Home, Bell, User } from "lucide-react";

/* ─── Status pill ─── */
const Pill: React.FC<{ label: string; bg: string }> = ({ label, bg }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: "22px",
      paddingLeft: "8px",
      paddingRight: "8px",
      borderRadius: "11px",
      backgroundColor: bg,
      fontFamily: "Inter, sans-serif",
      fontSize: "12px",
      fontWeight: 500,
      lineHeight: "16px",
      color: "#FFFFFF",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    {label}
  </span>
);

/* ─── Job card ─── */
interface JobCardProps {
  service: string;
  statusPills: { label: string; bg: string }[];
  meta: string;
  earned: string;
  earnedNote?: string;
  ratingLine: React.ReactNode;
  warning?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  service,
  statusPills,
  meta,
  earned,
  earnedNote,
  ratingLine,
  warning,
}) => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      border: "1px solid #E8E3DB",
      padding: "16px",
    }}
  >
    {/* Top row: service + status pills */}
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "22px",
          color: "#1A1A1A",
          flex: 1,
        }}
      >
        {service}
      </span>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0 }}>
        {statusPills.map((p) => (
          <Pill key={p.label} label={p.label} bg={p.bg} />
        ))}
      </div>
    </div>

    {/* Meta */}
    <p
      style={{
        margin: 0,
        marginTop: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#9B9B9B",
      }}
    >
      {meta}
    </p>

    {/* Earnings row */}
    <p style={{ margin: 0, marginTop: "8px", display: "flex", alignItems: "baseline", gap: "4px", flexWrap: "wrap" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          color: earned === "PKR 0" ? "#9B9B9B" : "#4CAF84",
        }}
      >
        Earned: {earned}
      </span>
      {earnedNote && (
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "16px",
            color: "#9B9B9B",
          }}
        >
          {earnedNote}
        </span>
      )}
    </p>

    {/* Rating line */}
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
      {ratingLine}
    </p>

    {/* Warning */}
    {warning && (
      <p
        style={{
          margin: 0,
          marginTop: "4px",
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "16px",
          color: "#D94F4F",
        }}
      >
        {warning}
      </p>
    )}
  </div>
);

/* ─── Summary strip tile ─── */
const SummaryTile: React.FC<{ value: string; label: string; last?: boolean }> = ({
  value,
  label,
  last,
}) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "2px",
      borderRight: last ? "none" : "1px solid #EFEFEF",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "22px",
        color: "#1A1A1A",
        textAlign: "center",
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "16px",
        color: "#9B9B9B",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  </div>
);

type ProviderTab = "dashboard" | "inbox" | "profile";

/* ─── Bottom nav ─── */
const BottomNav: React.FC<{ onTabChange?: (tab: ProviderTab) => void }> = ({ onTabChange }) => (
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
    {([
      { id: "dashboard" as ProviderTab, Icon: Home, label: "Dashboard" },
      { id: "inbox"     as ProviderTab, Icon: Bell, label: "Inbox"     },
      { id: "profile"   as ProviderTab, Icon: User, label: "Profile"   },
    ]).map(({ id, Icon, label }) => (
      <button
        key={id}
        type="button"
        aria-label={label}
        onClick={() => onTabChange?.(id)}
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
        <Icon size={24} color="#9B9B9B" aria-hidden="true" />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
          }}
        >
          {label}
        </span>
      </button>
    ))}
  </nav>
);

/* ─── Main screen ─── */
interface HzProviderPastJobsProps {
  onBack?: () => void;
  onTabChange?: (tab: ProviderTab) => void;
}

export const HzProviderPastJobs: React.FC<HzProviderPastJobsProps> = ({ onBack, onTabChange }) => (
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
        paddingLeft: "4px",
        paddingRight: "16px",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        style={{
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <ArrowLeft size={24} color="#1A1A1A" aria-hidden="true" />
      </button>

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
        Past Jobs
      </span>

      <button
        type="button"
        aria-label="Sort jobs"
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
        <ArrowUpDown size={24} color="#1A1A1A" aria-hidden="true" />
      </button>
    </header>

    {/* Summary strip */}
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #EFEFEF",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "10px",
        paddingBottom: "6px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <SummaryTile value="42"           label="Total Jobs" />
        <SummaryTile value="★ 4.8"        label="Avg Rating" />
        <SummaryTile value="PKR 1,02,400 *" label="Earned"   last />
      </div>
      <p
        style={{
          margin: 0,
          marginTop: "4px",
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          fontWeight: 400,
          fontStyle: "italic",
          lineHeight: "15px",
          color: "#9B9B9B",
          textAlign: "right",
        }}
      >
        * Simulated earnings.
      </p>
    </div>

    {/* Job list */}
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "12px",
        paddingBottom: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
      aria-label="Past jobs list"
    >
      <JobCard
        service="AC Repairing"
        statusPills={[{ label: "Completed", bg: "#4CAF84" }]}
        meta="Sana M. · G-13 · Sat 18 May · 9 AM"
        earned="PKR 2,800"
        earnedNote="(+ PKR 151 Haazir subsidy)"
        ratingLine="Consumer rated you: ★ 4.8 · You rated consumer: ★ 8.5"
      />

      <JobCard
        service="Sofa Cleaning"
        statusPills={[{ label: "Completed", bg: "#4CAF84" }]}
        meta="Raza K. · F-7 · Mon 13 May · 11 AM"
        earned="PKR 1,500"
        ratingLine="Consumer rated you: ★ 4.6 · You rated consumer: ★ 9.0"
      />

      <JobCard
        service="AC General Service"
        statusPills={[
          { label: "Completed",     bg: "#4CAF84" },
          { label: "Dispute Filed", bg: "#E8872A" },
        ]}
        meta="Ahmed B. · G-10 · Thu 9 May · 2 PM"
        earned="PKR 1,200"
        ratingLine="Consumer rating: Withheld (dispute)"
      />

      <JobCard
        service="Electrician"
        statusPills={[{ label: "Cancelled (No Response)", bg: "#9B9B9B" }]}
        meta="Unknown · G-11 · Mon 6 May · 10 AM"
        earned="PKR 0"
        ratingLine=""
        warning="⚠ Non-response logged."
      />
    </div>

    <BottomNav onTabChange={onTabChange} />
  </div>
);
