import React, { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  durationMs?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  onClose,
  durationMs = 5000,
}) => {
  // Auto‑close after durationMs
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center bg-red-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
      <svg
        className="w-5 h-5 mr-2 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-3 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default ErrorToast;