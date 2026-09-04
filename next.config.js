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
  // "default" ლოკალის (URL-ში ლოკალის პრეფიქსის გარეშე მოთხოვნების)
  // ka-ზე გადამისამართება აქ, next.config.js-ის დეკლარატიულ redirects-ში
  // ხდება — არა middleware.ts-ში. მიზეზი: middleware.ts-ის ფაილის უბრალო
  // არსებობაც კი (მისი ლოგიკის მიუხედავად — ცარიელი no-op middleware()-იც კი)
  // ტეხავს Next 13.4.16-ის dev/prod server-ში locale-detection-ს
  // client-side ნავიგაციის "_next/data/<buildId>/<locale>/..." მოთხოვნებზე:
  // ასეთი request middleware-ის არსებობისას შიდა "middleware-invoke"
  // round-trip-ს გადის, რომელიც ლოკალეს კარგავს და ყოველთვის "default"-ს
  // აბრუნებს ("ka"-ს მიუხედავად), რაც getServerSideProps-ში (და next-translate-ის
  // მიერ ჩატვირთულ თარგმანებში) არასწორ ენას იწვევდა client-side ნავიგაციისას
  // — curl-ითა და პირდაპირი Next.js internals-ის (node_modules/next/dist/server)
  // debug-ით დამტკიცებული (middleware.ts-ის ამოღება ერთადერთი ცვლილება იყო,
  // რომელმაც ეს გამოასწორა). Declarative next.config.js redirects ამ
  // middleware-invoke მექანიზმს საერთოდ არ იყენებს, ამიტომ ეს ბაგი მას არ ეხება.
  async redirects() {
    return [
      {
        // Next.js "default" ლოკალის (URL-ში ლოკალის პრეფიქსის არარსებობის)
        // request-ებს internal routing/redirect-matching-ისთვის ყოველთვის
        // "/default/..." პრეფიქსით წარმოადგენს (თვით api/_next მოთხოვნებსაც კი,
        // ისევე როგორც /public-ის სტატიკურ ფაილებს, მაგ. /icons/logo.png →
        // /default/icons/logo.png) — მიუხედავად იმისა, რომ ბრაუზერის URL-ში ეს
        // პრეფიქსი არასდროს ჩანს. ამიტომ პირდაპირ ამ პრეფიქსზე matching სჯობს
        // ნეგატიურ lookahead-ს source-ის დასაწყისში (რომელიც api/_next-ს ვერ
        // ფილტრავდა, რადგან "default" იყო რეალური პირველი სეგმენტი).
        // /public-ის ცნობილი დირექტორიები (icons, images) და favicon.png ასევე
        // გამორიცხულია — წინააღმდეგ შემთხვევაში ისინიც /ka/-ზე გადამისამართდებოდა
        // და 404-ს გამოიწვევდა (ლოგო და ენის სვიჩერის დროშების სურათები არ ჩანდა).
        source: "/default/:path((?!api|_next|icons|images|favicon.png).*)",
        // constants.ts-ის DEFAULT_LOCALE ვერ import-დება აქ პირდაპირ (next.config.js
        // CommonJS-ია, constants.ts TS module) — მნიშვნელობა (ka) ხელით სინქრონიზებულია
        destination: "/ka/:path*",
        locale: false,
        permanent: false,
      },
      {
        // root ("/") ცალკეა საჭირო, რადგან მისი internal pathname ზუსტად "/default"-ია
        // (ბოლო "/"-ის გარეშე) და არ ემთხვევა ზემოთა "/default/:path"-ს
        source: "/default",
        destination: "/ka",
        locale: false,
        permanent: false,
      },
    ];
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
  // next-auth აქაც დამატებულია: მისი შიდა detectOrigin()/parseUrl() ნამდვილ
  // process.env.NEXTAUTH_URL-ს კითხულობს runtime-ზე (Amplify-ის SSR compute-ს
  // ეს არ მიუწვდება, თუმცა build-ისას console-ის env vars ხელმისაწვდომია) —
  // transpilePackages-ში ჩამატებით webpack ნამდვილად აშენებს next-auth-საც,
  // რაც ზემოთი env{}-ის inline-ს (DefinePlugin) მასზეც ავრცელებს.
  transpilePackages: ["supercluster", "use-supercluster", "next-auth"],
};

module.exports = withBundleAnalyzer(withTranslateRoutes(nextTranslate(nextConfig)));


