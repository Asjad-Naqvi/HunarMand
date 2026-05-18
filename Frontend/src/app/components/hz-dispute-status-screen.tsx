import React from "react";
import { ArrowLeft } from "lucide-react";

/* ─── Detail row ─── */
const DetailRow: React.FC<{ label: string; value: string; last?: boolean }> = ({
  label,
  value,
  last,
}) => (
  <div
    style={{
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: last ? "none" : "1px solid #EFEFEF",
      gap: "12px",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "18px",
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

/* ─── Timeline ─── */
type StepState = "done" | "active" | "pending";

interface TimelineStep {
  state: StepState;
  title: string;
  subtitle: string;
}

const STEPS: TimelineStep[] = [
  {
    state: "done",
    title: "Complaint Filed",
    subtitle: "Sun 19 May · 10:32 AM",
  },
  {
    state: "active",
    title: "Under Review",
    subtitle: "Haazir agent is reviewing your complaint.",
  },
  {
    state: "pending",
    title: "Verdict Issued",
    subtitle: "",
  },
];

const dotColor = (state: StepState) =>
  state === "done" ? "#4CAF84" : state === "active" ? "#F5A623" : "transparent";

const dotBorder = (state: StepState) =>
  state === "pending" ? "2px solid #9B9B9B" : "none";

const lineColor = (above: StepState, below: StepState) => {
  if (above === "done") return "#4CAF84";
  if (above === "active") return "#F5A623";
  return "#E8E3DB";
};

const Timeline: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {STEPS.map((step, i) => (
      <div key={step.title} style={{ display: "flex", gap: "12px" }}>
        {/* Left column: dot + line */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "12px",
            flexShrink: 0,
          }}
        >
          {/* Dot */}
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: dotColor(step.state),
              border: dotBorder(step.state),
              boxSizing: "border-box",
              flexShrink: 0,
              marginTop: "3px",
            }}
          />
          {/* Connecting line */}
          {i < STEPS.length - 1 && (
            <div
              aria-hidden="true"
              style={{
                width: "2px",
                flex: 1,
                minHeight: "24px",
                backgroundColor: lineColor(step.state, STEPS[i + 1].state),
                marginTop: "4px",
                marginBottom: "4px",
              }}
            />
          )}
        </div>

        {/* Right column: text */}
        <div
          style={{
            paddingBottom: i < STEPS.length - 1 ? "16px" : 0,
            flex: 1,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              color:
                step.state === "active"
                  ? "#F5A623"
                  : step.state === "pending"
                  ? "#9B9B9B"
                  : "#1A1A1A",
            }}
          >
            {step.title}
          </span>
          {step.subtitle && (
            <p
              style={{
                margin: 0,
                marginTop: "2px",
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                lineHeight: "15px",
                color: "#9B9B9B",
              }}
            >
              {step.subtitle}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
);

/* ─── Submission field ─── */
const SubmissionField: React.FC<{ label: string; value: string; last?: boolean }> = ({
  label,
  value,
  last,
}) => (
  <div
    style={{
      paddingBottom: last ? 0 : "12px",
      marginBottom: last ? 0 : "12px",
      borderBottom: last ? "none" : "1px solid #EFEFEF",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "18px",
        color: "#9B9B9B",
      }}
    >
      {label}
    </span>
    <p
      style={{
        margin: 0,
        marginTop: "2px",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#1A1A1A",
      }}
    >
      {value}
    </p>
  </div>
);

/* ─── Card shell ─── */
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      border: "1px solid #E8E3DB",
      padding: "16px",
    }}
  >
    {children}
  </div>
);

/* ─── Section header ─── */
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
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
);

/* ─── Main screen ─── */
interface HzDisputeStatusScreenProps {
  onBack?: () => void;
}

export const HzDisputeStatusScreen: React.FC<HzDisputeStatusScreenProps> = ({ onBack }) => (
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
      <Card>
        {/* Top row */}
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
            Dispute #D-2401
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "22px",
              paddingLeft: "8px",
              paddingRight: "8px",
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
        <div
          aria-hidden="true"
          style={{ height: "1px", backgroundColor: "#EFEFEF", margin: "8px 0" }}
        />

        {/* Detail rows */}
        <DetailRow label="Type"    value="Work Quality Complaint (DIS-01)" />
        <DetailRow label="Against" value="Ali Hassan · AC Technician" />
        <DetailRow label="Booking" value="AC Repairing · Sat 18 May" />
        <DetailRow label="Filed"   value="Sunday, 19 May 2025 · 10:32 AM" last />

        {/* Resolution hint */}
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
      </Card>

      {/* Timeline */}
      <div style={{ marginTop: "24px" }}>
        <SectionHeader title="Timeline" />
        <div style={{ marginTop: "12px" }}>
          <Timeline />
        </div>
      </div>

      {/* Submission summary */}
      <div style={{ marginTop: "24px" }}>
        <SectionHeader title="Your Submission" />
        <div style={{ marginTop: "12px" }}>
          <Card>
            <SubmissionField
              label="Dispute Type"
              value="Work quality not acceptable"
            />
            <SubmissionField
              label="Description"
              value="AC gas fill kiya tha lekin thanda nahi kar raha."
            />
            <SubmissionField
              label="Provider agreed to fix on-site"
              value="Yes"
              last
            />
          </Card>
        </div>
      </div>

      {/* Resolved state preview */}
      <div style={{ marginTop: "24px" }}>
        <div
          role="note"
          style={{
            borderRadius: "12px",
            backgroundColor: "#FFF4E0",
            border: "1px solid #F5A623",
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
            Verdict Issued — Provider received a warning. Reputation score adjusted.
          </p>
        </div>
        <p
          style={{
            margin: 0,
            marginTop: "6px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
            textAlign: "center",
          }}
        >
          This is shown once verdict is issued.
        </p>
      </div>
    </div>
  </div>
);
