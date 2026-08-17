/** @type {import('next').NextConfig} */
const nextTranslate = require("next-translate");
const withTranslateRoutes = require("next-translate-routes/plugin");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  async redirects() {
    return [];
  },
  // next-translate-routes rewrites-ებიდან /api/auth/* routes-ი ვფილტრავთ
  // რომ NextAuth-ის callback-ები POST method-ით სწორად დამუშავდეს
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
  i18n: {
    locales: ["default", "ka", "en", "ru"],
    defaultLocale: "default",
    localeDetection: false,
  },
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [],
  },
  env: {
    NEXT_PUBLIC_ENV: (() => {
      if (process.env.ENVIRONMENT === "Test") {
        return "Test";
      } else if (process.env.ENVIRONMENT === "Preprod") {
        return "Preprod";
      } else if (process.env.ENVIRONMENT === "Production") {
        return "Production";
      } else {
        return "Dev";
      }
    })(),
    // Amplify Hosting-ის console env vars build-ის დროს ხელმისაწვდომია, მაგრამ
    // SSR Lambda runtime-ს (API routes/NextAuth) non-NEXT_PUBLIC_ ცვლადები არ
    // მიუწვდება ავტომატურად — აქ ჩამოთვლილები webpack-ის DefinePlugin-ით
    // ბუილდ-თაიმზე ჩაენაცვლება ყველგან (node_modules/next-auth-შიც), ეს
    // Next.js-ის ოფიციალური მექანიზმია სწორედ ამ პრობლემისთვის.
    ENVIRONMENT: process.env.ENVIRONMENT,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
  },
  transpilePackages: ["supercluster", "use-supercluster"],
};

module.exports = withBundleAnalyzer(withTranslateRoutes(nextTranslate(nextConfig)));


