import React, { useState } from "react";
import { ArrowLeft, Tag, MapPin } from "lucide-react";
import { HzButton } from "./hz-button";

interface HzProfileSetupStep2ScreenProps {
  onBack?: () => void;
  onNext?: () => void;
}

export const HzProfileSetupStep2Screen: React.FC<HzProfileSetupStep2ScreenProps> = ({
  onBack,
  onNext,
}) => {
  const [label, setLabel] = useState("");
  const [pinDropped, setPinDropped] = useState(false);

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
      <div aria-hidden="true" style={{ height: "24px", flexShrink: 0 }} />

      {/* Top bar — 56dp */}
      <div
        style={{
          height: "56px",
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
          Profile Setup
        </span>
      </div>

      {/* Step indicator */}
      <div
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
        }}
      >
        <div
          role="progressbar"
          aria-valuenow={2}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label="Step 2 of 3"
          style={{ display: "flex", gap: "8px" }}
        >
          {[true, true, false].map((active, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "12px",
                backgroundColor: active ? "#F5A623" : "#E8E3DB",
              }}
            />
          ))}
        </div>

        <p
          style={{
            margin: 0,
            marginTop: "8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
          }}
        >
          Step 2 of 3 — Add your address
        </p>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "24px",
          paddingBottom: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Heading */}
        <h1
          style={{
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontSize: "22px",
            fontWeight: 600,
            lineHeight: "28px",
            color: "#1A1A1A",
          }}
        >
          Where do you need services?
        </h1>
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
          Add at least one address. You can add more later.
        </p>

        {/* Address label input */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            height: "56px",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E3DB",
            paddingLeft: "16px",
            paddingRight: "16px",
            gap: "10px",
          }}
        >
          <Tag size={20} color="#9B9B9B" aria-hidden="true" />
          <input
            type="text"
            placeholder="Address label (e.g. Home, Office)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            aria-label="Address label"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              lineHeight: "22px",
              color: "#1A1A1A",
              minWidth: 0,
            }}
          />
        </div>

        {/* Map placeholder */}
        <button
          type="button"
          onClick={() => setPinDropped(true)}
          aria-label="Tap to drop a pin on the map"
          style={{
            marginTop: "16px",
            width: "100%",
            height: "160px",
            borderRadius: "12px",
            backgroundColor: pinDropped ? "#E8E3DB" : "#E8E3DB",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Map grid lines for visual texture */}
          <svg
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}
            preserveAspectRatio="none"
          >
            {/* Horizontal lines */}
            {[32, 64, 96, 128].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="358" y2={y} stroke="#9B9B9B" strokeWidth="1" />
            ))}
            {/* Vertical lines */}
            {[58, 116, 174, 232, 290].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="160" stroke="#9B9B9B" strokeWidth="1" />
            ))}
          </svg>

          {pinDropped ? (
            <MapPin size={32} color="#F5A623" fill="#F5A623" aria-hidden="true" />
          ) : (
            <MapPin size={32} color="#9B9B9B" aria-hidden="true" />
          )}
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "20px",
              color: "#9B9B9B",
              textAlign: "center",
              paddingLeft: "24px",
              paddingRight: "24px",
              position: "relative",
            }}
          >
            {pinDropped ? "Pin dropped — G-13, Islamabad" : "Tap to drop a pin on the map"}
          </span>
        </button>

        {/* Sector hint */}
        <p
          style={{
            margin: 0,
            marginTop: "8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
          }}
        >
          Your pin will auto-detect the Islamabad sector.
        </p>

        {/* CTA — 32dp below sector hint */}
        <div style={{ marginTop: "32px" }}>
          <HzButton variant="primary" fullWidth onClick={onNext}>
            Next →
          </HzButton>
        </div>
      </div>
    </div>
  );
};
