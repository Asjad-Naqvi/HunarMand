import React from "react";
import { Star } from "lucide-react";

interface HzStarRatingProps {
  rating: number;
  reviewCount?: number;
}

export const HzStarRating: React.FC<HzStarRatingProps> = ({ rating, reviewCount }) => (
  <div
    role="img"
    aria-label={`Rating: ${rating.toFixed(1)} out of 5${reviewCount !== undefined ? `, ${reviewCount} reviews` : ""}`}
    style={{ display: "flex", alignItems: "center", gap: "4px" }}
  >
    <Star size={12} fill="#F5A623" color="#F5A623" aria-hidden="true" />
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "18px",
        color: "#1A1A1A",
      }}
    >
      {rating.toFixed(1)}
    </span>
    {reviewCount !== undefined && (
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          fontWeight: 400,
          lineHeight: "15px",
          color: "#9B9B9B",
        }}
      >
        ({reviewCount})
      </span>
    )}
  </div>
);
