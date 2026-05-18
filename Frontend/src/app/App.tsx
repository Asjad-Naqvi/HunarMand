import React, { useState, useEffect, useRef } from "react";
import { HzHomeScreen } from "./components/hz-home-screen";
import { HzBottomNav, HzNavTabId } from "./components/hz-bottom-nav";
import { HzSplashScreen } from "./components/hz-splash-screen";
import { HzRegistrationScreen } from "./components/hz-registration-screen";
import { HzLoginScreen } from "./components/hz-login-screen";
import { HzRoleSelectionScreen } from "./components/hz-role-selection-screen";
import { HzProfileSetupScreen } from "./components/hz-profile-setup-screen";
import { HzProfileSetupStep2Screen } from "./components/hz-profile-setup-step2-screen";
import { HzProfileSetupStep3Screen } from "./components/hz-profile-setup-step3-screen";
import { HzChatScreen } from "./components/hz-chat-screen";
import { HzProviderResultsScreen } from "./components/hz-provider-results-screen";
import { HzProviderProfileScreen } from "./components/hz-provider-profile-screen";
import { HzBookingConfirmationScreen } from "./components/hz-booking-confirmation-screen";
import { HzAwaitingScreen } from "./components/hz-awaiting-screen";
import { HzBookingConfirmedScreen } from "./components/hz-booking-confirmed-screen";
import { HzActiveJobScreen } from "./components/hz-active-job-screen";
import { HzFeedbackScreen } from "./components/hz-feedback-screen";
import { HzBookingsScreen } from "./components/hz-bookings-screen";
import { HzFavouritesScreen } from "./components/hz-favourites-screen";
import { HzProfileScreen } from "./components/hz-profile-screen";
import { HzDisputeChatScreen } from "./components/hz-dispute-chat-screen";
import { HzDisputeStatusScreen } from "./components/hz-dispute-status-screen";
import { HzProviderOnboardingChat } from "./components/hz-provider-onboarding-chat";
import { HzProviderDashboard } from "./components/hz-provider-dashboard";
import { HzProviderInbox } from "./components/hz-provider-inbox";
import { HzProviderJobRequest } from "./components/hz-provider-job-request";
import { HzProviderActiveJob } from "./components/hz-provider-active-job";
import { HzProviderRateConsumer } from "./components/hz-provider-rate-consumer";
import { HzProviderPastJobs } from "./components/hz-provider-past-jobs";
import { HzProviderProfile } from "./components/hz-provider-profile";
import { HzProviderDisputeChat } from "./components/hz-provider-dispute-chat";
import { HzProviderDisputeStatus } from "./components/hz-provider-dispute-status";
import { HzHeading, HzBody } from "./components/hz-typography";
import { CalendarDays, Search, User } from "lucide-react";

type AppScreen = "splash" | "register" | "role-select" | "profile-setup" | "profile-setup-2" | "profile-setup-3" | "login" | "chat" | "provider-results" | "provider-profile" | "booking-confirm" | "awaiting" | "booking-confirmed" | "active-job" | "feedback" | "bookings" | "favourites" | "consumer-profile" | "dispute-chat" | "dispute-status" | "provider-onboarding" | "provider-dashboard" | "provider-inbox" | "provider-job-request" | "provider-active-job" | "provider-rate-consumer" | "provider-past-jobs" | "provider-settings" | "provider-dispute-chat" | "provider-dispute-status" | "main";

/* ─── Placeholder screens for non-home tabs ─── */
const PlaceholderScreen: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => (
  <div
    style={{
      flex: 1,
      backgroundColor: "#FAF8F5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      padding: "32px",
    }}
  >
    <div style={{ color: "#E8E3DB" }}>{icon}</div>
    <HzHeading as="h1" style={{ textAlign: "center" }}>
      {title}
    </HzHeading>
    <HzBody style={{ color: "#9B9B9B", textAlign: "center" }}>{subtitle}</HzBody>
  </div>
);

/* ─── Android-style status bar ─── */
const StatusBar: React.FC = () => (
  <div
    aria-hidden="true"
    style={{
      height: "28px",
      backgroundColor: "#FFFFFF",
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
        fontSize: "12px",
        fontWeight: 600,
        color: "#1A1A1A",
      }}
    >
      9:41
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {/* Signal bars */}
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
        <rect x="0" y="8"  width="3" height="4" rx="1" fill="#1A1A1A" />
        <rect x="4" y="5"  width="3" height="7" rx="1" fill="#1A1A1A" />
        <rect x="8" y="2"  width="3" height="10" rx="1" fill="#1A1A1A" />
        <rect x="12" y="0" width="3" height="12" rx="1" fill="#1A1A1A" />
      </svg>
      {/* WiFi */}
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
        <path d="M8 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="#1A1A1A" />
        <path d="M5.172 7.172a4 4 0 0 1 5.656 0" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2.343 4.343a8 8 0 0 1 11.314 0" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* Battery */}
      <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
        <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="#1A1A1A" />
        <rect x="2" y="2" width="14" height="8" rx="1.5" fill="#1A1A1A" />
        <path d="M19.5 4v4a1.5 1.5 0 0 0 0-4z" fill="#1A1A1A" />
      </svg>
    </div>
  </div>
);

/* ─── Root App ─── */
export default function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>("splash");
  const [activeTab, setActiveTab] = useState<HzNavTabId>("home");
  const [scale, setScale] = useState(1);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAppScreen("register"), 2500);
    return () => clearTimeout(timer);
  }, []);

  /* Scale the 390×844 frame to always fit the preview container */
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const compute = () => {
      const { width, height } = el.getBoundingClientRect();
      const s = Math.min((width - 32) / 390, (height - 32) / 844, 1);
      setScale(Math.max(s, 0.3));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HzHomeScreen />;
      case "explore":
        return (
          <PlaceholderScreen
            icon={<Search size={48} />}
            title="Explore Services"
            subtitle="Browse all available services across Islamabad sectors."
          />
        );
      case "bookings":
        return (
          <PlaceholderScreen
            icon={<CalendarDays size={48} />}
            title="Your Bookings"
            subtitle="View upcoming and past service appointments here."
          />
        );
      case "profile":
        return (
          <PlaceholderScreen
            icon={<User size={48} />}
            title="Profile"
            subtitle="Manage your account, preferences, and payment methods."
          />
        );
      default:
        return <HzHomeScreen />;
    }
  };

  return (
    /* Outer shell — inherits parent dimensions from the Figma Make container */
    <div
      ref={shellRef}
      className="size-full"
      style={{
        backgroundColor: "#E8E3DB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Android phone frame — 390 × 844, scaled to fit */}
      <div
        style={{
          width: "390px",
          height: "844px",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
          backgroundColor: "#FFFFFF",
          borderRadius: "40px",
          boxShadow:
            "0 0 0 8px #1A1A1A, 0 32px 64px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
        role="main"
        aria-label="Haazir app preview"
      >
        {appScreen === "splash" ? (
          /* ── Splash: full-bleed, no chrome ── */
          <HzSplashScreen />
        ) : appScreen === "register" ? (
          <HzRegistrationScreen
            onCreateAccount={() => setAppScreen("role-select")}
            onLogin={() => setAppScreen("login")}
          />
        ) : appScreen === "role-select" ? (
          <HzRoleSelectionScreen
            onSelect={(role) =>
              setAppScreen(role === "provider" ? "provider-onboarding" : "profile-setup")
            }
          />
        ) : appScreen === "profile-setup" ? (
          <HzProfileSetupScreen
            onBack={() => setAppScreen("role-select")}
            onNext={() => setAppScreen("profile-setup-2")}
          />
        ) : appScreen === "profile-setup-2" ? (
          <HzProfileSetupStep2Screen
            onBack={() => setAppScreen("profile-setup")}
            onNext={() => setAppScreen("profile-setup-3")}
          />
        ) : appScreen === "profile-setup-3" ? (
          <HzProfileSetupStep3Screen
            onBack={() => setAppScreen("profile-setup-2")}
            onFinish={() => setAppScreen("chat")}
          />
        ) : appScreen === "chat" ? (
          <HzChatScreen
            onViewResults={() => setAppScreen("active-job")}
            onFindProvider={() => setAppScreen("provider-results")}
            onTabChange={(tab) => {
              if (tab === "bookings")   setAppScreen("bookings");
              if (tab === "favourites") setAppScreen("favourites");
              if (tab === "profile")    setAppScreen("consumer-profile");
            }}
          />
        ) : appScreen === "provider-results" ? (
          <HzProviderResultsScreen
            onBack={() => setAppScreen("chat")}
            onViewProfile={() => setAppScreen("provider-profile")}
          />
        ) : appScreen === "provider-profile" ? (
          <HzProviderProfileScreen
            onBack={() => setAppScreen("provider-results")}
            onBook={() => setAppScreen("booking-confirm")}
          />
        ) : appScreen === "booking-confirm" ? (
          <HzBookingConfirmationScreen
            onBack={() => setAppScreen("provider-profile")}
            onConfirm={() => setAppScreen("awaiting")}
          />
        ) : appScreen === "awaiting" ? (
          <HzAwaitingScreen
            onCancel={() => setAppScreen("chat")}
            onAccepted={() => setAppScreen("booking-confirmed")}
          />
        ) : appScreen === "booking-confirmed" ? (
          <HzBookingConfirmedScreen
            onViewJob={() => setAppScreen("active-job")}
            onBackToChat={() => setAppScreen("chat")}
          />
        ) : appScreen === "active-job" ? (
          <HzActiveJobScreen
            onBack={() => setAppScreen("booking-confirmed")}
            onReportIssue={() => setAppScreen("dispute-chat")}
            onJobComplete={() => setAppScreen("feedback")}
          />
        ) : appScreen === "feedback" ? (
          <HzFeedbackScreen
            onSubmit={() => setAppScreen("chat")}
            onSkip={() => setAppScreen("chat")}
          />
        ) : appScreen === "bookings" ? (
          <HzBookingsScreen
            onBack={() => setAppScreen("chat")}
            onTabChange={(tab) => {
              if (tab === "chat")       setAppScreen("chat");
              if (tab === "favourites") setAppScreen("favourites");
              if (tab === "profile")    setAppScreen("consumer-profile");
            }}
          />
        ) : appScreen === "favourites" ? (
          <HzFavouritesScreen
            onBook={() => setAppScreen("booking-confirm")}
            onViewProfile={() => setAppScreen("provider-profile")}
            onTabChange={(tab) => {
              if (tab === "chat")     setAppScreen("chat");
              if (tab === "bookings") setAppScreen("bookings");
              if (tab === "profile")  setAppScreen("consumer-profile");
            }}
          />
        ) : appScreen === "consumer-profile" ? (
          <HzProfileScreen
            onSignOut={() => setAppScreen("register")}
            onTabChange={(tab) => {
              if (tab === "chat")       setAppScreen("chat");
              if (tab === "bookings")   setAppScreen("bookings");
              if (tab === "favourites") setAppScreen("favourites");
            }}
          />
        ) : appScreen === "dispute-chat" ? (
          <HzDisputeChatScreen onBack={() => setAppScreen("active-job")} />
        ) : appScreen === "dispute-status" ? (
          <HzDisputeStatusScreen onBack={() => setAppScreen("dispute-chat")} />
        ) : appScreen === "provider-onboarding" ? (
          <HzProviderOnboardingChat onComplete={() => setAppScreen("provider-dashboard")} />
        ) : appScreen === "provider-dashboard" ? (
          <HzProviderDashboard
            onViewJob={() => setAppScreen("provider-active-job")}
            onViewInbox={() => setAppScreen("provider-inbox")}
            onViewPastJobs={() => setAppScreen("provider-past-jobs")}
            onViewProfile={() => setAppScreen("provider-settings")}
          />
        ) : appScreen === "provider-inbox" ? (
          <HzProviderInbox
            onViewJobRequest={() => setAppScreen("provider-job-request")}
            onAcceptJob={() => setAppScreen("provider-active-job")}
          />
        ) : appScreen === "provider-job-request" ? (
          <HzProviderJobRequest
            onBack={() => setAppScreen("provider-inbox")}
            onAccept={() => setAppScreen("provider-active-job")}
            onDecline={() => setAppScreen("provider-inbox")}
          />
        ) : appScreen === "provider-active-job" ? (
          <HzProviderActiveJob
            onBack={() => setAppScreen("provider-dashboard")}
            onMarkArrived={() => setAppScreen("provider-active-job")}
            onReportIssue={() => setAppScreen("provider-dispute-chat")}
            onJobComplete={() => setAppScreen("provider-rate-consumer")}
          />
        ) : appScreen === "provider-rate-consumer" ? (
          <HzProviderRateConsumer
            onSubmit={() => setAppScreen("provider-dashboard")}
            onSkip={() => setAppScreen("provider-dashboard")}
          />
        ) : appScreen === "provider-past-jobs" ? (
          <HzProviderPastJobs
            onBack={() => setAppScreen("provider-dashboard")}
            onTabChange={(tab) => {
              if (tab === "dashboard") setAppScreen("provider-dashboard");
              if (tab === "inbox")     setAppScreen("provider-inbox");
              if (tab === "profile")   setAppScreen("provider-settings");
            }}
          />
        ) : appScreen === "provider-dispute-chat" ? (
          <HzProviderDisputeChat onBack={() => setAppScreen("provider-active-job")} onSubmit={() => setAppScreen("provider-dispute-status")} />
        ) : appScreen === "provider-dispute-status" ? (
          <HzProviderDisputeStatus onBack={() => setAppScreen("provider-dispute-chat")} />
        ) : appScreen === "provider-settings" ? (
          <HzProviderProfile
            onSignOut={() => setAppScreen("register")}
            onUpdateProfile={() => setAppScreen("provider-onboarding")}
            onTabChange={(tab) => {
              if (tab === "dashboard") setAppScreen("provider-dashboard");
              if (tab === "inbox") setAppScreen("provider-inbox");
            }}
          />
        ) : appScreen === "login" ? (
          <HzLoginScreen
            onLogin={() => setAppScreen("chat")}
            onRegister={() => setAppScreen("register")}
            onForgotPassword={() => {}}
          />
        ) : (
          <>
            {/* Dynamic Island / notch mock */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "120px",
                height: "34px",
                backgroundColor: "#1A1A1A",
                borderRadius: "20px",
                zIndex: 10,
              }}
            />

            {/* Status bar */}
            <StatusBar />

            {/* Notch spacer */}
            <div style={{ height: "16px", backgroundColor: "#FFFFFF", flexShrink: 0 }} />

            {/* Screen content */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {renderScreen()}
            </div>

            {/* Bottom navigation */}
            <HzBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Android gesture bar */}
            <div
              aria-hidden="true"
              style={{
                height: "20px",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "#1A1A1A",
                  opacity: 0.15,
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
