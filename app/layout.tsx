import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import FeedbackButton from "@/components/feedback-button";

export const metadata: Metadata = {
  title: "Swedish Building Energy Simulator",
  description: "Energy simulation for Swedish buildings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <FeedbackButton />
        </AuthProvider>
      </body>
    </html>
  );
}
