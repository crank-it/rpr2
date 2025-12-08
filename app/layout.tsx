import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/AppLayout";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "RPR Hair Care Marketing Dashboard | Insights & Performance Tools",
  description: "Explore the RPR Hair Care Marketing Dashboard—your central hub for analytics, reporting, and campaign performance tools designed for the Australian market.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/auth/callback"
      signUpFallbackRedirectUrl="/sign-up/callback"
    >
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <AppLayout>{children}</AppLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
