import React, { useEffect } from "react";
import { signIn, useSession } from "../lib/auth";
import { useNavigate } from "react-router";
import LoadingPage from "../components/LoadingPage";

const RANDOM_BG =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

export function Login() {
  const { data: session, isPending } = useSession();
  const redirect = useNavigate();

  React.useEffect(() => {
    if (!isPending && session?.user) {
      redirect("/dashboard");
    }
  }, [isPending, session]);

  if (isPending) return <LoadingPage></LoadingPage>;

  if (typeof window === "undefined") return null;
  const callbackURL = new URL(window ? window.location.href : "");
  // redirect to dashboard
  callbackURL.pathname = "/dashboard";
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
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
