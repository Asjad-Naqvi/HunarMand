import React, { useState } from "react";
import { ShoppingBag, Wrench, ChevronRight } from "lucide-react";

type Role = "consumer" | "provider" | null;

interface RoleCard {
  id: "consumer" | "provider";
  Icon: React.FC<{ size: number; color: string }>;
  title: string;
  description: string;
}

const CARDS: RoleCard[] = [
  {
    id: "consumer",
    Icon: ShoppingBag,
    title: "I need a service",
    description:
      "Find trusted providers for home and cleaning services in Islamabad.",
  },
  {
    id: "provider",
    Icon: Wrench,
    title: "I offer services",
    description:
      "Register as a provider and receive job requests from consumers.",
  },
];

interface HzRoleSelectionScreenProps {
  onSelect?: (role: "consumer" | "provider") => void;
}

export const HzRoleSelectionScreen: React.FC<HzRoleSelectionScreenProps> = ({
  onSelect,
}) => {
  const [selected, setSelected] = useState<Role>(null);

  const handleSelect = (id: "consumer" | "provider") => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF8F5",
        position: "relative",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Status bar — 24dp */}
      <div aria-hidden="true" style={{ height: "24px", flexShrink: 0 }} />

      {/* Content starts 48dp from top (24 status + 24 additional) */}
      <div
        style={{
          paddingTop: "24px",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingBottom: "120px",
          flex: 1,
        }}
      >
        {/* Logo mark — 28×28 */}
        <div
          aria-label="Haazir"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#F5A623",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1,
              color: "#FFFFFF",
            }}
          >
            H
          </span>
        </div>

        {/* Heading block */}
        <h1
          style={{
            margin: 0,
            marginTop: "16px",
            fontFamily: "Inter, sans-serif",
            fontSize: "24px",
            fontWeight: 600,
            lineHeight: "30px",
            color: "#1A1A1A",
          }}
        >
          Let's get started
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
          How will you be using Haazir?
        </p>

        {/* Role cards */}
        <div
          role="radiogroup"
          aria-label="Select your role"
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {CARDS.map(({ id, Icon, title, description }) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(id)}
                style={{
                  width: "100%",
                  height: "160px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: isSelected
                    ? "2px solid #F5A623"
                    : "1px solid #E8E3DB",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  position: "relative",
                  textAlign: "left",
                  transition: "border-color 0.15s ease",
                  boxSizing: "border-box",
                }}
              >
                {/* Icon */}
                <Icon size={36} color="#F5A623" aria-hidden="true" />

                {/* Title */}
                <span
                  style={{
                    display: "block",
                    marginTop: "8px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "18px",
                    fontWeight: 600,
                    lineHeight: "24px",
                    color: "#1A1A1A",
                  }}
                >
                  {title}
                </span>

                {/* Description */}
                <span
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    marginTop: "4px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: "18px",
                    color: "#9B9B9B",
                    paddingRight: "28px",
                  }}
                >
                  {description}
                </span>

                {/* Chevron — bottom-right */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    right: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight
                    size={20}
                    color={isSelected ? "#F5A623" : "#9B9B9B"}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer — pinned 48dp from bottom */}
      <p
        style={{
          position: "absolute",
          bottom: "48px",
          left: 0,
          right: 0,
          margin: 0,
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          fontWeight: 400,
          lineHeight: "15px",
          color: "#9B9B9B",
          textAlign: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        You can change your role later from Settings.
      </p>
    </div>
  );
};
