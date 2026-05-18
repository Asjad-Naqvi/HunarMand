import React, { useState } from "react";
import { ArrowLeft, Info, ArrowUp } from "lucide-react";

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

/* ─── Dispute type card ─── */
const DisputeTypeCard: React.FC = () => {
  const [selected, setSelected] = useState<"quality" | "incomplete">("quality");

  const options: { id: "quality" | "incomplete"; label: string }[] = [
    { id: "quality",    label: "The work quality was not acceptable"   },
    { id: "incomplete", label: "The provider did not complete the job"  },
  ];

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E8E3DB",
        padding: "16px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 500,
          lineHeight: "22px",
          color: "#1A1A1A",
        }}
      >
        Dispute Type
      </p>

      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {options.map(({ id, label }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(id)}
              style={{
                width: "100%",
                minHeight: "48px",
                borderRadius: "12px",
                backgroundColor: isSelected ? "#F5A623" : "#FFFFFF",
                border: isSelected ? "none" : "1px solid #E8E3DB",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "20px",
                color: isSelected ? "#FFFFFF" : "#1A1A1A",
                cursor: "pointer",
                padding: "10px 16px",
                textAlign: "left",
                transition: "background-color 0.15s ease",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Follow-up card ─── */
const FollowUpCard: React.FC = () => {
  const [selected, setSelected] = useState<"yes" | "no" | "refused">("yes");

  const options: { id: "yes" | "no" | "refused"; label: string }[] = [
    { id: "yes",     label: "Yes"           },
    { id: "no",      label: "No"            },
    { id: "refused", label: "They refused"  },
  ];

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E8E3DB",
        padding: "16px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 500,
          lineHeight: "22px",
          color: "#1A1A1A",
        }}
      >
        Did the provider agree to fix the issue on-site?
      </p>

      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {options.map(({ id, label }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(id)}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: isSelected ? "#F5A623" : "#FFFFFF",
                border: isSelected ? "none" : "1px solid #E8E3DB",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "20px",
                color: isSelected ? "#FFFFFF" : "#1A1A1A",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Main screen ─── */
interface HzDisputeChatScreenProps {
  onBack?: () => void;
}

export const HzDisputeChatScreen: React.FC<HzDisputeChatScreenProps> = ({ onBack }) => {
  const [message, setMessage] = useState("");

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
          Report an Issue
        </span>

        <button
          type="button"
          aria-label="More information"
          style={{
            marginLeft: "auto",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Info size={24} color="#9B9B9B" aria-hidden="true" />
        </button>
      </header>

      {/* Job context strip */}
      <div
        role="note"
        aria-label="AC Repairing with Ali Hassan, Booking 1042"
        style={{
          height: "48px",
          backgroundColor: "#FFF4E0",
          borderBottom: "1px solid #F5A623",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "18px",
            color: "#1A1A1A",
          }}
        >
          AC Repairing · Ali Hassan · Sat 18 May
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "16px",
            color: "#9B9B9B",
          }}
        >
          Booking #1042
        </span>
      </div>

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
        aria-label="Dispute chat"
        aria-live="polite"
      >
        <AgentBubble text="Main Haazir hoon. Aapka kaunsa masla hai? Mujhe batayein taake main aapki complaint properly file kar sakoon." />

        <DisputeTypeCard />

        <AgentBubble text="Theek hai, aapko quality se masla tha. Kya specifically galat tha? Please detail mein batayein." />

        <ConsumerBubble text="AC gas fill kiya tha lekin abhi bhi thanda nahi kar raha. Koi improvement nahi." />

        <FollowUpCard />
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
          placeholder="Describe the issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label="Describe the issue"
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
