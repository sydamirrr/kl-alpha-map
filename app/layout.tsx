import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klang Valley Alpha Map",
  description:
    "A sourced, interactive map of the projects changing Kuala Lumpur and Selangor: data centres, rail, energy, water and urban development. Every claim carries its source.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
