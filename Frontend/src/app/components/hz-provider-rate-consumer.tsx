import React, { useState } from "react";

/* ─── Rating dimension ─── */
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
              flexShrink: 0,
              transform: isSelected ? "scale(1.15)" : "scale(1)",
              boxShadow: isSelected ? "0px 2px 8px rgba(245, 166, 35, 0.45)" : "none",
              transition: "transform 0.12s ease, box-shadow 0.12s ease",
            }}
          />
        );
      })}
    </div>

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

/* ─── Main screen ─── */
interface HzProviderRateConsumerProps {
  onSubmit?: () => void;
  onSkip?: () => void;
}

export const HzProviderRateConsumer: React.FC<HzProviderRateConsumerProps> = ({
  onSubmit,
  onSkip,
}) => {
  const [scores, setScores] = useState({
    punctuality: 9,
    behaviour:   8,
    instructions: 7,
    payment:     10,
  });
  const [note, setNote] = useState("");

  const setScore = (key: keyof typeof scores) => (val: number) =>
    setScores((prev) => ({ ...prev, [key]: val }));

  const average =
    (scores.punctuality + scores.behaviour + scores.instructions + scores.payment) / 4;

  const DIMENSIONS: { key: keyof typeof scores; label: string }[] = [
    { key: "punctuality",  label: "Punctuality (Was consumer on-time?)" },
    { key: "behaviour",    label: "Behaviour / Conduct"                 },
    { key: "instructions", label: "Clear Instructions"                  },
    { key: "payment",      label: "Payment Promptness"                  },
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
          justifyContent: "space-between",
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <span style={{ width: "32px", flexShrink: 0 }} aria-hidden="true" />

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
          Rate This Consumer
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
            marginLeft: "auto",
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
        {/* Heading block */}
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
            How was Sana?
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
            Rate the consumer for future providers.
          </p>
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
            These notes are visible to future providers (not the consumer).
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
          Consumer score:{" "}
          <span style={{ color: "#F5A623" }}>{average.toFixed(1)}</span>
          {" "}/ 10
        </p>

        {/* Note input */}
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
            Leave a note for other providers (optional)
          </span>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Consumer is punctual and pays on time."
            aria-label="Note for other providers"
            style={{
              display: "block",
              width: "100%",
              height: "100px",
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
            Note is private — only visible to future Haazir providers.
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onSubmit}
          style={{
            display: "block",
            width: "100%",
            height: "72px",
            marginTop: "24px",
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
          Submit Rating
        </button>
      </div>
    </div>
  );
};
