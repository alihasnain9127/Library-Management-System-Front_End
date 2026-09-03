import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/redux/ReduxProvider";
import ToastProvider from "@/components/ui/ToastProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LuminaLib - Advanced Library Management System",
  description: "Track circulation, manage inventory, and explore catalog assets.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <ReduxProvider>
          <ToastProvider />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}