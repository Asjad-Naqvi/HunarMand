import React, { useState } from "react";
import { User, Phone, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { HzButton } from "./hz-button";

interface HzRegistrationScreenProps {
  onCreateAccount?: () => void;
  onLogin?: () => void;
}

export const HzRegistrationScreen: React.FC<HzRegistrationScreenProps> = ({
  onCreateAccount,
  onLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

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
      {/* Status bar — 24dp, system-style placeholder */}
      <div
        aria-hidden="true"
        style={{ height: "24px", flexShrink: 0, backgroundColor: "#FAF8F5" }}
      />

      {/* Top bar — 56dp */}
      <div
        style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
        }}
      >
        {/* Logo mark */}
        <div
          aria-label="Haazir"
          style={{
            width: "32px",
            height: "32px",
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
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1,
              color: "#FFFFFF",
            }}
          >
            H
          </span>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "16px",
          paddingBottom: "32px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Heading */}
        <h1
          style={{
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontSize: "24px",
            fontWeight: 600,
            lineHeight: "30px",
            color: "#1A1A1A",
          }}
        >
          Create Account
        </h1>
        <p
          style={{
            margin: 0,
            marginTop: "4px",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "18px",
            color: "#9B9B9B",
          }}
        >
          Phone required · Email optional
        </p>

        {/* Fields */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Full Name */}
          <FieldWrapper
            id="full-name"
            label="Full Name"
            leadingIcon={<User size={20} color="#9B9B9B" aria-hidden="true" />}
          >
            <input
              id="full-name"
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              style={inputStyle}
            />
          </FieldWrapper>

          {/* Phone */}
          <FieldWrapper
            id="phone"
            label="Phone Number"
            leadingIcon={<Phone size={20} color="#9B9B9B" aria-hidden="true" />}
          >
            <input
              id="phone"
              type="tel"
              placeholder="+92 3XX XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              style={inputStyle}
            />
          </FieldWrapper>

          {/* Password */}
          <FieldWrapper
            id="password"
            label="Password"
            leadingIcon={<Lock size={20} color="#9B9B9B" aria-hidden="true" />}
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "32px",
                  minHeight: "32px",
                  color: "#9B9B9B",
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9B9B9B" aria-hidden="true" />
                ) : (
                  <Eye size={20} color="#9B9B9B" aria-hidden="true" />
                )}
              </button>
            }
          >
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={inputStyle}
            />
          </FieldWrapper>

          {/* Email (optional) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <FieldWrapper
              id="email"
              label="Email address (optional)"
              leadingIcon={<Mail size={20} color="#9B9B9B" aria-hidden="true" />}
            >
              <input
                id="email"
                type="email"
                placeholder="Email address (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                style={inputStyle}
              />
            </FieldWrapper>
            <p
              style={{
                margin: 0,
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                lineHeight: "15px",
                color: "#9B9B9B",
                paddingLeft: "4px",
              }}
            >
              We use email for account recovery only.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "24px" }}>
          <HzButton variant="primary" fullWidth onClick={onCreateAccount}>
            Create Account
          </HzButton>
        </div>

        {/* Footer link */}
        <p
          style={{
            margin: 0,
            marginTop: "16px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "#9B9B9B",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              color: "#F5A623",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

/* ── Shared field wrapper ── */
const inputStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  fontFamily: "Inter, sans-serif",
  fontSize: "15px",
  fontWeight: 400,
  lineHeight: "22px",
  color: "#1A1A1A",
  minWidth: 0,
};

interface FieldWrapperProps {
  id: string;
  label: string;
  leadingIcon: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  id,
  label,
  leadingIcon,
  trailingIcon,
  children,
}) => (
  <div
    role="group"
    aria-label={label}
    style={{
      display: "flex",
      alignItems: "center",
      height: "56px",
      borderRadius: "12px",
      backgroundColor: "#FFFFFF",
      border: "1px solid #E8E3DB",
      paddingLeft: "16px",
      paddingRight: trailingIcon ? "8px" : "16px",
      gap: "10px",
    }}
  >
    {leadingIcon}
    {children}
    {trailingIcon}
  </div>
);
