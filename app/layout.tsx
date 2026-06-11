import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "SNIPECV — AI Career Memory & Resume Optimization",
  description: "A precision digital archive and resume tailoring system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full antialiased selection:bg-[#6B3F69] selection:text-[#FFF0DD]">
      <body className="min-h-full w-full flex flex-col bg-bg-paper text-text-primary">
        {children}
      </body>
    </html>
  );
}
