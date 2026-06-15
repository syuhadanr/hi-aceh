import React from "react";

// Standalone layout for auth pages — no sidebar or header
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
