import { redirect } from "next/navigation";

export default function RootPage() {
  // Middleware enforces authentication; land users on the dashboard.
  redirect("/dashboard");
}
