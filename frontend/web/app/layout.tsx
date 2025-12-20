import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { APP_NAME } from "@/lib/constants";
import { SessionProvider } from "@/components/providers/SessionProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "AI-powered exercise pose detection and correction",
  keywords: ["exercise", "pose detection", "AI", "fitness", "workout"],
  authors: [{ name: "Olym Pose Team" }],
  // TODO: Add Open Graph and Twitter meta tags for social sharing
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-surface text-content antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
