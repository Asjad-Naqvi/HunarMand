import React from "react";

type BadgeVariant = "success" | "warning" | "danger" | "neutral";

interface HzBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const STYLES: Record<BadgeVariant, React.CSSProperties> = {
  success: { backgroundColor: "rgba(76, 175, 132, 0.12)", color: "#4CAF84" },
  warning: { backgroundColor: "rgba(232, 135, 42, 0.12)", color: "#E8872A" },
  danger:  { backgroundColor: "rgba(217, 79, 79, 0.12)",  color: "#D94F4F" },
  neutral: { backgroundColor: "#F0EDE8", color: "#555555" },
};

export const HzBadge: React.FC<HzBadgeProps> = ({ label, variant = "neutral" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: "24px",
      paddingLeft: "8px",
      paddingRight: "8px",
      borderRadius: "6px",
      fontFamily: "Inter, sans-serif",
      fontSize: "11px",
      fontWeight: 500,
      lineHeight: "15px",
      whiteSpace: "nowrap",
      ...STYLES[variant],
    }}
  >
    {label}
  </span>
);
