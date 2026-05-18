import React, { useState } from "react";
import { SlidersHorizontal, MessageCircle, Clock, Heart, User } from "lucide-react";
import { HzChip } from "./hz-chip";

/* ─── Types ─── */
type FilterChip = "all" | "completed" | "cancelled" | "upcoming";
type ChatTab = "chat" | "bookings" | "favourites" | "profile";

/* ─── Status pill ─── */
const StatusPill: React.FC<{ label: string; bg: string }> = ({ label, bg }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: "22px",
      paddingLeft: "8px",
      paddingRight: "8px",
      borderRadius: "11px",
      backgroundColor: bg,
      fontFamily: "Inter, sans-serif",
      fontSize: "12px",
      fontWeight: 500,
      lineHeight: "16px",
      color: "#FFFFFF",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    {label}
  </span>
);

/* ─── Booking card ─── */
interface BookingCardProps {
  service: string;
  status: { label: string; bg: string };
  extraPill?: { label: string; bg: string };
  provider?: string;
  datetime?: string;
  location: string;
  amount: string;
  cancellationReason?: string;
  showViewDetails?: boolean;
  onPress?: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  service,
  status,
  extraPill,
  provider,
  datetime,
  location,
  amount,
  cancellationReason,
  showViewDetails = true,
  onPress,
}) => (
  <button
    type="button"
    onClick={onPress}
    aria-label={`${service} booking, ${status.label}`}
    style={{
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      border: "1px solid #E8E3DB",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      cursor: "pointer",
      textAlign: "left",
      boxSizing: "border-box",
    }}
  >
    {/* Row 1: service + status */}
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "22px",
          color: "#1A1A1A",
          flex: 1,
        }}
      >
        {service}
      </span>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
        <StatusPill label={status.label} bg={status.bg} />
        {extraPill && <StatusPill label={extraPill.label} bg={extraPill.bg} />}
      </div>
    </div>

    {/* Cancellation reason (if any) */}
    {cancellationReason && (
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "16px",
          color: "#D94F4F",
        }}
      >
        {cancellationReason}
      </span>
    )}

    {/* Row 2: provider + datetime */}
    {(provider || datetime) && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        {provider && (
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "20px",
              color: "#9B9B9B",
              flex: 1,
            }}
          >
            {provider}
          </span>
        )}
        {datetime && (
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "18px",
              color: "#9B9B9B",
              flexShrink: 0,
            }}
          >
            {datetime}
          </span>
        )}
      </div>
    )}

    {/* Row 3: location */}
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "18px",
        color: "#9B9B9B",
      }}
    >
      {location}
    </span>

    {/* Row 4: amount + view details */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
          color: "#1A1A1A",
        }}
      >
        {amount}
      </span>
      {showViewDetails && (
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "#F5A623",
          }}
        >
          View details →
        </span>
      )}
    </div>
  </button>
);

/* ─── Bottom nav ─── */
const TABS: { id: ChatTab; Icon: React.FC<{ size: number; color: string }>; label: string }[] = [
  { id: "chat",       Icon: MessageCircle, label: "Chat"       },
  { id: "bookings",   Icon: Clock,         label: "Bookings"   },
  { id: "favourites", Icon: Heart,         label: "Favourites" },
  { id: "profile",    Icon: User,          label: "Profile"    },
];

/* ─── Main screen ─── */
interface HzBookingsScreenProps {
  onBack?: () => void;
  onTabChange?: (tab: ChatTab) => void;
}

export const HzBookingsScreen: React.FC<HzBookingsScreenProps> = ({ onBack, onTabChange }) => {
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const [activeTab] = useState<ChatTab>("bookings");

  const FILTERS: { id: FilterChip; label: string }[] = [
    { id: "all",       label: "All"       },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "upcoming",  label: "Upcoming"  },
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
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {/* Invisible spacer to balance the filter icon */}
        <span style={{ width: "24px", flexShrink: 0 }} aria-hidden="true" />

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
          My Bookings
        </span>

        <button
          type="button"
          aria-label="Filter and sort bookings"
          style={{
            marginLeft: "auto",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <SlidersHorizontal size={24} color="#1A1A1A" aria-hidden="true" />
        </button>
      </header>

      {/* Filter chips row */}
      <div
        style={{
          height: "48px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          overflowX: "auto",
          overflowY: "hidden",
          paddingLeft: "16px",
          gap: "8px",
          flexShrink: 0,
          scrollbarWidth: "none",
        }}
        aria-label="Filter bookings"
      >
        {FILTERS.map(({ id, label }) => (
          <HzChip
            key={id}
            label={label}
            selected={activeFilter === id}
            onClick={() => setActiveFilter(id)}
          />
        ))}
        {/* Trailing spacer so last chip isn't flush to edge */}
        <span style={{ width: "8px", flexShrink: 0 }} aria-hidden="true" />
      </div>

      {/* Booking list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "12px",
          paddingBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        aria-label="Booking list"
      >
        {/* Booking 1 — Upcoming */}
        <BookingCard
          service="AC Repairing"
          status={{ label: "Upcoming", bg: "#F5A623" }}
          provider="Ali Hassan"
          datetime="Sat 18 May · 9:00 AM"
          location="G-13, Islamabad"
          amount="PKR 2,873"
        />

        {/* Booking 2 — Completed */}
        <BookingCard
          service="Sofa Cleaning"
          status={{ label: "Completed", bg: "#4CAF84" }}
          provider="Tariq Mehmood"
          datetime="Tue 7 May · 11:00 AM"
          location="F-7, Islamabad"
          amount="PKR 1,500"
        />

        {/* Booking 3 — Completed + Dispute Filed */}
        <BookingCard
          service="Plumber"
          status={{ label: "Completed", bg: "#4CAF84" }}
          extraPill={{ label: "Dispute Filed", bg: "#E8872A" }}
          provider="Bilal Chaudhry"
          datetime="Mon 29 Apr · 2:00 PM"
          location="G-10, Islamabad"
          amount="PKR 800"
          showViewDetails={false}
        />

        {/* Booking 4 — Cancelled */}
        <BookingCard
          service="Electrician"
          status={{ label: "Cancelled", bg: "#9B9B9B" }}
          cancellationReason="Provider didn't respond"
          datetime="Sat 20 Apr · 10:00 AM"
          location="G-11, Islamabad"
          amount="PKR —"
          showViewDetails={false}
        />
      </div>

      {/* Bottom navigation */}
      <nav
        aria-label="Main navigation"
        style={{
          height: "64px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #EFEFEF",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {TABS.map(({ id, Icon, label }) => {
          const isActive = id === activeTab;
          const color = isActive ? "#F5A623" : "#9B9B9B";
          return (
            <button
              key={id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              onClick={() => !isActive && onTabChange?.(id)}
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                minWidth: "48px",
              }}
            >
              <Icon size={24} color={color} aria-hidden="true" />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: isActive ? 500 : 400,
                  lineHeight: "15px",
                  color,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
