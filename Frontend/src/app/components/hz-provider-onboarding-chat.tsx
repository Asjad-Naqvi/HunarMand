import React, { useState } from "react";
import { ArrowUp } from "lucide-react";

/* ─── Step indicator strip ─── */
const StepStrip: React.FC<{ step: number; total: number; stepName: string }> = ({
  step,
  total,
  stepName,
}) => (
  <div
    style={{
      height: "48px",
      backgroundColor: "#FAF8F5",
      borderBottom: "1px solid #EFEFEF",
      paddingLeft: "16px",
      paddingRight: "16px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "4px",
      flexShrink: 0,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: "18px",
          color: "#9B9B9B",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Step {step} of {total}
      </span>
      {/* Step bar */}
      <div
        style={{
          flex: 1,
          height: "4px",
          borderRadius: "2px",
          backgroundColor: "#E8E3DB",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${step} of ${total}`}
      >
        <div
          style={{
            width: `${(step / total) * 100}%`,
            height: "100%",
            backgroundColor: "#F5A623",
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 400,
        lineHeight: "15px",
        color: "#9B9B9B",
      }}
    >
      {stepName}
    </span>
  </div>
);

/* ─── Agent bubble ─── */
const AgentBubble: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: "flex", justifyContent: "flex-start" }}>
    <div
      style={{
        maxWidth: "280px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E3DB",
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.06)",
        borderRadius: "4px 18px 18px 18px",
        padding: "16px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 400,
          lineHeight: "22px",
          color: "#1A1A1A",
        }}
      >
        {text}
      </p>
    </div>
  </div>
);

/* ─── Consumer bubble ─── */
const ConsumerBubble: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <div
      style={{
        maxWidth: "280px",
        backgroundColor: "#F5A623",
        borderRadius: "18px 4px 18px 18px",
        padding: "16px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 400,
          lineHeight: "22px",
          color: "#FFFFFF",
        }}
      >
        {text}
      </p>
    </div>
  </div>
);

/* ─── Service chip ─── */
const ServiceChip: React.FC<{
  label: string;
  selected: boolean;
  onToggle: () => void;
}> = ({ label, selected, onToggle }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={selected}
    onClick={onToggle}
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
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      fontWeight: 500,
      lineHeight: "18px",
      color: selected ? "#FFFFFF" : "#1A1A1A",
      cursor: "pointer",
      whiteSpace: "nowrap",
      flexShrink: 0,
      transition: "background-color 0.15s ease, color 0.15s ease",
    }}
  >
    {label}
  </button>
);

/* ─── Service selection card ─── */
const HOME_SERVICES = [
  "AC Repairing",
  "AC General Service",
  "AC Installation",
  "Carpenter Work",
  "Electrician",
  "Plumber",
  "Painter",
  "Water Tank Installation",
  "Gas Geyser Repairing",
  "Electric Geyser Repairing",
  "CCTV Installation",
  "Door Lock Repair",
  "Ceiling Fan Repair",
];

const CLEANING_SERVICES = [
  "Sofa Cleaning",
  "Carpet Cleaning",
  "Solar Panel Cleaning",
  "Bed Cleaning",
  "Kitchen Cleaning",
  "Bathroom Cleaning",
  "Office Cleaning",
];

interface ServiceSelectionCardProps {
  onConfirm?: (selected: string[]) => void;
}

const ServiceSelectionCard: React.FC<ServiceSelectionCardProps> = ({ onConfirm }) => {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["AC Repairing", "AC General Service", "AC Installation"])
  );

  const toggle = (service: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(service) ? next.delete(service) : next.add(service);
      return next;
    });

  const selectedList = [...selected];

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E8E3DB",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
        padding: "16px",
      }}
    >
      {/* Home Services */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
          color: "#1A1A1A",
        }}
      >
        Home Services
      </span>
      <div
        style={{
          marginTop: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
        role="group"
        aria-label="Home services"
      >
        {HOME_SERVICES.map((s) => (
          <ServiceChip
            key={s}
            label={s}
            selected={selected.has(s)}
            onToggle={() => toggle(s)}
          />
        ))}
      </div>

      {/* Cleaning Services */}
      <span
        style={{
          display: "block",
          marginTop: "16px",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
          color: "#1A1A1A",
        }}
      >
        Cleaning Services
      </span>
      <div
        style={{
          marginTop: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
        role="group"
        aria-label="Cleaning services"
      >
        {CLEANING_SERVICES.map((s) => (
          <ServiceChip
            key={s}
            label={s}
            selected={selected.has(s)}
            onToggle={() => toggle(s)}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        aria-hidden="true"
        style={{ height: "1px", backgroundColor: "#EFEFEF", marginTop: "12px" }}
      />
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "16px",
            color: "#9B9B9B",
          }}
        >
          {selectedList.length} service{selectedList.length !== 1 ? "s" : ""} selected
        </span>
        <button
          type="button"
          onClick={() => onConfirm?.(selectedList)}
          style={{
            background: "none",
            border: "none",
            padding: "4px",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "#F5A623",
            cursor: "pointer",
          }}
        >
          Confirm →
        </button>
      </div>
    </div>
  );
};

/* ─── Main screen ─── */
interface HzProviderOnboardingChatProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export const HzProviderOnboardingChat: React.FC<HzProviderOnboardingChatProps> = ({ onComplete }) => {
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF8F5",
        overflow: "hidden",
      }}
    >
      {/* Status bar */}
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
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            lineHeight: "22px",
            color: "#1A1A1A",
          }}
        >
          Provider Registration
        </span>
      </header>

      {/* Step indicator strip */}
      <StepStrip step={4} total={9} stepName="Services Offered" />

      {/* Chat scroll area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "12px",
          paddingBottom: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        role="log"
        aria-label="Provider onboarding chat"
        aria-live="polite"
      >
        <AgentBubble text="Shukriya, Zain! Step 4: Aap kaunsi services offer karte hain? Neeche se select karein — aap multiple select kar sakte hain." />

        <ServiceSelectionCard onConfirm={() => { setConfirmed(true); onComplete?.(); }} />

        <ConsumerBubble text="AC Repairing, AC General Service, AC Installation" />

        <AgentBubble text="Perfect! AC Repairing, AC General Service, AC Installation. Step 5: Aap Islamabad ke kaunse sectors mein service dete hain?" />
      </div>

      {/* Chat input bar */}
      <div
        style={{
          height: "56px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #EFEFEF",
          display: "flex",
          alignItems: "center",
          paddingLeft: "16px",
          paddingRight: "12px",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          placeholder="Type or select an option above..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label="Type a message"
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
            minWidth: 0,
          }}
        />
        <button
          type="button"
          aria-label="Send message"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#F5A623",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowUp size={20} color="#FFFFFF" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
