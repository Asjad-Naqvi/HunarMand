import React, { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { HzButton } from "./hz-button";

interface HzProfileSetupScreenProps {
  onBack?: () => void;
  onNext?: () => void;
}

export const HzProfileSetupScreen: React.FC<HzProfileSetupScreenProps> = ({
  onBack,
  onNext,
}) => {
  const [name, setName] = useState("Sana Malik");

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
        {/* Back button */}
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

        {/* Centre title */}
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
        {/* Three bars */}
        <div
          role="progressbar"
          aria-valuenow={1}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label="Step 1 of 3"
          style={{ display: "flex", gap: "8px" }}
        >
          {[true, false, false].map((active, i) => (
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

        {/* Step label */}
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
          Step 1 of 3 — Your name
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
          What should we call you?
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
          This name appears on your bookings.
        </p>

        {/* Name input */}
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
          <User size={20} color="#9B9B9B" aria-hidden="true" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Full name"
            autoComplete="name"
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

        {/* Phone display — read-only */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                lineHeight: "15px",
                color: "#9B9B9B",
              }}
            >
              Phone number
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                lineHeight: "22px",
                color: "#9B9B9B",
              }}
            >
              +92 321 4567890
            </span>
          </div>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: "15px",
              color: "#9B9B9B",
              paddingBottom: "2px",
            }}
          >
            From registration
          </span>
        </div>
      </div>

      {/* CTA — pinned to bottom, 32dp above last content edge */}
      <div
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingBottom: "32px",
          paddingTop: "12px",
          backgroundColor: "#FAF8F5",
          flexShrink: 0,
        }}
      >
        <HzButton variant="primary" fullWidth onClick={onNext}>
          Next →
        </HzButton>
      </div>
    </div>
  );
};
