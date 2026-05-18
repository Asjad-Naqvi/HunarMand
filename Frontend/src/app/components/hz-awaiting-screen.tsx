import React, { useState, useEffect } from "react";
import { BellRing, Clock } from "lucide-react";

/* ── Countdown hook ── */
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

/* ── Pulse rings (SVG) ── */
const PulseRings: React.FC = () => (
  <>
    {/* CSS keyframes injected inline */}
    <style>{`
      @keyframes hz-ring-pulse {
        0%   { opacity: 1;   transform: scale(0.92); }
        50%  { opacity: 0.5; transform: scale(1.04); }
        100% { opacity: 1;   transform: scale(0.92); }
      }
      .hz-ring-1 { animation: hz-ring-pulse 2.4s ease-in-out infinite; transform-origin: center; }
      .hz-ring-2 { animation: hz-ring-pulse 2.4s ease-in-out 0.4s infinite; transform-origin: center; }
      .hz-ring-3 { animation: hz-ring-pulse 2.4s ease-in-out 0.8s infinite; transform-origin: center; }
    `}</style>

    {/*
      Container 180×180 — centre = (90,90)
      Ring radii: 70 / 80 / 90  (diameters 140 / 160 / 180)
    */}
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      aria-hidden="true"
      style={{ position: "absolute", inset: "-30px" }}
    >
      <circle
        className="hz-ring-1"
        cx="90" cy="90" r="70"
        fill="none"
        stroke="#F5A623"
        strokeOpacity="0.20"
        strokeWidth="1.5"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />
      <circle
        className="hz-ring-2"
        cx="90" cy="90" r="80"
        fill="none"
        stroke="#F5A623"
        strokeOpacity="0.13"
        strokeWidth="1.5"
        strokeDasharray="4 9"
        strokeLinecap="round"
      />
      <circle
        className="hz-ring-3"
        cx="90" cy="90" r="90"
        fill="none"
        stroke="#F5A623"
        strokeOpacity="0.07"
        strokeWidth="1.5"
        strokeDasharray="4 11"
        strokeLinecap="round"
      />
    </svg>
  </>
);

/* ── Awaiting illustration ── */
const WaitingIllustration: React.FC = () => (
  <div
    style={{ position: "relative", width: "120px", height: "120px" }}
    aria-label="Waiting for provider response"
  >
    <PulseRings />
    {/* Main amber circle */}
    <div
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "#FFF4E0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      <BellRing size={56} color="#F5A623" aria-hidden="true" />
    </div>
  </div>
);

/* ── Summary row ── */
const SummaryRow: React.FC<{ label: string; value: string; last?: boolean }> = ({
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
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#1A1A1A",
      }}
    >
      {value}
    </span>
  </div>
);

/* ── Main screen ── */
interface HzAwaitingScreenProps {
  onCancel?: () => void;
  onAccepted?: () => void;
}

export const HzAwaitingScreen: React.FC<HzAwaitingScreenProps> = ({ onCancel, onAccepted }) => {
  const { display, seconds } = useCountdown(767); // 12:47
  const isLow = seconds <= 300; // ≤ 5 min

  /* Simulate provider accepting after 8 s for demo purposes */
  useEffect(() => {
    const t = setTimeout(() => onAccepted?.(), 8000);
    return () => clearTimeout(t);
  }, [onAccepted]);

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
      {/* Status bar — 24dp */}
      <div
        aria-hidden="true"
        style={{ height: "24px", flexShrink: 0, backgroundColor: "#FFFFFF" }}
      />

      {/* Top app bar — no back arrow */}
      <header
        style={{
          height: "56px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EFEFEF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
          }}
        >
          Waiting for Confirmation
        </span>
      </header>

      {/* Main content — vertically centred */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "16px",
          paddingBottom: "32px",
          overflowY: "auto",
        }}
      >
        {/* Illustration */}
        <WaitingIllustration />

        {/* Heading */}
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "Inter, sans-serif",
              fontSize: "20px",
              fontWeight: 600,
              lineHeight: "26px",
              color: "#1A1A1A",
            }}
          >
            Request sent to Ali Hassan
          </h1>
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
            Waiting for him to accept your booking.
          </p>
        </div>

        {/* Countdown timer */}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div
            role="timer"
            aria-label={`${display} remaining`}
            aria-live="polite"
            style={{
              height: "52px",
              borderRadius: "26px",
              backgroundColor: isLow ? "#E8872A" : "#F5A623",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              paddingLeft: "20px",
              paddingRight: "20px",
              transition: "background-color 0.4s ease",
              whiteSpace: "nowrap",
            }}
          >
            <Clock size={20} color="#FFFFFF" aria-hidden="true" />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 600,
                lineHeight: "22px",
                color: "#FFFFFF",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {display} remaining
            </span>
          </div>

          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              lineHeight: "15px",
              color: "#9B9B9B",
            }}
          >
            Auto-cancels if no response
          </span>
        </div>

        {/* Job summary mini-card */}
        <div
          style={{
            marginTop: "24px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
            border: "1px solid #E8E3DB",
            padding: "16px",
          }}
        >
          <SummaryRow label="Service"    value="AC Repairing" />
          <SummaryRow label="Location"   value="G-13, Islamabad" />
          <SummaryRow label="Date & Time" value="Sat 18 May · 9:00 AM" last />
        </div>

        {/* Cancel link */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            marginTop: "24px",
            background: "none",
            border: "none",
            padding: "12px 24px",
            minHeight: "48px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "20px",
            color: "#D94F4F",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Cancel Request
        </button>
      </main>
    </div>
  );
};
