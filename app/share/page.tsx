import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TypingTest } from "@/components/typing-test";
import { languageLabel, parseShareParams } from "@/lib/share";

interface SharePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const result = parseShareParams(await searchParams);
  if (!result) return {};

  const title = `I scored ${result.wpm} WPM on MonkeyType Clone!`;
  const description =
    `${result.accuracy}% accuracy over ${result.duration}s in ` +
    `${languageLabel(result.language)}. Think you can beat it?`;
  const ogImage = `/og?wpm=${result.wpm}&acc=${result.accuracy}&t=${result.duration}&lang=${result.language}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const result = parseShareParams(await searchParams);
  if (!result) redirect("/");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 py-12">
      <p className="mx-4 max-w-xl rounded-lg bg-tt-sub/15 px-5 py-3 text-center text-sm text-tt-text">
        Someone scored{" "}
        <span className="font-semibold text-tt-main">{result.wpm} WPM</span> ·{" "}
        {result.accuracy}% accuracy ({result.duration}s ·{" "}
        {languageLabel(result.language)}) — can you beat it?
      </p>
      <TypingTest />
    </main>
  );
}
