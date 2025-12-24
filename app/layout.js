// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import RegisterSW from "./register-sw"; // ✅ ADD THIS

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata = {
  title: "Shop ON",
  description: "this is leading e commerse paltform",
  manifest: "/manifest.json",            // ✅ ADD
  themeColor: "#0f172a",                 // ✅ ADD
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ PWA META TAGS */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black"
        />
        <meta name="apple-mobile-web-app-title" content="Shop ON" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>

      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ SERVICE WORKER REGISTER */}
        <RegisterSW />

        <SessionWrapper>
          {/* <Navbar /> */}

          <div className="min-h-screen bg-[#e3e6f3]">
            {children}
            {/* <Toaster position="top-right" reverseOrder={false} /> */}
          </div>

          {/* <Footer /> */}
        </SessionWrapper>
      </body>
    </html>
  );
}
