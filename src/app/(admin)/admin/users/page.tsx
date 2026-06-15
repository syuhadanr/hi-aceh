import React from "react";
import { auth } from "src/auth";
import { redirect } from "next/navigation";
import UserManagementClient from "./users-client";

export const revalidate = 0; // Fresh load on mount

export default async function UsersPage() {
  const session = await auth();

  // Redirect instantly on server side if user role is not ADMIN
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  return <UserManagementClient currentUserId={session.user.id} />;
}
