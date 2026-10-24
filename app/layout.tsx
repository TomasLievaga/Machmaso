import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Machmaso — Good things start nearby",
  description:
    "A fictional, interactive Munich demo. Find people to do things with, lend a hand, and exchange a little everyday magic.",
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
