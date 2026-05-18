import React from "react";
import { ArrowLeft, User, Phone } from "lucide-react";

/* ── Progress stepper ── */
type StepState = "done" | "active" | "pending";

interface Step {
  label: string;
  state: StepState;
}

const STEPS: Step[] = [
  { label: "Confirmed",   state: "done"    },
  { label: "En Route",    state: "active"  },
  { label: "Arrived",     state: "pending" },
  { label: "In Progress", state: "pending" },
  { label: "Completed",   state: "pending" },
];

const stepColor = (state: StepState) =>
  state === "done" ? "#4CAF84" : state === "active" ? "#F5A623" : "#E8E3DB";

const lineColor = (left: Step, right: Step) => {
  if (left.state === "done" && (right.state === "done" || right.state === "active"))
    return "#4CAF84";
  return "#E8E3DB";
};

const StepNode: React.FC<{ step: Step }> = ({ step }) => {
  const color = stepColor(step.state);
  const isFilled = step.state !== "pending";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: isFilled ? color : "transparent",
          border: `2px solid ${color}`,
          boxSizing: "border-box",
        }}
      />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "10px",
          fontWeight: step.state === "active" ? 600 : 400,
          lineHeight: "13px",
          color,
          whiteSpace: "nowrap",
        }}
      >
        {step.label}
      </span>
    </div>
  );
};

const ProgressBanner: React.FC = () => (
  <div
    role="status"
    aria-label="Job status: En Route"
    style={{
      height: "80px",
      backgroundColor: "#FFF8EC",
      borderBottom: "1px solid #EFEFEF",
      paddingLeft: "16px",
      paddingRight: "16px",
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      {STEPS.map((step, i) => (
        <React.Fragment key={step.label}>
          <StepNode step={step} />
          {i < STEPS.length - 1 && (
            <div
              aria-hidden="true"
              style={{
                flex: 1,
                height: "2px",
                backgroundColor: lineColor(STEPS[i], STEPS[i + 1]),
                marginTop: "6px",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

/* ── Card shell ── */
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

const CardLabel: React.FC<{ text: string }> = ({ text }) => (
  <span
    style={{
      fontFamily: "Inter, sans-serif",
      fontSize: "11px",
      fontWeight: 400,
      lineHeight: "15px",
      color: "#9B9B9B",
    }}
  >
    {text}
  </span>
);

const Divider: React.FC<{ margin?: string }> = ({ margin = "12px 0" }) => (
  <div
    aria-hidden="true"
    style={{ height: "1px", backgroundColor: "#EFEFEF", margin }}
  />
);

/* ── Detail row ── */
const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  last?: boolean;
  valueColor?: string;
}> = ({ label, value, last, valueColor = "#1A1A1A" }) => (
  <div
    style={{
      minHeight: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: last ? "none" : "1px solid #EFEFEF",
      gap: "12px",
      paddingTop: "2px",
      paddingBottom: "2px",
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
        color: valueColor,
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
);

/* ── Main screen ── */
interface HzActiveJobScreenProps {
  onBack?: () => void;
  onReportIssue?: () => void;
  onJobComplete?: () => void;
}

export const HzActiveJobScreen: React.FC<HzActiveJobScreenProps> = ({
  onBack,
  onReportIssue,
  onJobComplete,
}) => (
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
        Active Job
      </span>
    </header>

    {/* Progress banner */}
    <ProgressBanner />

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
        gap: "16px",
      }}
    >
      {/* Provider card */}
      <Card>
        <CardLabel text="Your Provider" />

        {/* Avatar row */}
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Avatar */}
          <div
            aria-hidden="true"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "#E8E3DB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User size={22} color="#FFFFFF" aria-hidden="true" />
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "22px",
                color: "#1A1A1A",
              }}
            >
              Ali Hassan
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
              AC Technician
            </span>
          </div>

          {/* Call shortcut */}
          <a
            href="tel:+923001234567"
            aria-label="Call Ali Hassan"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#FFF4E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <Phone size={20} color="#F5A623" aria-hidden="true" />
          </a>
        </div>

        <Divider />

        <DetailRow
          label="Estimated Arrival"
          value="~20 minutes"
          valueColor="#F5A623"
        />
        <DetailRow
          label="Contact"
          value={
            <a
              href="tel:+923001234567"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "20px",
                color: "#F5A623",
                textDecoration: "none",
              }}
            >
              +92 300 1234567
            </a>
          }
          last
        />
      </Card>

      {/* Job details card */}
      <Card>
        <CardLabel text="Job Details" />
        <div style={{ marginTop: "8px" }}>
          <DetailRow label="Service"   value="AC Repairing" />
          <DetailRow label="Location"  value="G-13 · House 12, Street 4" />
          <DetailRow label="Scheduled" value="Sat, 18 May · 9:00 AM" />
          <DetailRow label="Estimate"  value="PKR 2,873" last />
        </div>
      </Card>

      {/* Payment reminder */}
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
          💵 Pay <strong>PKR 2,873</strong> directly to Ali Hassan in cash upon job completion.
        </p>
      </div>

      {/* Report issue */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <button
          type="button"
          onClick={onReportIssue}
          style={{
            background: "none",
            border: "none",
            padding: "10px 24px",
            minHeight: "48px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "20px",
            color: "#9B9B9B",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Report an Issue
        </button>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
          }}
        >
          Available only after job is completed.
        </span>
      </div>

      {/* Job complete CTA — appears once provider marks done */}
      <div
        style={{
          marginTop: "8px",
          paddingTop: "16px",
          borderTop: "1px solid #EFEFEF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <button
          type="button"
          onClick={onJobComplete}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#F5A623",
            border: "none",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            fontWeight: 500,
            lineHeight: "22px",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          Job Done — Rate Provider →
        </button>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
          }}
        >
          Tap once provider has marked the job complete.
        </span>
      </div>
    </div>
  </div>
);
