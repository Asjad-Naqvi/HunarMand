import React from "react";
import { ArrowLeft, User, Info } from "lucide-react";
import { HzButton } from "./hz-button";

/* ── Shared row components ── */

const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  last?: boolean;
}> = ({ label, value, last }) => (
  <div
    style={{
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: last ? "none" : "1px solid #EFEFEF",
      gap: "12px",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "18px",
        color: "#9B9B9B",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20px",
        color: "#1A1A1A",
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
);

interface PriceRowProps {
  label: string;
  value: string;
  variant?: "default" | "subtotal" | "discount" | "total";
  borderBottom?: "thin" | "thick" | "none";
}

const PriceRow: React.FC<PriceRowProps> = ({
  label,
  value,
  variant = "default",
  borderBottom = "thin",
}) => {
  const isSubtotal = variant === "subtotal";
  const isDiscount = variant === "discount";
  const isTotal = variant === "total";

  const textColor = isDiscount ? "#F5A623" : "#1A1A1A";
  const fontWeight = isSubtotal || isTotal ? 600 : isDiscount ? 500 : 400;
  const fontSize = isTotal ? "18px" : isSubtotal ? "15px" : "14px";

  return (
    <div
      style={{
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom:
          borderBottom === "thick"
            ? "2px solid #EFEFEF"
            : borderBottom === "thin"
            ? "1px solid #EFEFEF"
            : "none",
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize,
          fontWeight,
          lineHeight: "20px",
          color: textColor,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize,
          fontWeight,
          lineHeight: "20px",
          color: textColor,
        }}
      >
        {value}
      </span>
    </div>
  );
};

const CardShell: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      border: "1px solid #E8E3DB",
      padding: "16px",
      ...style,
    }}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ title: string }> = ({ title }) => (
  <>
    <h2
      style={{
        margin: 0,
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "22px",
        color: "#1A1A1A",
      }}
    >
      {title}
    </h2>
    <div
      aria-hidden="true"
      style={{ height: "1px", backgroundColor: "#EFEFEF", margin: "8px 0" }}
    />
  </>
);

/* ── Main screen ── */
interface HzBookingConfirmationScreenProps {
  onBack?: () => void;
  onConfirm?: () => void;
}

export const HzBookingConfirmationScreen: React.FC<HzBookingConfirmationScreenProps> = ({
  onBack,
  onConfirm,
}) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#FAF8F5",
      overflow: "hidden",
    }}
  >
    {/* Status bar — 24dp */}
    <div
      aria-hidden="true"
      style={{ height: "24px", flexShrink: 0, backgroundColor: "#FFFFFF" }}
    />

    {/* Top app bar */}
    <header
      style={{
        height: "56px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #EFEFEF",
        display: "flex",
        alignItems: "center",
        paddingLeft: "4px",
        paddingRight: "16px",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        style={{
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <ArrowLeft size={24} color="#1A1A1A" aria-hidden="true" />
      </button>

      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: "17px",
          fontWeight: 600,
          lineHeight: "22px",
          color: "#1A1A1A",
          pointerEvents: "none",
        }}
      >
        Confirm Booking
      </span>
    </header>

    {/* Scrollable content */}
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "32px",
      }}
    >
      {/* ── Job summary card ── */}
      <div style={{ marginTop: "16px" }}>
        <CardShell>
          <CardHeader title="Booking Summary" />
          <DetailRow label="Service"    value="AC Repairing" />
          <DetailRow
            label="Provider"
            value={
              <span>
                Ali Hassan{" "}
                <span style={{ color: "#4CAF84", fontWeight: 500 }}>✓ Verified</span>
              </span>
            }
          />
          <DetailRow label="Location"   value="G-13, Islamabad" />
          <DetailRow
            label="Date & Time"
            value="Sat, 18 May 2025 · 9:00 AM"
            last
          />
        </CardShell>
      </div>

      {/* ── Price breakdown card ── */}
      <div style={{ marginTop: "16px" }}>
        <CardShell>
          <CardHeader title="Price Breakdown" />

          <PriceRow label="Base Rate (Complex job)" value="PKR 2,800" borderBottom="thin" />
          <PriceRow label="Urgency Factor (×1.0)"  value="PKR 0"     borderBottom="thin" />
          <PriceRow label="Platform Fee (8%)"       value="PKR 224"   borderBottom="thin" />
          <PriceRow
            label="Subtotal"
            value="PKR 3,024"
            variant="subtotal"
            borderBottom="thick"
          />
          <PriceRow
            label="Loyalty Discount (Bronze · 5%)"
            value="− PKR 151"
            variant="discount"
            borderBottom="thick"
          />
          <PriceRow
            label="Total Estimate"
            value="PKR 2,873"
            variant="total"
            borderBottom="none"
          />

          <p
            style={{
              margin: 0,
              marginTop: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              lineHeight: "15px",
              color: "#9B9B9B",
            }}
          >
            Payment is made directly to provider in cash. Final amount may vary slightly.
          </p>
        </CardShell>
      </div>

      {/* ── Provider mini card ── */}
      <div style={{ marginTop: "16px" }}>
        <CardShell>
          {/* Avatar + name + rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              aria-hidden="true"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#E8E3DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={20} color="#FFFFFF" aria-hidden="true" />
            </div>

            <span
              style={{
                flex: 1,
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                lineHeight: "22px",
                color: "#1A1A1A",
              }}
            >
              Ali Hassan
            </span>

            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                lineHeight: "18px",
                color: "#9B9B9B",
              }}
            >
              ★ 4.8
            </span>
          </div>

          {/* Subtext */}
          <p
            style={{
              margin: 0,
              marginTop: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "18px",
              color: "#9B9B9B",
            }}
          >
            Your request will be sent to Ali Hassan only. He has 15 minutes to respond.
          </p>
        </CardShell>
      </div>

      {/* ── Important note ── */}
      <div
        role="note"
        style={{
          marginTop: "16px",
          borderRadius: "12px",
          backgroundColor: "#FFF4E0",
          border: "1px solid #F5A623",
          padding: "16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <Info size={20} color="#F5A623" aria-hidden="true" style={{ flexShrink: 0, marginTop: "1px" }} />
        <p
          style={{
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "18px",
            color: "#1A1A1A",
          }}
        >
          Ali Hassan will be notified immediately. You cannot cancel after he accepts.
        </p>
      </div>
    </div>

    {/* ── Pinned bottom CTA ── */}
    <div
      style={{
        height: "72px",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #EFEFEF",
        paddingLeft: "16px",
        paddingRight: "16px",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <HzButton variant="primary" fullWidth onClick={onConfirm}>
        Confirm &amp; Notify Provider
      </HzButton>
    </div>
  </div>
);
