"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        className: "",
        style: {
          background: "var(--color-surface)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-e3)",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "380px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        },
        success: {
          iconTheme: {
            primary: "#059669",
            secondary: "#ecfdf5",
          },
          style: {
            borderLeft: "3px solid #059669",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fef2f2",
          },
          style: {
            borderLeft: "3px solid #dc2626",
          },
        },
        loading: {
          iconTheme: {
            primary: "#2563eb",
            secondary: "#eff6ff",
          },
          style: {
            borderLeft: "3px solid #2563eb",
          },
        },
      }}
    />
  );
}
