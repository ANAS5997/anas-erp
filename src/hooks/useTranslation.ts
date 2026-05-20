// src/hooks/useTranslation.ts
import { useStore } from "@/store/useStore";
import { translations } from "@/lib/translations";

export function useTranslation() {
  const language = useStore((state) => state.language);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language as keyof typeof translations] || translations.en;

    // Support dot-notation for nested keys (e.g. "prod_categories.lighting")
    const parts = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let text: any = dict;
    for (const part of parts) {
      text = text?.[part];
    }

    // Fallback to English if key not found in current language
    if (!text || typeof text !== "string") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fallback: any = translations.en;
      for (const part of parts) {
        fallback = fallback?.[part];
      }
      text = fallback;
    }

    if (!text || typeof text !== "string") return key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  };

  const isRTL = language === "ar";

  return { t, language, isRTL };
}
