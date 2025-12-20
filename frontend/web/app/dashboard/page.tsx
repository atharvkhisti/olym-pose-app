import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth.config";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell, Activity, Target, TrendingUp, Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Olym Pose dashboard - track your exercises and progress",
};

export default async function DashboardPage() {
  // Protect this route using NextAuth session
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Get user display name from session
  const userName = session.user.name || session.user.email?.split("@")[0] || "User";

  const features = [
    {
      icon: Activity,
      title: "Real-time Pose Detection",
      description: "AI-powered analysis of your exercise form",
      status: "Live",
    },
    {
      icon: Target,
      title: "Rep Counting",
      description: "Automatic counting of your exercise repetitions",
      status: "Live",
    },
    {
      icon: Dumbbell,
      title: "Exercise Library",
      description: "Comprehensive library of supported exercises",
      status: "Coming Soon",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Track your fitness journey over time",
      status: "Coming Soon",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-surface-200 bg-gradient-to-b from-surface-50 to-surface">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-display-md text-content mb-4">
                Welcome back, <span className="text-brand-primary">{userName}</span>
              </h1>
              <p className="text-lg text-content-muted">
                Your personal AI fitness assistant is getting ready. Soon you&apos;ll be able to
                track exercises, perfect your form, and achieve your fitness goals.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-content mb-8">
            Upcoming Features
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-glow hover:border-brand-primary/30"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="rounded-xl bg-brand-primary/10 p-3">
                      <feature.icon className="h-6 w-6 text-brand-primary" />
                    </div>
                    <span className="text-xs font-medium text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full">
                      {feature.status}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-content-muted">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* TODO: Integrate AI service for pose detection */}
          {/* TODO: Add exercise session component */}
          {/* TODO: Add progress charts and statistics */}
        </section>

        {/* Quick Start Card */}
        <section className="container mx-auto px-4 pb-12 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-brand-primary/10 via-brand-secondary/10 to-transparent border-brand-primary/20">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
              <div>
                <h3 className="text-xl font-semibold text-content mb-2">
                  Start Your Workout
                </h3>
                <p className="text-content-muted max-w-xl">
                  Experience AI-powered exercise detection with real-time rep counting.
                  Perfect your form and track your progress instantly.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/workout">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Start Workout
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
