import React from "react";

interface HzCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  padding?: string | number;
  as?: "div" | "article" | "section" | "li";
}

export const HzCard: React.FC<HzCardProps> = ({
  children,
  onClick,
  style,
  padding = "16px",
  as: Tag = "div",
}) => (
  <Tag
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      border: "1px solid #E8E3DB",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      padding,
      cursor: onClick ? "pointer" : undefined,
      ...style,
    }}
  >
    {children}
  </Tag>
);
