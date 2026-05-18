import React from "react";
import { ArrowLeft } from "lucide-react";

/* ─── Detail row ─── */
const DetailRow: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <div
    style={{
      minHeight: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: last ? "none" : "1px solid #EFEFEF",
      gap: "8px",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#9B9B9B",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#1A1A1A",
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
);

/* ─── Timeline step ─── */
interface TimelineStepProps {
  state: "done" | "active" | "pending";
  label: string;
  labelColor?: string;
  sub: string;
  isLast?: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = ({ state, label, labelColor, sub, isLast }) => {
  const dotColor =
    state === "done" ? "#4CAF84" : state === "active" ? "#F5A623" : "transparent";
  const dotBorder =
    state === "pending" ? "2px solid #E8E3DB" : "none";
  const lineColor =
    state === "done" ? "#4CAF84" : "#E8E3DB";

  return (
    <div style={{ display: "flex", gap: "12px" }}>
      {/* Left column: dot + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: dotColor,
            border: dotBorder,
            flexShrink: 0,
            marginTop: "3px",
          }}
        />
        {!isLast && (
          <div
            style={{
              width: "2px",
              flex: 1,
              minHeight: "24px",
              backgroundColor: lineColor,
              marginTop: "4px",
            }}
          />
        )}
      </div>

      {/* Right column: text */}
      <div style={{ paddingBottom: isLast ? 0 : "16px", flex: 1 }}>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "20px",
            color: labelColor ?? "#1A1A1A",
            display: "block",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
            display: "block",
            marginTop: "2px",
          }}
        >
          {sub}
        </span>
      </div>
    </div>
  );
};

/* ─── Submission field ─── */
const SubmissionField: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => (
  <div style={{ paddingBottom: last ? 0 : "12px", borderBottom: last ? "none" : "1px solid #EFEFEF", marginBottom: last ? 0 : "12px" }}>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "18px",
        color: "#9B9B9B",
        display: "block",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#1A1A1A",
        display: "block",
        marginTop: "2px",
      }}
    >
      {value}
    </span>
  </div>
);

/* ─── Main screen ─── */
interface HzProviderDisputeStatusProps {
  onBack?: () => void;
}

export const HzProviderDisputeStatus: React.FC<HzProviderDisputeStatusProps> = ({ onBack }) => (
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
    <div aria-hidden="true" style={{ height: "24px", flexShrink: 0, backgroundColor: "#FFFFFF" }} />

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
        Dispute Status
      </span>
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Status card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
          border: "1px solid #E8E3DB",
          padding: "16px",
        }}
      >
        {/* Header row */}
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
            Dispute #D-2402
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "22px",
              paddingLeft: "10px",
              paddingRight: "10px",
              borderRadius: "11px",
              backgroundColor: "#E8872A",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Under Review
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "#EFEFEF", margin: "8px 0" }} />

        {/* Detail rows */}
        <DetailRow label="Type"    value="Consumer No-Show (DIS-03)" />
        <DetailRow label="Against" value="Sana Malik · Consumer" />
        <DetailRow label="Booking" value="AC Repairing · Sat 18 May" />
        <DetailRow label="Filed"   value="Sat, 18 May 2025 · 12:15 PM" last />

        {/* Caption */}
        <p
          style={{
            margin: 0,
            marginTop: "8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "16px",
            color: "#9B9B9B",
          }}
        >
          Expected resolution within 24 hours.
        </p>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: "24px" }}>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
          }}
        >
          Timeline
        </span>

        <div style={{ marginTop: "12px" }}>
          <TimelineStep
            state="done"
            label="Complaint Filed"
            sub="Sat 18 May · 12:15 PM"
          />
          <TimelineStep
            state="active"
            label="Under Review"
            labelColor="#F5A623"
            sub="Haazir agent is reviewing both parties."
          />
          <TimelineStep
            state="pending"
            label="Verdict Issued"
            labelColor="#9B9B9B"
            sub=""
            isLast
          />
        </div>
      </div>

      {/* Your submission */}
      <div style={{ marginTop: "24px" }}>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
          }}
        >
          Your Submission
        </span>

        <div
          style={{
            marginTop: "12px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
            border: "1px solid #E8E3DB",
            padding: "16px",
          }}
        >
          <SubmissionField
            label="Type"
            value="Consumer no-show (DIS-03)"
          />
          <SubmissionField
            label="Details"
            value="Waited 30 minutes. Called consumer twice — no answer."
          />
          <SubmissionField
            label="Contact attempt"
            value="Yes, called twice"
            last
          />
        </div>
      </div>

      {/* Verdict preview */}
      <div
        style={{
          marginTop: "24px",
          backgroundColor: "#FFF4E0",
          border: "1px solid #F5A623",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "18px",
            color: "#1A1A1A",
          }}
        >
          Once resolved, the verdict will appear here. A consumer no-show flag will be added to their record if the complaint is upheld.
        </p>
      </div>
    </div>
  </div>
);
