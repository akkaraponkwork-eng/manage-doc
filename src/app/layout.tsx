import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1e293b",
};

export const metadata: Metadata = {
  title: "ระบบจัดเก็บเอกสารราชการ",
  description: "ระบบจัดเก็บเอกสารราชการ พร้อม AI สกัดข้อมูลอัตโนมัติ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Manage Doc",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
