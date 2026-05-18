import React, { useState } from "react";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { HzButton } from "./hz-button";

interface HzLoginScreenProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onForgotPassword?: () => void;
}

export const HzLoginScreen: React.FC<HzLoginScreenProps> = ({
  onLogin,
  onRegister,
  onForgotPassword,
}) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      {/* Status bar — 24dp */}
      <div aria-hidden="true" style={{ height: "24px", flexShrink: 0 }} />

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

      {/* Content */}
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
          Welcome Back
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
          Log in with your phone number.
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
          {/* Phone */}
          <Field
            label="Phone Number"
            leadingIcon={<Phone size={20} color="#9B9B9B" aria-hidden="true" />}
          >
            <input
              type="tel"
              placeholder="+92 3XX XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              style={inputStyle}
            />
          </Field>

          {/* Password */}
          <Field
            label="Password"
            leadingIcon={<Lock size={20} color="#9B9B9B" aria-hidden="true" />}
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={eyeButtonStyle}
              >
                {showPassword
                  ? <EyeOff size={20} color="#9B9B9B" aria-hidden="true" />
                  : <Eye size={20} color="#9B9B9B" aria-hidden="true" />}
              </button>
            }
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Forgot password */}
        <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onForgotPassword}
            style={{
              background: "none",
              border: "none",
              padding: "4px 0",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: "18px",
              color: "#F5A623",
              cursor: "pointer",
              textDecoration: "none",
              minHeight: "28px",
            }}
          >
            Forgot password?
          </button>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "16px" }}>
          <HzButton variant="primary" fullWidth onClick={onLogin}>
            Log In
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
          New to Haazir?{" "}
          <button
            type="button"
            onClick={onRegister}
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
            }}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

/* ── Shared styles ── */
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

const eyeButtonStyle: React.CSSProperties = {
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
};

/* ── Field wrapper ── */
interface FieldProps {
  label: string;
  leadingIcon: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, leadingIcon, trailingIcon, children }) => (
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
