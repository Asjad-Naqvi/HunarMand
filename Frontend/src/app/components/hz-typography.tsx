import React from "react";

const base: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface TextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const HzHeading: React.FC<TextProps & { as?: "h1" | "h2" | "h3" }> = ({
  children,
  className,
  style,
  as: Tag = "h2",
}) => (
  <Tag
    className={className}
    style={{
      ...base,
      fontSize: "22px",
      fontWeight: 600,
      lineHeight: "28px",
      color: "#1A1A1A",
      margin: 0,
      ...style,
    }}
  >
    {children}
  </Tag>
);

export const HzBody: React.FC<TextProps & { as?: "p" | "span" | "div" }> = ({
  children,
  className,
  style,
  as: Tag = "p",
}) => (
  <Tag
    className={className}
    style={{
      ...base,
      fontSize: "15px",
      fontWeight: 400,
      lineHeight: "22px",
      color: "#1A1A1A",
      margin: 0,
      ...style,
    }}
  >
    {children}
  </Tag>
);

export const HzLabel: React.FC<TextProps & { as?: "span" | "p" | "label" }> = ({
  children,
  className,
  style,
  as: Tag = "span",
}) => (
  <Tag
    className={className}
    style={{
      ...base,
      fontSize: "13px",
      fontWeight: 500,
      lineHeight: "18px",
      color: "#1A1A1A",
      ...style,
    }}
  >
    {children}
  </Tag>
);

export const HzCaption: React.FC<TextProps & { as?: "p" | "span" }> = ({
  children,
  className,
  style,
  as: Tag = "span",
}) => (
  <Tag
    className={className}
    style={{
      ...base,
      fontSize: "11px",
      fontWeight: 400,
      lineHeight: "15px",
      color: "#9B9B9B",
      ...style,
    }}
  >
    {children}
  </Tag>
);

export const HzPrice: React.FC<TextProps> = ({ children, className, style }) => (
  <span
    className={className}
    style={{
      ...base,
      fontSize: "18px",
      fontWeight: 600,
      lineHeight: "24px",
      color: "#1A1A1A",
      ...style,
    }}
  >
    {children}
  </span>
);

export const HzThinking: React.FC<TextProps> = ({ children, className, style }) => (
  <p
    className={className}
    style={{
      ...base,
      fontSize: "12px",
      fontWeight: 400,
      fontStyle: "italic",
      lineHeight: "18px",
      color: "#555555",
      margin: 0,
      ...style,
    }}
  >
    {children}
  </p>
);
