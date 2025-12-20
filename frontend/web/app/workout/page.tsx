import { redirect } from "next/navigation";
import { auth } from "@/lib/auth.config";
import { WorkoutPageClient } from "./WorkoutPageClient";

export const metadata = {
  title: "Workout | Olym Pose",
  description: "AI-powered exercise detection and rep counting",
};

export default async function WorkoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <WorkoutPageClient />;
}
