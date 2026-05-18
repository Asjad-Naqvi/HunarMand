import React from "react";
import { MapPin } from "lucide-react";
import { HzCard } from "./hz-card";
import { HzStarRating } from "./hz-star-rating";
import { HzBadge } from "./hz-badge";

type AvailabilityStatus = "available" | "busy" | "scheduled";

interface HzServiceCardProps {
  name: string;
  serviceType: string;
  rating: number;
  reviewCount: number;
  location: string;
  price: string;
  availability: AvailabilityStatus;
  initials: string;
  onBook?: () => void;
}

const AVAIL_CONFIG: Record<AvailabilityStatus, { label: string; variant: "success" | "danger" | "warning" }> = {
  available:  { label: "Available Today", variant: "success" },
  busy:       { label: "Busy",            variant: "danger"  },
  scheduled:  { label: "By Appointment", variant: "warning" },
};

export const HzServiceCard: React.FC<HzServiceCardProps> = ({
  name,
  serviceType,
  rating,
  reviewCount,
  location,
  price,
  availability,
  initials,
  onBook,
}) => {
  const avail = AVAIL_CONFIG[availability];

  return (
    <HzCard as="article">
      <div style={{ display: "flex", gap: "12px" }}>
        {/* Avatar */}
        <div
          aria-hidden="true"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#F0EDE8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              color: "#1A1A1A",
            }}
          >
            {initials}
          </span>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Name + availability */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                lineHeight: "22px",
                color: "#1A1A1A",
              }}
            >
              {name}
            </span>
            <HzBadge label={avail.label} variant={avail.variant} />
          </div>

          {/* Service type */}
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "18px",
              color: "#9B9B9B",
            }}
          >
            {serviceType}
          </span>

          {/* Rating + location */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
            <HzStarRating rating={rating} reviewCount={reviewCount} />
            <span aria-hidden="true" style={{ color: "#E8E3DB", fontSize: "12px" }}>•</span>
            <div
              style={{ display: "flex", alignItems: "center", gap: "3px" }}
              aria-label={`Location: ${location}`}
            >
              <MapPin size={11} color="#9B9B9B" aria-hidden="true" />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: 400,
                  lineHeight: "15px",
                  color: "#9B9B9B",
                }}
              >
                {location}
              </span>
            </div>
          </div>

          {/* Price + book */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: "24px",
                color: "#1A1A1A",
              }}
            >
              {price}
            </span>
            <button
              type="button"
              onClick={onBook}
              aria-label={`Book ${name} for ${serviceType}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "36px",
                paddingLeft: "20px",
                paddingRight: "20px",
                borderRadius: "8px",
                backgroundColor: "#F5A623",
                color: "#FFFFFF",
                border: "none",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                minWidth: "48px",
                minHeight: "36px",
              }}
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </HzCard>
  );
};
