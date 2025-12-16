import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Dosis, Lato } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/AppLayout";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "RPR Flow | Project Management",
  description: "Streamline your project workflow with intelligent task management and team collaboration.",
  robots: {
    index: false,
    follow: false,
  },
};

const dosis = Dosis({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
  display: "swap",
});

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
        <body className={`${dosis.variable} ${lato.variable} font-body antialiased`} suppressHydrationWarning>
          <AppLayout>{children}</AppLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
