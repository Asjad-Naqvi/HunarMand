import React, { useState } from "react";
import { ArrowLeft, Sunrise, Sun, Moon, CircleCheck, Circle } from "lucide-react";
import { HzButton } from "./hz-button";

type TimeSlot = "morning" | "afternoon" | "evening";

interface TimeOption {
  id: TimeSlot;
  Icon: React.FC<{ size: number; color: string }>;
  label: string;
  range: string;
}

const OPTIONS: TimeOption[] = [
  { id: "morning",   Icon: Sunrise, label: "Morning",   range: "7am – 12pm" },
  { id: "afternoon", Icon: Sun,     label: "Afternoon", range: "12pm – 5pm" },
  { id: "evening",   Icon: Moon,    label: "Evening",   range: "5pm – 9pm"  },
];

interface HzProfileSetupStep3ScreenProps {
  onBack?: () => void;
  onFinish?: () => void;
}

export const HzProfileSetupStep3Screen: React.FC<HzProfileSetupStep3ScreenProps> = ({
  onBack,
  onFinish,
}) => {
  const [selected, setSelected] = useState<TimeSlot>("morning");

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

      {/* Step indicator — all 3 filled */}
      <div
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
        }}
      >
        <div
          role="progressbar"
          aria-valuenow={3}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label="Step 3 of 3"
          style={{ display: "flex", gap: "8px" }}
        >
          {[true, true, true].map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "12px",
                backgroundColor: "#F5A623",
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
          Step 3 of 3 — Preferred time
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
          When do you usually need services?
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
          This helps us suggest available providers.
        </p>

        {/* Time option cards */}
        <div
          role="radiogroup"
          aria-label="Preferred service time"
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {OPTIONS.map(({ id, Icon, label, range }) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(id)}
                style={{
                  width: "100%",
                  height: "64px",
                  borderRadius: "12px",
                  backgroundColor: isSelected ? "#FFF9F0" : "#FFFFFF",
                  border: `1px solid ${isSelected ? "#F5A623" : "#E8E3DB"}`,
                  padding: "0 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxSizing: "border-box",
                  transition: "background-color 0.15s ease, border-color 0.15s ease",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
                }}
              >
                {/* Leading icon */}
                <Icon
                  size={24}
                  color={isSelected ? "#F5A623" : "#9B9B9B"}
                  aria-hidden="true"
                />

                {/* Label + range */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "2px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "15px",
                      fontWeight: 600,
                      lineHeight: "20px",
                      color: "#1A1A1A",
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
                    }}
                  >
                    {range}
                  </span>
                </div>

                {/* Trailing check indicator */}
                {isSelected ? (
                  <CircleCheck
                    size={20}
                    color="#F5A623"
                    fill="#F5A623"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle size={20} color="#E8E3DB" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Skip hint */}
        <p
          style={{
            margin: 0,
            marginTop: "16px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
            textAlign: "center",
          }}
        >
          You can change this anytime from your profile.
        </p>

        {/* CTA */}
        <div style={{ marginTop: "32px" }}>
          <HzButton variant="primary" fullWidth onClick={onFinish}>
            Go to Haazir →
          </HzButton>
        </div>
      </div>
    </div>
  );
};
