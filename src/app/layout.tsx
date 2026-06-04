import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
