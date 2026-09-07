import { MaintenanceBanner } from "@/components/maintenance-banner";
import DevPlanSwitcher from "@/components/dev/DevPlanSwitcher";
import { TestPlanProvider } from "@/components/dev/TestPlanProvider";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { ThemeProvider } from "../components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import AdSenseScript from "@/components/ads/AdSenseScript";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Each tool sets only its own title; this frames it.
  title: {
    default: "PDF_AI — Every PDF tool you need, in one place",
    template: "%s | PDF_AI",
  },
  description: "Every PDF tool you need, in one place.",
  openGraph: {
    siteName: "PDF_AI",
    type: "website",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <MaintenanceBanner />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Wraps everything, so the language chosen in Settings applies to
              the marketing pages and the tools as well as the signed-in area. */}
          <LocaleProvider>
            <TestPlanProvider>
              {children}
              <DevPlanSwitcher />
            </TestPlanProvider>
          </LocaleProvider>
        </ThemeProvider>
        <AdSenseScript />
      </body>
    </html>
  );
}