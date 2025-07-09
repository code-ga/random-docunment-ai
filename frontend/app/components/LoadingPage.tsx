import React from "react";

const spinnerStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  border: "8px solid #222",
  borderTop: "8px solid #00e0d3",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto",
};

const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const LoadingPage: React.FC = () => (
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
    <style>{keyframes}</style>
    <div style={spinnerStyle}></div>
    <h1 style={{ marginTop: 32, fontWeight: 700, fontSize: 32, letterSpacing: 1 }}>study.ai</h1>
    <p style={{ marginTop: 12, color: "#a1a1aa", fontSize: 18 }}>Loading, please wait...</p>
  </div>
);

export default LoadingPage;
