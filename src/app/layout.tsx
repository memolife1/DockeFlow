import type { Metadata } from "next";
import "./globals.css";
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
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
