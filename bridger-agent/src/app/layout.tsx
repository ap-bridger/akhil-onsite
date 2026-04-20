import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AccountConfigProvider } from "@/context/AccountConfigContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Bridger — Transaction Review",
  description: "Accountant transaction review tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AccountConfigProvider>{children}</AccountConfigProvider>
      </body>
    </html>
  );
}
