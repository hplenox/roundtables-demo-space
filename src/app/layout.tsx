import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roundtables — Demo Space",
  description: "Diversity, equity & inclusion survey platform for LPs and GPs",
  icons: {
    icon: "/icons/rt-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-slate-50 antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Left sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Top nav */}
            <TopNav />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
