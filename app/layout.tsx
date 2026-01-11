import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import { Toaster } from "sonner";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "حازم أوبل - مركز متخصص صيانة أوبل",
  description: "أفضل مركز صيانة لسيارات أوبل في مصر. صيانة دورية، فحص كمبيوتر، قطع غيار، وعمرة محركات بأعلى جودة.",
  keywords: ["أوبل", "صيانة سيارات", "قطع غيار أوبل", "فحص كمبيوتر", "مصر", "Opel", "Maintenance"],
  openGraph: {
    title: "حازم أوبل - مركز متخصص صيانة أوبل",
    description: "أفضل مركز صيانة لسيارات أوبل في مصر.",
    type: "website",
    locale: "ar_EG",
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.png" },
    ],
    apple: "/apple-icon.png",
  },
};

import MobileNav from "@/components/layout/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${cairo.className} min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-primary selection:text-white`}>
        <Header />
        <main className="relative z-10">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <Toaster dir="rtl" richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
