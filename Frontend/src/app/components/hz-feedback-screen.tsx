import React, { useState } from "react";
import { HzButton } from "./hz-button";

/* ── Rating dimension ── */
interface RatingDimensionProps {
  label: string;
  score: number;
  onChange: (score: number) => void;
}

const RatingDimension: React.FC<RatingDimensionProps> = ({ label, score, onChange }) => (
  <div>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: "20px",
        color: "#1A1A1A",
      }}
    >
      {label}
    </span>

    {/* Circle row */}
    <div
      role="radiogroup"
      aria-label={`${label} rating`}
      style={{
        marginTop: "4px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {Array.from({ length: 10 }, (_, i) => {
        const value = i + 1;
        const isFilled = value <= score;
        const isSelected = value === score;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${value}`}
            onClick={() => onChange(value)}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: isFilled ? "#F5A623" : "transparent",
              border: isFilled ? "none" : "1.5px solid #E8E3DB",
              cursor: "pointer",
              padding: 0,
              transform: isSelected ? "scale(1.15)" : "scale(1)",
              boxShadow: isSelected
                ? "0px 2px 8px rgba(245, 166, 35, 0.45)"
                : "none",
              transition: "transform 0.12s ease, box-shadow 0.12s ease",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>

    {/* Score label */}
    <p
      style={{
        margin: 0,
        marginTop: "4px",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "16px",
        color: "#9B9B9B",
        textAlign: "right",
      }}
    >
      {score} / 10
    </p>
  </div>
);

/* ── Main screen ── */
interface HzFeedbackScreenProps {
  onSubmit?: () => void;
  onSkip?: () => void;
}

export const HzFeedbackScreen: React.FC<HzFeedbackScreenProps> = ({
  onSubmit,
  onSkip,
}) => {
  const [scores, setScores] = useState({
    quality:       7,
    punctuality:   8,
    communication: 7,
    value:         6,
  });
  const [review, setReview] = useState("");

  const setScore = (key: keyof typeof scores) => (val: number) =>
    setScores((prev) => ({ ...prev, [key]: val }));

  const average =
    (scores.quality + scores.punctuality + scores.communication + scores.value) / 4;

  const DIMENSIONS: { key: keyof typeof scores; label: string }[] = [
    { key: "quality",       label: "Quality of Work" },
    { key: "punctuality",   label: "Punctuality"     },
    { key: "communication", label: "Communication"   },
    { key: "value",         label: "Value for Money" },
  ];

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
          justifyContent: "space-between",
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {/* Invisible spacer mirrors the Skip button width */}
        <span style={{ width: "32px", flexShrink: 0 }} aria-hidden="true" />

        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
          }}
        >
          Rate Your Experience
        </span>

        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip rating"
          style={{
            background: "none",
            border: "none",
            padding: "8px 0",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "#9B9B9B",
            cursor: "pointer",
            minHeight: "44px",
            flexShrink: 0,
          }}
        >
          Skip
        </button>
      </header>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "24px",
          paddingBottom: "32px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Heading */}
        <div style={{ textAlign: "center" }}>
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
            How was your experience?
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
            with Ali Hassan · AC Repairing · G-13
          </p>
        </div>

        {/* Rating dimensions */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {DIMENSIONS.map(({ key, label }) => (
            <RatingDimension
              key={key}
              label={label}
              score={scores[key]}
              onChange={setScore(key)}
            />
          ))}
        </div>

        {/* Overall average */}
        <p
          style={{
            margin: 0,
            marginTop: "16px",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
            textAlign: "center",
          }}
        >
          Your overall score:{" "}
          <span style={{ color: "#F5A623" }}>{average.toFixed(1)}</span>
          {" "}/ 10
        </p>

        {/* Written review */}
        <div style={{ marginTop: "24px" }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              color: "#1A1A1A",
            }}
          >
            Leave a review (optional)
          </span>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience to help other consumers..."
            aria-label="Written review"
            style={{
              display: "block",
              width: "100%",
              height: "120px",
              marginTop: "4px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8E3DB",
              padding: "16px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "20px",
              color: "#1A1A1A",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <p
            style={{
              margin: 0,
              marginTop: "4px",
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              lineHeight: "15px",
              color: "#9B9B9B",
            }}
          >
            Reviews are visible on Ali Hassan's profile.
          </p>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "24px" }}>
          <HzButton variant="primary" fullWidth onClick={onSubmit}>
            Submit Rating
          </HzButton>
        </div>
      </div>
    </div>
  );
};
