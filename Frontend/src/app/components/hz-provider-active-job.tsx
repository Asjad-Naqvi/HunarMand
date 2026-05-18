import React from "react";
import { ArrowLeft, MapPin, Phone } from "lucide-react";

/* ─── Progress banner ─── */
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

const dotColor = (state: StepState) =>
  state === "done" ? "#4CAF84" : state === "active" ? "#F5A623" : "transparent";

const dotBorder = (state: StepState) =>
  state === "pending" ? "2px solid #E8E3DB" : "none";

const lineColor = (left: Step) =>
  left.state === "done" ? "#4CAF84" : "#E8E3DB";

const StepNode: React.FC<{ step: Step }> = ({ step }) => {
  const color =
    step.state === "done" ? "#4CAF84" : step.state === "active" ? "#F5A623" : "#E8E3DB";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
      <div
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: dotColor(step.state),
          border: dotBorder(step.state),
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
      backgroundColor: "#FFF8EC",
      borderBottom: "1px solid #F5A623",
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingTop: "12px",
      paddingBottom: "10px",
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
                backgroundColor: lineColor(STEPS[i]),
                marginTop: "6px",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
    <p
      style={{
        margin: 0,
        marginTop: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "18px",
        color: "#F5A623",
      }}
    >
      Currently: En Route to Consumer
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

/* ─── Detail row ─── */
const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  last?: boolean;
  valueColor?: string;
  valueBold?: boolean;
}> = ({ label, value, last, valueColor = "#1A1A1A", valueBold }) => (
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
        fontWeight: valueBold ? 600 : 400,
        lineHeight: "20px",
        color: valueColor,
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
);

/* ─── Status action button ─── */
const StatusButton: React.FC<{
  label: string;
  variant: "primary" | "disabled" | "secondary";
  onPress?: () => void;
}> = ({ label, variant, onPress }) => {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "#F5A623",
      border: "none",
      color: "#FFFFFF",
      fontWeight: 600,
      cursor: "pointer",
    },
    disabled: {
      backgroundColor: "#FFFFFF",
      border: "1px solid #E8E3DB",
      color: "#9B9B9B",
      fontWeight: 400,
      cursor: "default",
    },
    secondary: {
      backgroundColor: "#FFFFFF",
      border: "1px solid #9B9B9B",
      color: "#9B9B9B",
      fontWeight: 400,
      cursor: "pointer",
    },
  };

  return (
    <button
      type="button"
      onClick={variant !== "disabled" ? onPress : undefined}
      disabled={variant === "disabled"}
      aria-disabled={variant === "disabled"}
      style={{
        width: "100%",
        height: "48px",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        lineHeight: "20px",
        ...styles[variant],
      }}
    >
      {label}
    </button>
  );
};

/* ─── Main screen ─── */
interface HzProviderActiveJobProps {
  onBack?: () => void;
  onMarkArrived?: () => void;
  onReportIssue?: () => void;
  onJobComplete?: () => void;
}

export const HzProviderActiveJob: React.FC<HzProviderActiveJobProps> = ({
  onBack,
  onMarkArrived,
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
      {/* Address reveal card */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: "22px",
              color: "#1A1A1A",
            }}
          >
            Consumer Address
          </span>
          <a
            href="https://maps.google.com/?q=House+12+Street+4+G-13+Islamabad"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: "18px",
              color: "#F5A623",
              textDecoration: "none",
            }}
          >
            Tap for Maps
          </a>
        </div>

        <div style={{ marginTop: "8px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <MapPin size={20} color="#F5A623" aria-hidden="true" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                lineHeight: "22px",
                color: "#1A1A1A",
              }}
            >
              House 12, Street 4, G-13/1, Islamabad
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
              G-13, Islamabad
            </span>
          </div>
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
          }}
        >
          Address revealed because you accepted this job.
        </p>
      </Card>

      {/* Job details card */}
      <Card>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
          }}
        >
          Job Details
        </span>
        <div
          aria-hidden="true"
          style={{ height: "1px", backgroundColor: "#EFEFEF", margin: "8px 0" }}
        />
        <DetailRow label="Service"       value="AC Repairing" />
        <DetailRow label="Consumer"      value="Sana M." />
        <DetailRow label="Scheduled"     value="Sat 18 May · 9:00 AM" />
        <DetailRow
          label="Your Earnings"
          value="PKR 2,800"
          valueColor="#4CAF84"
          valueBold
          last
        />
      </Card>

      {/* Status update card */}
      <Card>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
          }}
        >
          Update Job Status
        </span>
        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <StatusButton label="Mark as Arrived"   variant="primary"   onPress={onMarkArrived} />
          <StatusButton label="Mark as Completed" variant="disabled" onPress={onJobComplete} />
          <StatusButton label="Report Issue"      variant="secondary" onPress={onReportIssue} />
        </div>
      </Card>

      {/* Consumer contact card */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Phone size={20} color="#F5A623" aria-hidden="true" />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "16px",
              color: "#9B9B9B",
            }}
          >
            Consumer Contact (post-accept)
          </span>
        </div>
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: "22px",
              color: "#1A1A1A",
            }}
          >
            +92 321 4567890
          </span>
          <a
            href="tel:+923214567890"
            aria-label="Call consumer"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#FFF4E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Phone size={20} color="#F5A623" aria-hidden="true" />
          </a>
        </div>
      </Card>
    </div>
  </div>
);
