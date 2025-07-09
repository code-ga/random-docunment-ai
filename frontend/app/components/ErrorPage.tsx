import React from "react";

interface ErrorPageProps {
  message: string;
  status: number | string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message, status }) => {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#1f2937",
          padding: "40px 32px",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, color: "#f87171" }}>{status}</div>
        <div style={{ fontSize: 20, margin: "16px 0 24px 0", color: "#f3f4f6" }}>{message}</div>
        <button
          onClick={handleGoHome}
          style={{
            background: "#00e0d3",
            color: "#111827",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
