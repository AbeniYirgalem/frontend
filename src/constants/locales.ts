export const supportedLocales = ["en", "fr", "sw"] as const;
export type Locale = (typeof supportedLocales)[number];
