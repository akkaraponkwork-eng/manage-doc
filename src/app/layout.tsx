import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบจัดเก็บเอกสารราชการ",
  description: "ระบบจัดเก็บเอกสารราชการ พร้อม AI สกัดข้อมูลอัตโนมัติ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
