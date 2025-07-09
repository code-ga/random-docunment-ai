import React from "react";
import { signIn } from "../lib/auth";

const RANDOM_BG =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

export function Login() {
  const callbackURL = new URL(
    window && window.location ? window.location.href : ""
  );
  // redirect to dashboard
  callbackURL.pathname = "/dashboard";
  console.log(callbackURL)
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        background: `url(${RANDOM_BG}) center/cover no-repeat`,
        zIndex: 0,
        overflow: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(20, 20, 30, 0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
            alt="Logo"
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              boxShadow: "0 2px 8px #0008",
            }}
          />
        </div>
        {/* Login Card */}
        <div
          style={{
            width: 380,
            background: "#181824",
            borderRadius: 12,
            boxShadow: "0 4px 32px #000a",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 28,
            alignItems: "stretch",
          }}
        >
          {/* Email Form */}
          <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="email"
              placeholder="Email"
              disabled
              style={{
                background: "#232336",
                color: "#aaa",
                border: "1px solid #333",
                borderRadius: 6,
                padding: "12px 14px",
                fontSize: 16,
              }}
            />
            <input
              type="password"
              placeholder="Password"
              disabled
              style={{
                background: "#232336",
                color: "#aaa",
                border: "1px solid #333",
                borderRadius: 6,
                padding: "12px 14px",
                fontSize: 16,
              }}
            />
            <button
              type="submit"
              disabled
              style={{
                background: "#333",
                color: "#888",
                border: "none",
                borderRadius: 6,
                padding: "12px 0",
                fontWeight: 600,
                fontSize: 16,
                cursor: "not-allowed",
              }}
            >
              Login with Email (coming soon)
            </button>
          </form>
          {/* Divider */}
          <div
            style={{
              textAlign: "center",
              color: "#444",
              fontSize: 14,
              margin: "8px 0",
            }}
          >
            or continue with
          </div>
          {/* OAuth Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button
              style={{
                background: "#fff",
                color: "#222",
                border: "none",
                padding: "12px 0",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 16,
                cursor: "pointer",
              }}
              onClick={() => {
                signIn.social({
                  provider: "google",
                  callbackURL: callbackURL.toString(),
                });
              }}
            >
              <span role="img" aria-label="Google" style={{ marginRight: 8 }}>
                🔵
              </span>
              Login with Google
            </button>
            <button
              style={{
                background: "#5865F2",
                color: "#fff",
                border: "none",
                padding: "12px 0",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 16,
                cursor: "pointer",
              }}
              onClick={() => {
                signIn.social({
                  provider: "discord",
                  callbackURL: callbackURL.toString(),
                });
              }}
            >
              <span role="img" aria-label="Discord" style={{ marginRight: 8 }}>
                💬
              </span>
              Login with Discord
            </button>
            <button
              style={{
                background: "#24292f",
                color: "#fff",
                border: "none",
                padding: "12px 0",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 16,
                cursor: "pointer",
              }}
              onClick={() => {
                signIn.social({
                  provider: "github",
                  callbackURL: callbackURL.toString(),
                });
              }}
            >
              <span role="img" aria-label="GitHub" style={{ marginRight: 8 }}>
                🐙
              </span>
              Login with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
