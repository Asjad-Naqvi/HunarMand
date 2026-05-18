import React from "react";

interface HzChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export const HzChip: React.FC<HzChipProps> = ({ label, selected = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: "32px",
      paddingLeft: "12px",
      paddingRight: "12px",
      borderRadius: "16px",
      border: selected ? "none" : "1px solid #E8E3DB",
      backgroundColor: selected ? "#F5A623" : "#FFFFFF",
      color: selected ? "#FFFFFF" : "#1A1A1A",
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      fontWeight: 500,
      lineHeight: "18px",
      cursor: "pointer",
      whiteSpace: "nowrap",
      flexShrink: 0,
      minWidth: 0,
      minHeight: "32px",
      transition: "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease",
    }}
  >
    {label}
  </button>
);
