import React, { useState } from "react";
import { Heart, User, MessageCircle, Clock } from "lucide-react";

/* ─── Types ─── */
type ChatTab = "chat" | "bookings" | "favourites" | "profile";

/* ─── Avatar ─── */
const Avatar: React.FC = () => (
  <div
    aria-hidden="true"
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      backgroundColor: "#E8E3DB",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <User size={22} color="#FFFFFF" aria-hidden="true" />
  </div>
);

/* ─── Favourite card ─── */
interface FavouriteCardProps {
  name: string;
  service: string;
  area: string;
  rating: string;
  reviewCount: number;
  onBook?: () => void;
  onViewProfile?: () => void;
}

const FavouriteCard: React.FC<FavouriteCardProps> = ({
  name,
  service,
  area,
  rating,
  reviewCount,
  onBook,
  onViewProfile,
}) => {
  const [saved, setSaved] = useState(true);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
        border: "1px solid #E8E3DB",
        padding: "16px",
      }}
    >
      {/* Top section: avatar + info + heart */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <Avatar />

        {/* Info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "22px",
              color: "#1A1A1A",
            }}
          >
            {name}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              height: "20px",
              paddingLeft: "8px",
              paddingRight: "8px",
              borderRadius: "10px",
              backgroundColor: "#4CAF84",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            ✓ Haazir Verified
          </span>

          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "18px",
              color: "#9B9B9B",
            }}
          >
            {service} · {area}
          </span>

          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "18px",
              color: "#9B9B9B",
            }}
          >
            ★ {rating} · {reviewCount} reviews
          </span>
        </div>

        {/* Heart toggle */}
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
          aria-pressed={saved}
          style={{
            background: "none",
            border: "none",
            padding: "4px",
            cursor: "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "32px",
            minHeight: "32px",
          }}
        >
          <Heart
            size={20}
            color={saved ? "#D94F4F" : "#E8E3DB"}
            fill={saved ? "#D94F4F" : "none"}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Divider */}
      <div
        aria-hidden="true"
        style={{ height: "1px", backgroundColor: "#EFEFEF", marginTop: "12px" }}
      />

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button
          type="button"
          onClick={onBook}
          style={{
            flex: 1,
            height: "40px",
            borderRadius: "12px",
            backgroundColor: "#F5A623",
            border: "none",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          Book Again
        </button>
        <button
          type="button"
          onClick={onViewProfile}
          style={{
            flex: 1,
            height: "40px",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E3DB",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "#1A1A1A",
            cursor: "pointer",
          }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

/* ─── Empty state hint ─── */
const EmptyStateHint: React.FC = () => (
  <div
    style={{
      marginTop: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      paddingBottom: "8px",
    }}
  >
    <Heart size={48} color="#E8E3DB" aria-hidden="true" />
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "22px",
        color: "#9B9B9B",
        textAlign: "center",
      }}
    >
      Save providers you trust
    </span>
    <p
      style={{
        margin: 0,
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#9B9B9B",
        textAlign: "center",
        maxWidth: "240px",
      }}
    >
      Tap the ♡ on any provider profile to save them here.
    </p>
  </div>
);

/* ─── Bottom nav ─── */
const TABS: { id: ChatTab; Icon: React.FC<{ size: number; color: string; fill?: string }>; label: string }[] = [
  { id: "chat",       Icon: MessageCircle, label: "Chat"       },
  { id: "bookings",   Icon: Clock,         label: "Bookings"   },
  { id: "favourites", Icon: Heart,         label: "Favourites" },
  { id: "profile",    Icon: User,          label: "Profile"    },
];

/* ─── Main screen ─── */
interface HzFavouritesScreenProps {
  onBook?: () => void;
  onViewProfile?: () => void;
  onTabChange?: (tab: ChatTab) => void;
}

export const HzFavouritesScreen: React.FC<HzFavouritesScreenProps> = ({
  onBook,
  onViewProfile,
  onTabChange,
}) => {
  const activeTab: ChatTab = "favourites";

  const PROVIDERS = [
    { name: "Ali Hassan",      service: "AC Repairing",  area: "G-13", rating: "4.8", reviewCount: 32 },
    { name: "Usman Butt",      service: "AC Repairing",  area: "F-7",  rating: "4.5", reviewCount: 18 },
    { name: "Tariq Mehmood",   service: "Sofa Cleaning", area: "G-10", rating: "4.7", reviewCount: 27 },
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
          justifyContent: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
          }}
        >
          Favourites
        </span>
      </header>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "16px",
          paddingBottom: "24px",
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "22px",
              color: "#1A1A1A",
            }}
          >
            Saved Providers
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "16px",
              color: "#9B9B9B",
            }}
          >
            {PROVIDERS.length} saved
          </span>
        </div>

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
            <FavouriteCard
              key={p.name}
              name={p.name}
              service={p.service}
              area={p.area}
              rating={p.rating}
              reviewCount={p.reviewCount}
              onBook={onBook}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>

        {/* Empty state hint */}
        <EmptyStateHint />
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
              <Icon
                size={24}
                color={color}
                fill={isActive && id === "favourites" ? "#F5A623" : "none"}
                aria-hidden="true"
              />
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
