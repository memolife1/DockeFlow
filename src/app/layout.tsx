import type { Metadata } from "next";
import "./globals.css";
// Global stylesheet for the onboarding product tour (lib/tour.ts) — Next.js
// only allows global CSS imports from the root layout, so it lives here even
// though the tour library itself is lazy-loaded on demand.
import "driver.js/dist/driver.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "DeckeFlow — Client-ready presentations, fast",
  description:
    "Create professional presentations from a topic, notes, or your own template. Turn rough input into polished, branded decks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts for the marketing homepage (Plus Jakarta Sans + Material
            Symbols icons). Loaded here instead of a Tailwind CDN script. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
