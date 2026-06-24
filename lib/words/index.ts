import type { Language } from "@/lib/types";
import { wordsEn } from "./en";
import { wordsEs } from "./es";

export const WORD_POOLS: Record<Language, readonly string[]> = {
  en: wordsEn,
  es: wordsEs,
};

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];
