import React from "react";

interface HzInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  "aria-label"?: string;
}

export const HzInput: React.FC<HzInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  leadingIcon,
  trailingIcon,
  type = "text",
  disabled,
  "aria-label": ariaLabel,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    {label && (
      <label
        htmlFor={id}
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: "18px",
          color: "#1A1A1A",
        }}
      >
        {label}
      </label>
    )}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "56px",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E3DB",
        paddingLeft: "16px",
        paddingRight: "16px",
        gap: "10px",
      }}
    >
      {leadingIcon && (
        <span
          aria-hidden="true"
          style={{ color: "#9B9B9B", flexShrink: 0, display: "flex", alignItems: "center" }}
        >
          {leadingIcon}
        </span>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel ?? (label ? undefined : placeholder)}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 400,
          lineHeight: "22px",
          color: "#1A1A1A",
        }}
      />
      {trailingIcon && (
        <span
          aria-hidden="true"
          style={{ color: "#9B9B9B", flexShrink: 0, display: "flex", alignItems: "center" }}
        >
          {trailingIcon}
        </span>
      )}
    </div>
  </div>
);
