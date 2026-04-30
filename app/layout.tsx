import type { Metadata } from "next";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Red Bull Hotel System",
  description: "Ексклюзивна платформа для бронювання готелів для любителів екстремального відпочинку",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="antialiased bg-[#0A0A0F] text-white min-h-screen relative overflow-x-hidden">
        {/* Global background atmosphere — visible on ALL pages */}
        <BackgroundBlobs />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
