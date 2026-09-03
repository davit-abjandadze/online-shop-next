// Environment flags
export const IS_DEV = process.env.NEXT_PUBLIC_ENV === "Dev";
export const IS_TEST = process.env.NEXT_PUBLIC_ENV === "Test";
export const IS_PREPROD = process.env.NEXT_PUBLIC_ENV === "Preprod";
export const IS_PROD = process.env.NEXT_PUBLIC_ENV === "Production";

export const SSR = typeof window === "undefined";

// ფრონტენდის მისამართი
export const BASEPATH = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ბექენდის მთავარი API მისამართი
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ავტორიზაციის მისამართი (შესაბამისობაშია NestJS AuthController-თან)
export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000/auth/login";

export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "";

// მხარდაჭერილი locale-ები და default locale — ერთი წყარო სიმართლისთვის
// (middleware.ts, _app.tsx, _document.tsx, sitemap.xml.ts, robots.txt.ts)
export const DEFAULT_LOCALE = "ka";
export const SUPPORTED_LOCALES = ["ka", "en", "ru"] as const;

export const GOOGLE_AUTH_CREDENTIALS = {
  client_id: process.env.GOOGLE_CLIENT_ID || "",
  client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
};

// CORS-ისთვის დაშვებული მისამართები (ფრონტენდის პორტები)
export const WHITE_LIST = [
  "http://localhost:3000",
  "http://localhost:3001", // თუ 3000 დაკავებულია, Next.js ავტომატურად 3001-ზე გადადის
  process.env.NEXT_PUBLIC_BASE_URL || "",
].filter(Boolean);