import React, { useState } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  estimatedPrice: string;
  services: string;
  sectors: string;
  rating: number;
  reviewCount: number;
  onTime: string;
  availability: string;
  isRecommended?: boolean;
}

const PROVIDERS: Provider[] = [
  {
    id: "1",
    name: "Ali Hassan",
    estimatedPrice: "Est. PKR 2,800",
    services: "AC Repairing · AC Installation",
    sectors: "G-10, G-11, G-13, G-14",
    rating: 4.8,
    reviewCount: 32,
    onTime: "On time 94%",
    availability: "Available tomorrow 8am – 1pm",
    isRecommended: true,
  },
  {
    id: "2",
    name: "Usman Butt",
    estimatedPrice: "Est. PKR 2,400",
    services: "AC Repairing",
    sectors: "G-13, F-7, F-8",
    rating: 4.5,
    reviewCount: 18,
    onTime: "On time 88%",
    availability: "Available tomorrow 9am – 5pm",
  },
  {
    id: "3",
    name: "Rizwan Ahmed",
    estimatedPrice: "Est. PKR 3,100",
    services: "AC Repairing · AC General Service",
    sectors: "G-9, G-10, G-13",
    rating: 4.6,
    reviewCount: 44,
    onTime: "On time 91%",
    availability: "Available tomorrow 7am – 12pm",
  },
];

/* ── Pill badge ── */
const Pill: React.FC<{
  label: string;
  bg: string;
  color: string;
}> = ({ label, bg, color }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      paddingLeft: "12px",
      paddingRight: "12px",
      paddingTop: "4px",
      paddingBottom: "4px",
      borderRadius: "20px",
      backgroundColor: bg,
      fontFamily: "Inter, sans-serif",
      fontSize: "12px",
      fontWeight: 500,
      lineHeight: "16px",
      color,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

/* ── Provider card ── */
const ProviderCard: React.FC<{ provider: Provider; onViewProfile?: () => void }> = ({ provider, onViewProfile }) => (
  <article
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      borderLeft: "4px solid #4CAF84",
      borderTop: "1px solid #E8E3DB",
      borderRight: "1px solid #E8E3DB",
      borderBottom: "1px solid #E8E3DB",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "0px",
    }}
  >
    {/* Agent recommended pill */}
    {provider.isRecommended && (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
        <Pill label="⭐ Agent Recommended" bg="#F5A623" color="#FFFFFF" />
      </div>
    )}

    {/* Name + price */}
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: "22px",
          color: "#1A1A1A",
        }}
      >
        {provider.name}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "18px",
          fontWeight: 600,
          lineHeight: "24px",
          color: "#1A1A1A",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {provider.estimatedPrice}
      </span>
    </div>

    {/* Verified badge */}
    <div style={{ marginTop: "4px" }}>
      <Pill label="✓ Haazir Verified" bg="#4CAF84" color="#FFFFFF" />
    </div>

    {/* Services */}
    <span
      style={{
        display: "block",
        marginTop: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "18px",
        color: "#9B9B9B",
      }}
    >
      {provider.services}
    </span>

    {/* Sectors */}
    <span
      style={{
        display: "block",
        marginTop: "4px",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "16px",
        color: "#9B9B9B",
      }}
    >
      {provider.sectors}
    </span>

    {/* Stats row */}
    <div
      style={{
        marginTop: "8px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: "18px",
          color: "#1A1A1A",
        }}
      >
        ★ {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
      </span>
      <span style={{ color: "#E8E3DB", fontSize: "12px" }}>·</span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: "18px",
          color: "#4CAF84",
        }}
      >
        {provider.onTime}
      </span>
    </div>

    {/* Availability */}
    <div
      style={{
        marginTop: "4px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {/* Green dot */}
      <div
        aria-hidden="true"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "#4CAF84",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "16px",
          color: "#4CAF84",
        }}
      >
        {provider.availability}
      </span>
    </div>

    {/* View profile link */}
    <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
      <button
        type="button"
        aria-label={`View ${provider.name}'s profile`}
        onClick={onViewProfile}
        style={{
          background: "none",
          border: "none",
          padding: "4px 0",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: "18px",
          color: "#F5A623",
          cursor: "pointer",
          minHeight: "28px",
        }}
      >
        View Profile →
      </button>
    </div>
  </article>
);

/* ── Main screen ── */
interface HzProviderResultsScreenProps {
  onBack?: () => void;
  onViewProfile?: () => void;
}

export const HzProviderResultsScreen: React.FC<HzProviderResultsScreenProps> = ({ onBack, onViewProfile }) => {
  const [activeTab, setActiveTab] = useState<"haazir" | "maps">("haazir");

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
        {/* Back */}
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

        {/* Centred title */}
        <span
          style={{
            position: "absolute",
            left: "48px",
            right: "48px",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          AC Repair · G-13 · Tomorrow 9am
        </span>

        {/* Filter */}
        <button
          type="button"
          aria-label="Filter results"
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
          <SlidersHorizontal size={24} color="#1A1A1A" aria-hidden="true" />
        </button>
      </header>

      {/* Tab row */}
      <div
        role="tablist"
        aria-label="Provider source"
        style={{
          height: "48px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EFEFEF",
          display: "flex",
          alignItems: "stretch",
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
        }}
      >
        {(
          [
            { id: "haazir", label: "Haazir Providers (3)" },
            { id: "maps",   label: "Google Maps (5)"      },
          ] as const
        ).map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                borderBottom: isActive ? "3px solid #F5A623" : "3px solid transparent",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                lineHeight: "20px",
                color: isActive ? "#1A1A1A" : "#9B9B9B",
                transition: "color 0.15s ease, border-color 0.15s ease",
                padding: 0,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Scrollable results */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingBottom: "24px",
        }}
      >
        {/* Result count */}
        <p
          style={{
            margin: 0,
            marginTop: "12px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
          }}
        >
          Showing {PROVIDERS.length} registered providers
        </p>

        {/* Cards */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {PROVIDERS.map((p) => (
            <ProviderCard key={p.id} provider={p} onViewProfile={onViewProfile} />
          ))}
        </div>

        {/* Load more */}
        <button
          type="button"
          style={{
            marginTop: "16px",
            width: "100%",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E3DB",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "#9B9B9B",
            cursor: "pointer",
          }}
        >
          Load more providers
        </button>
      </div>
    </div>
  );
};
