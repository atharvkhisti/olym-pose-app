import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Activity, Shield, Zap } from "lucide-react";

export default function HomePage() {
  const highlights = [
    {
      icon: Activity,
      title: "AI Pose Detection",
      description:
        "Real-time analysis of your exercise form using advanced computer vision",
    },
    {
      icon: Shield,
      title: "Injury Prevention",
      description:
        "Get instant feedback to correct your posture and prevent injuries",
    },
    {
      icon: Zap,
      title: "Track Progress",
      description:
        "Monitor your reps, form accuracy, and fitness improvements over time",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-brand-secondary/10 blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-display-lg text-content mb-6">
                Perfect Your Form with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                  AI-Powered
                </span>{" "}
                Pose Detection
              </h1>

              <p className="text-xl text-content-muted mb-10">
                Olym Pose uses advanced computer vision to analyze your exercise
                technique in real-time, helping you train smarter and safer.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-surface-200 bg-surface-50">
          <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-display-sm text-content mb-4">
                Train Smarter, Not Harder
              </h2>
              <p className="text-lg text-content-muted max-w-2xl mx-auto">
                Our AI technology watches your every move to ensure you&apos;re
                getting the most out of every workout while staying safe.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-surface-200 bg-surface p-8"
                >
                  <div className="rounded-xl bg-brand-primary/10 p-3 w-fit mb-6">
                    <item.icon className="h-6 w-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-content mb-3">
                    {item.title}
                  </h3>
                  <p className="text-content-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
