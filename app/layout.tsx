import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://monkeytypeclon.netlify.app";
const TITLE = "MonkeyType Clone — Test your typing speed";
const DESCRIPTION =
  "A minimalist typing-speed test built with Next.js. Measure your WPM and accuracy in English or Spanish across multiple durations.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["typing test", "wpm", "monkeytype", "mecanografía", "typing speed"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "MonkeyType Clone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
