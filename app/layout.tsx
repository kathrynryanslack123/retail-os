import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Retail Event OS",
  description: "Live retail pop-up campaign command center with two-way Google Sheets sync."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
