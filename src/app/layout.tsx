import type { Metadata, Viewport } from "next";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: { default: "Empléate YA", template: "%s | Empléate YA" },
  description: "Metodología humana de empleabilidad acompañada por inteligencia artificial.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Empléate YA",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body suppressHydrationWarning><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
