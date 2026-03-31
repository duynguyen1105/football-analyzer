import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatchDay Analyst — Pre-Match Football Analysis",
  description: "In-depth pre-match analysis for football fans. Team form, head-to-head, stats, and predictions for top European leagues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
