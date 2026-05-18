import React from "react";

type Variant = "primary" | "secondary" | "danger";

interface HzButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: "#F5A623",
    color: "#FFFFFF",
    border: "none",
  },
  secondary: {
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
    border: "1px solid #E8E3DB",
  },
  danger: {
    backgroundColor: "#D94F4F",
    color: "#FFFFFF",
    border: "none",
  },
};

export const HzButton: React.FC<HzButtonProps> = ({
  variant = "primary",
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}) => (
  <button
    {...props}
    disabled={disabled}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "56px",
      borderRadius: "12px",
      paddingLeft: "24px",
      paddingRight: "24px",
      width: fullWidth ? "100%" : "auto",
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
      fontWeight: 600,
      lineHeight: "24px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      boxShadow: "none",
      transition: "opacity 0.15s ease",
      minHeight: "48px",
      ...VARIANT_STYLES[variant],
      ...style,
    }}
  >
    {children}
  </button>
);
