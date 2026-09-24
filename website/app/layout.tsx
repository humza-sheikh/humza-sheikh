import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://humzasheikh.com"),
  title: "Humza Sheikh — Business Introductions",
  description: "Business introductions for US companies and businesses worldwide. Find relevant providers, suppliers and partners, with the introduction fee agreed beforehand.",
  alternates: { canonical: "/" },
  openGraph: { title: "The right people. Right when it matters. — Humza Sheikh", description: "Connecting businesses across the US and worldwide with relevant providers. Share your brief and agree the introduction fee beforehand.", type: "website", locale: "en_US", siteName: "Humza Sheikh", url: "/", images: [{ url: "/og.png", width: 1730, height: 909, alt: "Humza Sheikh — The right people. Right when it matters. Business introductions for the US and worldwide." }] },
  twitter: { card: "summary_large_image", title: "Humza Sheikh — Business Introductions", description: "Business introductions for US companies and businesses worldwide. The right people. Right when it matters.", images: ["/og.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <head><link rel="preload" href="/fonts/nimbus-regular.woff" as="font" type="font/woff" crossOrigin="anonymous" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
