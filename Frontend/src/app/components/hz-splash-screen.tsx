import React from "react";

export const HzSplashScreen: React.FC = () => (
  <div
    style={{
      flex: 1,
      backgroundColor: "#FAF8F5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}
  >
    {/* Centre group */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Logo mark */}
      <div
        aria-label="Haazir logo"
        style={{
          width: "96px",
          height: "96px",
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
            fontSize: "44px",
            fontWeight: 600,
            lineHeight: 1,
            color: "#FFFFFF",
          }}
        >
          H
        </span>
      </div>

      {/* Wordmark */}
      <h1
        style={{
          margin: 0,
          marginTop: "16px",
          fontFamily: "Inter, sans-serif",
          fontSize: "32px",
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: 0,
          color: "#1A1A1A",
          textAlign: "center",
        }}
      >
        Haazir
      </h1>

      {/* Tagline */}
      <div
        style={{
          marginTop: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "#9B9B9B",
            textAlign: "center",
          }}
        >
          Your service, ready when you are.
        </p>
        <p
          dir="rtl"
          lang="ur"
          style={{
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "#9B9B9B",
            textAlign: "center",
          }}
        >
          حاضر ہے جب آپ کو ضرورت ہو۔
        </p>
      </div>
    </div>

    {/* Footer — pinned 32dp from bottom */}
    <p
      style={{
        position: "absolute",
        bottom: "32px",
        left: 0,
        right: 0,
        margin: 0,
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 400,
        lineHeight: "15px",
        color: "#9B9B9B",
        textAlign: "center",
      }}
    >
      © Haazir 2025
    </p>
  </div>
);
