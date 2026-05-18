import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";

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
  const mmDisplay = Math.floor(seconds / 60);
  const ssDisplay = seconds % 60;
  return { display: `${mm}:${ss}`, minutes: mmDisplay, secs: ssDisplay, seconds };
}

/* ─── Card shell ─── */
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      border: "1px solid #E8E3DB",
      padding: "16px",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ─── Card heading ─── */
const CardHeading: React.FC<{ title: string }> = ({ title }) => (
  <>
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
    <div
      aria-hidden="true"
      style={{ height: "1px", backgroundColor: "#EFEFEF", margin: "8px 0" }}
    />
  </>
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
      minHeight: "40px",
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
        fontSize: valueBold ? "15px" : "14px",
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

/* ─── Main screen ─── */
interface HzProviderJobRequestProps {
  onBack?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const HzProviderJobRequest: React.FC<HzProviderJobRequestProps> = ({
  onBack,
  onAccept,
  onDecline,
}) => {
  const { display, minutes, secs, seconds } = useCountdown(683);
  const isLow = seconds <= 300;

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
          paddingLeft: "4px",
          paddingRight: "12px",
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
          Job Request
        </span>

        {/* Countdown pill */}
        <span
          role="timer"
          aria-live="polite"
          aria-label={`${display} remaining`}
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            height: "26px",
            paddingLeft: "10px",
            paddingRight: "10px",
            borderRadius: "13px",
            backgroundColor: isLow ? "#E8872A" : "#F5A623",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "16px",
            color: "#FFFFFF",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            transition: "background-color 0.4s ease",
            flexShrink: 0,
          }}
        >
          {display} remaining
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
          paddingBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Job details card */}
        <Card>
          <CardHeading title="Job Details" />
          <DetailRow label="Service"          value="AC Repairing" />
          <DetailRow
            label="Complexity"
            value={
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                Complex
                <span
                  aria-hidden="true"
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#F5A623",
                    flexShrink: 0,
                  }}
                />
              </span>
            }
          />
          <DetailRow label="Sector"           value="G-13, Islamabad" />
          <DetailRow label="Date"             value="Saturday, 18 May 2025" />
          <DetailRow label="Time"             value="9:00 AM" />
          <DetailRow label="Consumer Rating"  value="★ 4.7 (12 bookings)" last />
        </Card>

        {/* Pricing breakdown card */}
        <Card>
          <CardHeading title="Your Earnings" />
          <DetailRow label="Your Base Rate"         value="PKR 2,800" />
          <DetailRow label="Complexity Adjustment"  value="+ PKR 0" />
          <DetailRow label="Your Earnings"          value="PKR 2,800" valueBold last />

          <div
            aria-hidden="true"
            style={{ height: "2px", backgroundColor: "#EFEFEF", margin: "8px 0" }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                flex: 1,
              }}
            >
              Haazir Subsidy (covers consumer discount)
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "20px",
                color: "#4CAF84",
                flexShrink: 0,
              }}
            >
              + PKR 151
            </span>
          </div>

          <p
            style={{
              margin: 0,
              marginTop: "4px",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: "16px",
              color: "#9B9B9B",
            }}
          >
            Your total payout: PKR 2,800. Consumer pays PKR 2,873.
          </p>
        </Card>

        {/* Consumer info card */}
        <Card>
          <CardHeading title="Consumer Info" />
          <DetailRow label="Name"            value="Sana M." />
          <DetailRow label="Flags / Disputes" value="None" valueColor="#4CAF84" last />
          <p
            style={{
              margin: 0,
              marginTop: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: "16px",
              color: "#9B9B9B",
            }}
          >
            Full address revealed only after you accept.
          </p>
        </Card>

        {/* Countdown reminder banner */}
        <div
          role="note"
          style={{
            backgroundColor: "#FFF4E0",
            border: "1px solid #F5A623",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <Clock
            size={20}
            color="#F5A623"
            aria-hidden="true"
            style={{ flexShrink: 0, marginTop: "1px" }}
          />
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
            You have {minutes} minute{minutes !== 1 ? "s" : ""} {secs} second{secs !== 1 ? "s" : ""} to respond. Auto-declines if no action.
          </p>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          height: "80px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #EFEFEF",
          display: "flex",
          alignItems: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onAccept}
          style={{
            flex: 2,
            height: "56px",
            borderRadius: "12px",
            backgroundColor: "#F5A623",
            border: "none",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          Accept Job
        </button>
        <button
          type="button"
          onClick={onDecline}
          style={{
            flex: 1,
            height: "56px",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #D94F4F",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            fontWeight: 500,
            lineHeight: "22px",
            color: "#D94F4F",
            cursor: "pointer",
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
};
