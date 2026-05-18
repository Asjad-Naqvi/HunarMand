import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  MessageCircle,
  Clock,
  Heart,
  User,
} from "lucide-react";

/* ─── Types ─── */
type ChatTab = "chat" | "bookings" | "favourites" | "profile";

/* ─── Thinking block ─── */
const ThinkingBlock: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const fullText =
    "Parsing consumer input... Detected: AC not working → HS-04 (AC Repairing). Severity signals: 'bilkul kaam nahi kar raha' → +1 complexity tier → Intermediate → Complex. Requested slot: tomorrow morning. Location: G-13...";

  return (
    <div
      style={{
        backgroundColor: "#F0EDE8",
        borderRadius: "12px",
        borderLeft: "3px solid #F5A623",
        padding: "16px",
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label="Toggle Haazir's reasoning panel"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Sparkles size={16} color="#F5A623" aria-hidden="true" />
        <span
          style={{
            flex: 1,
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: "16px",
            color: "#1A1A1A",
          }}
        >
          Haazir's Reasoning — Intent Extraction
        </span>
        {expanded ? (
          <ChevronUp size={16} color="#9B9B9B" aria-hidden="true" />
        ) : (
          <ChevronDown size={16} color="#9B9B9B" aria-hidden="true" />
        )}
      </button>

      {/* Body */}
      <div style={{ marginTop: "8px" }}>
        <p
          style={{
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: "18px",
            color: "#555555",
            display: expanded ? "block" : "-webkit-box",
            WebkitLineClamp: expanded ? undefined : 3,
            WebkitBoxOrient: expanded ? undefined : "vertical",
            overflow: expanded ? "visible" : "hidden",
          }}
        >
          {fullText}
        </p>
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              marginTop: "4px",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "#F5A623",
              cursor: "pointer",
            }}
          >
            Show more ↓
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Clarification card ─── */
const ClarificationCard: React.FC = () => {
  const [selected, setSelected] = useState<"residential" | "commercial">("residential");

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E8E3DB",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
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
        Is this for residential or commercial use?
      </p>

      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {(
          [
            { id: "residential", label: "Ghar (Residential)" },
            { id: "commercial",  label: "Office / Commercial" },
          ] as const
        ).map(({ id, label }) => {
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
                height: "44px",
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

/* ─── Agent bubble ─── */
const AgentBubble: React.FC<{ text: string; time?: string }> = ({ text, time }) => (
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
      {time && (
        <p
          style={{
            margin: 0,
            marginTop: "4px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "#9B9B9B",
            textAlign: "right",
          }}
        >
          {time}
        </p>
      )}
    </div>
  </div>
);

/* ─── Consumer bubble ─── */
const ConsumerBubble: React.FC<{ text: string; time?: string }> = ({ text, time }) => (
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
      {time && (
        <p
          style={{
            margin: 0,
            marginTop: "4px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "15px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "right",
          }}
        >
          {time}
        </p>
      )}
    </div>
  </div>
);

/* ─── Re-initiate search card ─── */
interface ReinitiateCardProps {
  onFindProvider?: () => void;
  onCancelSearch?: () => void;
}

const ReinitiateCard: React.FC<ReinitiateCardProps> = ({ onFindProvider, onCancelSearch }) => (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      border: "1px solid #E8E3DB",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.07)",
      padding: "16px",
    }}
  >
    {/* Status badge */}
    <span
      style={{
        display: "inline-block",
        backgroundColor: "#E8872A",
        borderRadius: "16px",
        padding: "3px 10px",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 500,
        lineHeight: "18px",
        color: "#FFFFFF",
      }}
    >
      Provider Declined
    </span>

    {/* Heading */}
    <p
      style={{
        margin: 0,
        marginTop: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "22px",
        color: "#1A1A1A",
      }}
    >
      Looking for another provider?
    </p>

    {/* Job summary rows */}
    <div style={{ marginTop: "12px" }}>
      {[
        { label: "Service",    value: "AC Repairing"         },
        { label: "Location",   value: "G-13, Islamabad"       },
        { label: "Date & Time", value: "Sat 18 May · 9:00 AM" },
      ].map(({ label, value }, i, arr) => (
        <div
          key={label}
          style={{
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: i < arr.length - 1 ? "1px solid #EFEFEF" : "none",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "18px",
              color: "#9B9B9B",
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
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>

    {/* Decline info */}
    <p
      style={{
        margin: 0,
        marginTop: "12px",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 400,
        fontStyle: "italic",
        lineHeight: "18px",
        color: "#9B9B9B",
      }}
    >
      Usman Butt declined this request. He has been excluded from this search.
    </p>

    {/* CTA button */}
    <button
      type="button"
      onClick={onFindProvider}
      style={{
        display: "block",
        width: "100%",
        height: "48px",
        marginTop: "12px",
        borderRadius: "12px",
        backgroundColor: "#F5A623",
        border: "none",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: "20px",
        color: "#FFFFFF",
        cursor: "pointer",
      }}
    >
      Find Another Provider
    </button>

    {/* Secondary link */}
    <div style={{ marginTop: "8px", textAlign: "center" }}>
      <button
        type="button"
        onClick={onCancelSearch}
        style={{
          background: "none",
          border: "none",
          padding: "4px",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          fontWeight: 400,
          lineHeight: "18px",
          color: "#9B9B9B",
          cursor: "pointer",
        }}
      >
        Cancel and start a new search
      </button>
    </div>
  </div>
);

/* ─── Main screen ─── */
interface HzChatScreenProps {
  onTabChange?: (tab: ChatTab) => void;
  onViewResults?: () => void;
  onFindProvider?: () => void;
}

export const HzChatScreen: React.FC<HzChatScreenProps> = ({ onTabChange, onViewResults, onFindProvider }) => {
  const [activeTab, setActiveTab] = useState<ChatTab>("chat");
  const [thinkingOn, setThinkingOn] = useState(false);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleTab = (tab: ChatTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const TABS: { id: ChatTab; Icon: React.FC<{ size: number; color: string }>; label: string }[] = [
    { id: "chat",       Icon: MessageCircle, label: "Chat"       },
    { id: "bookings",   Icon: Clock,         label: "Bookings"   },
    { id: "favourites", Icon: Heart,         label: "Favourites" },
    { id: "profile",    Icon: User,          label: "Profile"    },
  ];

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
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
          justifyContent: "space-between",
        }}
      >
        {/* Left: logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            aria-hidden="true"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#F5A623",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 600, color: "#FFFFFF", lineHeight: 1 }}>
              H
            </span>
          </div>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              lineHeight: "22px",
              color: "#1A1A1A",
            }}
          >
            Haazir
          </span>
        </div>

        {/* Right: thinking toggle */}
        <button
          type="button"
          onClick={() => setThinkingOn((v) => !v)}
          aria-pressed={thinkingOn}
          aria-label={thinkingOn ? "Disable thinking mode" : "Enable thinking mode"}
          style={{
            width: "80px",
            height: "32px",
            borderRadius: "16px",
            backgroundColor: thinkingOn ? "#FFF3DC" : "#E8E3DB",
            border: thinkingOn ? "1px solid #F5A623" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            gap: "4px",
            padding: "0 10px",
          }}
        >
          {thinkingOn && <Sparkles size={11} color="#F5A623" aria-hidden="true" />}
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
              color: thinkingOn ? "#F5A623" : "#9B9B9B",
              whiteSpace: "nowrap",
            }}
          >
            {thinkingOn ? "Thinking On" : "Thinking Off"}
          </span>
        </button>
      </header>

      {/* Active booking banner */}
      <div
        role="status"
        aria-label="Active job: AC Repair with Ali Hassan"
        style={{
          height: "48px",
          backgroundColor: "#FFF8EC",
          borderLeft: "4px solid #F5A623",
          display: "flex",
          alignItems: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          flexShrink: 0,
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "#1A1A1A",
          }}
        >
          Active Job · AC Repair · Ali Hassan
        </span>
        <button
          type="button"
          onClick={onViewResults}
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
            minHeight: "32px",
          }}
        >
          View →
        </button>
      </div>

      {/* Chat scroll area */}
      <div
        ref={scrollRef}
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
        aria-label="Chat messages"
        aria-live="polite"
      >
        <AgentBubble
          text="Assalam o Alaikum! Main Haazir hoon. Aapko kaunsi service chahiye? Bas batayein — Urdu mein, English mein, ya jis tarah chaahein."
          time="2:14 PM"
        />

        <ConsumerBubble
          text="AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye"
          time="2:15 PM"
        />

        <ThinkingBlock />

        <AgentBubble
          text="Samajh gaya! Lagta hai aapka AC completely band hai. Main aapke liye G-13 mein best AC technician dhundh raha hoon. Ek cheez confirm karein:"
        />

        <ClarificationCard />

        <ConsumerBubble text="Ghar ke liye hai." time="2:16 PM" />

        <AgentBubble
          text="G-13 mein AC technician mil gaya — Usman Butt. Booking request bhej diya hai."
          time="2:16 PM"
        />

        <ReinitiateCard
          onFindProvider={onFindProvider}
          onCancelSearch={() => {}}
        />
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
          placeholder="Message Haazir..."
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

      {/* Bottom navigation */}
      <nav
        aria-label="Main navigation"
        style={{
          height: "64px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #EFEFEF",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {TABS.map(({ id, Icon, label }) => {
          const isActive = id === activeTab;
          const color = isActive ? "#F5A623" : "#9B9B9B";
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTab(id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                minWidth: "48px",
              }}
            >
              <Icon size={24} color={color} aria-hidden="true" />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: isActive ? 500 : 400,
                  lineHeight: "15px",
                  color,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
