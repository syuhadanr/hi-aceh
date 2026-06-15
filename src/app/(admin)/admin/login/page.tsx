import { redirect } from "next/navigation";

// The login page is now at /login (standalone, no admin layout)
// This redirect handles any old links to /admin/login
export default function AdminLoginRedirect() {
  redirect("/login");
}
