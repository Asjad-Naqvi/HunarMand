import React, { useState } from "react";
import { Bell, ChevronDown, Search, MapPin } from "lucide-react";
import { HzInput } from "./hz-input";
import { HzChip } from "./hz-chip";
import { HzServiceCard } from "./hz-service-card";
import { HzHeading, HzBody, HzCaption } from "./hz-typography";

const CATEGORIES = [
  "All",
  "AC Repair",
  "Plumber",
  "Electrician",
  "Cleaning",
  "Painter",
  "Carpenter",
];

const PROVIDERS = [
  {
    id: "1",
    name: "Ali Hassan",
    initials: "AH",
    serviceType: "AC Repair & Service",
    rating: 4.8,
    reviewCount: 127,
    location: "G-10",
    price: "PKR 2,500",
    availability: "available" as const,
  },
  {
    id: "2",
    name: "Usman Butt",
    initials: "UB",
    serviceType: "Plumber",
    rating: 4.6,
    reviewCount: 89,
    location: "F-7",
    price: "PKR 1,800",
    availability: "available" as const,
  },
  {
    id: "3",
    name: "Rizwan Ahmed",
    initials: "RA",
    serviceType: "Electrician",
    rating: 4.9,
    reviewCount: 203,
    location: "I-8",
    price: "PKR 2,000",
    availability: "available" as const,
  },
  {
    id: "4",
    name: "Babar Khan",
    initials: "BK",
    serviceType: "Sofa Cleaning",
    rating: 4.5,
    reviewCount: 64,
    location: "E-11",
    price: "PKR 3,500",
    availability: "scheduled" as const,
  },
  {
    id: "5",
    name: "Tariq Mehmood",
    initials: "TM",
    serviceType: "Painter",
    rating: 4.7,
    reviewCount: 41,
    location: "D-12",
    price: "PKR 4,200",
    availability: "available" as const,
  },
];

export const HzHomeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchValue, setSearchValue] = useState("");

  const filteredProviders = PROVIDERS.filter((p) => {
    const matchesCategory =
      activeCategory === "All" ||
      p.serviceType.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      !searchValue ||
      p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.serviceType.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.location.toLowerCase().includes(searchValue.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF8F5",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EFEFEF",
          padding: "16px 16px 12px",
        }}
      >
        {/* Location row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <button
            type="button"
            aria-label="Change location: G-13, Islamabad"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              minHeight: "48px",
            }}
          >
            <MapPin size={16} color="#F5A623" aria-hidden="true" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <HzCaption style={{ color: "#9B9B9B" }}>Your location</HzCaption>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    lineHeight: "22px",
                    color: "#1A1A1A",
                  }}
                >
                  G-13, Islamabad
                </span>
                <ChevronDown size={14} color="#9B9B9B" aria-hidden="true" />
              </div>
            </div>
          </button>

          <button
            type="button"
            aria-label="Notifications"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#FAF8F5",
              border: "1px solid #E8E3DB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              minWidth: "48px",
              minHeight: "48px",
            }}
          >
            <Bell size={20} color="#1A1A1A" aria-hidden="true" />
          </button>
        </div>

        {/* Greeting */}
        <HzHeading as="h1" style={{ marginBottom: "4px" }}>
          Good morning, Ali 👋
        </HzHeading>
        <HzBody style={{ color: "#9B9B9B", marginBottom: "16px" }}>
          What service do you need today?
        </HzBody>

        {/* Search */}
        <HzInput
          placeholder="Search services, providers…"
          value={searchValue}
          onChange={setSearchValue}
          leadingIcon={<Search size={18} />}
          aria-label="Search services and providers"
        />
      </header>

      {/* Category chips */}
      <div
        role="group"
        aria-label="Filter by service category"
        style={{
          display: "flex",
          gap: "8px",
          padding: "16px 16px 8px",
          overflowX: "auto",
          scrollbarWidth: "none",
          flexShrink: 0,
        }}
      >
        {CATEGORIES.map((cat) => (
          <HzChip
            key={cat}
            label={cat}
            selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Providers list */}
      <main
        style={{
          flex: 1,
          padding: "8px 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {/* Section header */}
        <div style={{ marginTop: "16px", marginBottom: "12px" }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: "22px",
              color: "#1A1A1A",
            }}
          >
            Popular Near You
          </span>
          {filteredProviders.length > 0 && (
            <HzCaption style={{ marginLeft: "8px" }}>
              {filteredProviders.length} providers
            </HzCaption>
          )}
        </div>

        {filteredProviders.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 24px",
              gap: "8px",
            }}
          >
            <Search size={32} color="#E8E3DB" aria-hidden="true" />
            <HzBody style={{ color: "#9B9B9B", textAlign: "center" }}>
              No providers found. Try a different search or category.
            </HzBody>
          </div>
        ) : (
          <ul
            aria-label="Service providers"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {filteredProviders.map((p) => (
              <li key={p.id}>
                <HzServiceCard
                  name={p.name}
                  initials={p.initials}
                  serviceType={p.serviceType}
                  rating={p.rating}
                  reviewCount={p.reviewCount}
                  location={p.location}
                  price={p.price}
                  availability={p.availability}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
