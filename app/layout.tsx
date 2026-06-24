import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MonkeyType Clone — Test your typing speed",
  description:
    "A minimalist typing-speed test built with Next.js. Measure your WPM and accuracy in English or Spanish across multiple durations.",
  keywords: ["typing test", "wpm", "monkeytype", "mecanografía", "typing speed"],
  openGraph: {
    title: "MonkeyType Clone — Test your typing speed",
    description:
      "Measure your typing speed (WPM) and accuracy in English or Spanish.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${robotoMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="serika"
          enableSystem={false}
          themes={["serika", "dark", "light", "ocean", "dracula"]}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
