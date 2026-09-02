import { redirect } from "next/navigation";

// Demo login step removed — go straight to the dashboard.
// (Landing page still lives at components/landing/LandingPage.tsx if needed later.)
export default function HomePage() {
  redirect("/dashboard");
}
