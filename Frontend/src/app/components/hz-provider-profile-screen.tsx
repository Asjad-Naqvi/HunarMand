import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Heart, User } from "lucide-react";
import { HzButton } from "./hz-button";

/* ── Small reusable pieces ── */

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2
    style={{
      margin: 0,
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
      fontWeight: 600,
      lineHeight: "22px",
      color: "#1A1A1A",
    }}
  >
    {title}
  </h2>
);

const Divider: React.FC = () => (
  <div
    aria-hidden="true"
    style={{ height: "1px", backgroundColor: "#EFEFEF", width: "100%" }}
  />
);

const ServiceChip: React.FC<{ label: string }> = ({ label }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: "28px",
      paddingLeft: "8px",
      paddingRight: "8px",
      borderRadius: "16px",
      backgroundColor: "#FFF4E0",
      border: "1px solid #F5A623",
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      fontWeight: 400,
      lineHeight: "18px",
      color: "#F5A623",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

const AreaChip: React.FC<{ label: string }> = ({ label }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: "28px",
      paddingLeft: "8px",
      paddingRight: "8px",
      borderRadius: "16px",
      backgroundColor: "#FFFFFF",
      border: "1px solid #E8E3DB",
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      fontWeight: 400,
      lineHeight: "18px",
      color: "#1A1A1A",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

const SCHEDULE: { day: string; hours: string | null }[] = [
  { day: "Monday",    hours: "8:00 AM – 5:00 PM" },
  { day: "Tuesday",   hours: "8:00 AM – 5:00 PM" },
  { day: "Wednesday", hours: null },
  { day: "Thursday",  hours: "8:00 AM – 5:00 PM" },
  { day: "Friday",    hours: "8:00 AM – 2:00 PM" },
  { day: "Saturday",  hours: "9:00 AM – 3:00 PM" },
  { day: "Sunday",    hours: null },
];

const RATINGS: { label: string; score: number }[] = [
  { label: "Quality of Work", score: 4.9 },
  { label: "Punctuality",     score: 4.7 },
  { label: "Communication",   score: 4.8 },
  { label: "Value for Money", score: 4.6 },
];

const REVIEWS: { reviewer: string; date: string; text: string }[] = [
  {
    reviewer: "Asma Tariq",
    date: "3 days ago",
    text: "AC nay pehli baar mein theek kar diya. Bohat professional tha. Zaroor book karuungi.",
  },
  {
    reviewer: "Hamza Malik",
    date: "1 week ago",
    text: "On time, neat work, and reasonable price. Highly recommend for G-13 area.",
  },
];

/* ── Review card with expand/collapse ── */
const ReviewCard: React.FC<{ reviewer: string; date: string; text: string }> = ({
  reviewer,
  date,
  text,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight);
  }, [text]);

  return (
    <article
      role="listitem"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
        border: "1px solid #E8E3DB",
        padding: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          aria-label="5 stars"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "#F5A623",
          }}
        >
          ★★★★★
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
          {reviewer} · {date}
        </span>
      </div>

      <p
        ref={textRef}
        style={{
          margin: 0,
          marginTop: "8px",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "20px",
          color: "#1A1A1A",
          ...(expanded
            ? {}
            : {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }),
        }}
      >
        {text}
      </p>

      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginTop: "4px",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "16px",
            color: "#F5A623",
            cursor: "pointer",
            display: "block",
          }}
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </article>
  );
};

/* ── Main screen ── */
interface HzProviderProfileScreenProps {
  onBack?: () => void;
  onBook?: () => void;
}

export const HzProviderProfileScreen: React.FC<HzProviderProfileScreenProps> = ({
  onBack,
  onBook,
}) => {
  const [saved, setSaved] = useState(false);

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

      {/* Top app bar */}
      <header
        style={{
          height: "56px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EFEFEF",
          display: "flex",
          alignItems: "center",
          paddingLeft: "4px",
          paddingRight: "4px",
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
            left: "48px",
            right: "48px",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
            pointerEvents: "none",
          }}
        >
          Provider Profile
        </span>

        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? "Remove from favourites" : "Save to favourites"}
          aria-pressed={saved}
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
            marginLeft: "auto",
          }}
        >
          <Heart
            size={24}
            color={saved ? "#D94F4F" : "#9B9B9B"}
            fill={saved ? "#D94F4F" : "none"}
            aria-hidden="true"
          />
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
          paddingBottom: "32px",
        }}
      >
        {/* ── Profile header card ── */}
        <div
          style={{
            marginTop: "16px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
            border: "1px solid #E8E3DB",
            padding: "16px",
          }}
        >
          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              aria-label="Provider photo placeholder"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#E8E3DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={28} color="#FFFFFF" aria-hidden="true" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  lineHeight: "26px",
                  color: "#1A1A1A",
                }}
              >
                Ali Hassan
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  height: "22px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRadius: "20px",
                  backgroundColor: "#4CAF84",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "16px",
                  color: "#FFFFFF",
                }}
              >
                ✓ Haazir Verified
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ marginTop: "12px", marginBottom: "12px" }}>
            <Divider />
          </div>

          {/* Stats row */}
          <div
            style={{ display: "flex", alignItems: "center" }}
            role="group"
            aria-label="Provider statistics"
          >
            {[
              { value: "4.8", label: "Rating"   },
              { value: "32",  label: "Reviews"  },
              { value: "94%", label: "On Time"  },
            ].map(({ value, label }, i, arr) => (
              <React.Fragment key={label}>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      lineHeight: "26px",
                      color: "#1A1A1A",
                    }}
                  >
                    {value}
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
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    aria-hidden="true"
                    style={{ width: "1px", height: "32px", backgroundColor: "#EFEFEF" }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Divider */}
          <div style={{ marginTop: "12px", marginBottom: "12px" }}>
            <Divider />
          </div>

          {/* Member since */}
          <p
            style={{
              margin: 0,
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              lineHeight: "15px",
              color: "#9B9B9B",
              textAlign: "center",
            }}
          >
            Member since January 2025
          </p>
        </div>

        {/* ── Services ── */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Services Offered" />
          <div
            style={{
              marginTop: "8px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
            role="list"
            aria-label="Services offered"
          >
            {["AC Repairing", "AC Installation", "AC General Service", "AC Dismounting"].map(
              (s) => (
                <div key={s} role="listitem">
                  <ServiceChip label={s} />
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Service Areas ── */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Service Areas" />
          <div
            style={{
              marginTop: "8px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
            role="list"
            aria-label="Service areas"
          >
            {["G-10", "G-11", "G-13", "G-14", "F-7", "F-8"].map((a) => (
              <div key={a} role="listitem">
                <AreaChip label={a} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Schedule ── */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Weekly Schedule" />
          <div
            style={{ marginTop: "8px" }}
            role="table"
            aria-label="Weekly availability schedule"
          >
            {SCHEDULE.map(({ day, hours }) => (
              <div
                key={day}
                role="row"
                style={{
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #EFEFEF",
                }}
              >
                <span
                  role="cell"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#1A1A1A",
                  }}
                >
                  {day}
                </span>
                <span
                  role="cell"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: hours ? "#1A1A1A" : "#9B9B9B",
                  }}
                >
                  {hours ?? "Unavailable"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ratings Breakdown ── */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Rating Breakdown" />
          <div style={{ marginTop: "8px" }} role="list" aria-label="Rating breakdown">
            {RATINGS.map(({ label, score }) => (
              <div
                key={label}
                role="listitem"
                style={{
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #EFEFEF",
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#1A1A1A",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    color: "#1A1A1A",
                  }}
                >
                  {score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Reviews ── */}
        <div style={{ marginTop: "24px" }}>
          <SectionHeader title="Recent Reviews" />
          <div
            style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "12px" }}
            role="list"
            aria-label="Recent reviews"
          >
            {REVIEWS.map(({ reviewer, date, text }) => (
              <ReviewCard key={reviewer} reviewer={reviewer} date={date} text={text} />
            ))}
          </div>
        </div>

        {/* ── Dispute count ── */}
        <p
          style={{
            margin: 0,
            marginTop: "24px",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "16px",
            color: "#4CAF84",
          }}
        >
          0 formal disputes
        </p>
      </div>

      {/* ── Pinned bottom CTA ── */}
      <div
        style={{
          height: "72px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #EFEFEF",
          paddingLeft: "16px",
          paddingRight: "16px",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <HzButton variant="primary" fullWidth onClick={onBook}>
          Book Ali Hassan — Est. PKR 2,800
        </HzButton>
      </div>
    </div>
  );
};
