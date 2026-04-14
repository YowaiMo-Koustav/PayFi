import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Oswald, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CursorGlow from "@/components/Backgrounds/CursorGlow";
import Dither from "@/components/Backgrounds/Dither";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Subscription Saver",
  description: "Detect, manage, and recover costs from recurring subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${oswald.variable} ${jetbrains.variable}`}>
      <body>
        <CursorGlow />
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
          <Dither waveColor={[0.0, 0.05, 0.2]} waveSpeed={0.03} waveAmplitude={0.8} />
        </div>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
