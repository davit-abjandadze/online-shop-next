import "intl-pluralrules";

import "@/styles/globals.css";
import "@/styles/iconFont.css";
import "swiper/swiper-bundle.min.css";

import { ssTheme } from "@/theme";
import { useEffect } from "react";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import { SessionProvider, useSession } from "next-auth/react";
import { logoutDueToExpiredSession } from "@/API_Client";
import { ScreenClassProvider, setConfiguration } from "react-grid-system";
import { ToastContainer, cssTransition } from "react-toastify";
import Icon from "@/components/ui/Icon";
import { SWRConfig } from "swr";
import { BASEPATH, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/constants";
import { DEFAULT_OG_IMAGE, KA_ONLY_PATHS, SITE_LOGO, absoluteUrl, getCanonicalPath, resolveLocale } from "@/utils/seo";
import NProgress from "nprogress";
import { Router, useRouter } from "next/router";
import { withTranslateRoutes } from "next-translate-routes";
import useTranslation from "next-translate/useTranslation";
import Head from "next/head";
import { CartProvider } from "@/context/Cart";
import { CategoryTreeProvider } from "@/context/CategoryTree";
import { WishlistProvider } from "@/context/Wishlist";
import { NotificationsProvider } from "@/context/Notifications";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import Analytics from "@/components/shared/Analytics";
import CookieConsent from "@/components/shared/CookieConsent";
import { CookieConsentProvider } from "@/context/CookieConsent";

NProgress.configure({ showSpinner: false });

Router.events.on("routeChangeStart", () => {
  NProgress.start();
});

Router.events.on("routeChangeComplete", () => {
  NProgress.done(false);
});

setConfiguration({
  defaultScreenClass: "sm",
  gridColumns: 12,
  gutterWidth: 0,
  breakpoints: Object.values(ssTheme.breakpoints).map((x) =>
    parseInt(x.replace("px", ""))
  ),
  containerWidths: Object.values(ssTheme.containerSizes).map((x) =>
    parseInt(x.replace("px", ""))
  ),
});

const ToastAnimation = cssTransition({
  enter: "Toastify--animate Toastify__slide-enter",
  exit: "Toastify--animate Toastify__slide-exit",
  collapseDuration: 200,
});

// TODO: Add your app providers and layout components
// SEO-სთვის მხარდაჭერილი ენების სია — sitemap.xml-ში, hreflang link-ებში
// და JSON-LD-ში ერთნაირად გამოსაყენებლად
const SEO_LOCALES = SUPPORTED_LOCALES;
const OG_LOCALE_MAP: Record<string, string> = { ka: "ka_GE", en: "en_US", ru: "ru_RU" };

// NextAuth-ის jwt() ბექენდის ტოკენის ვადის გასვლისას session.error-ს აყენებს —
// აქედან ვიძახებთ იგივე signOut + /login?sessionExpired=1 ნაკადს, რასაც 401
// interceptor (სხვაგვარად UI "შესულად" რჩებოდა მკვდარი ტოკენით).
const SessionErrorWatcher = () => {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.error === "BackendTokenExpired") logoutDueToExpiredSession();
  }, [session?.error]);
  return null;
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const { lang, t } = useTranslation("common");
  const router = useRouter();
  const currentLocale = resolveLocale(router.locale);
  // query string-ის (ფილტრები/დალაგება/utm) გარეშე — იხ. getCanonicalPath
  const canonicalPath = getCanonicalPath(router.asPath);
  // მხოლოდ ქართულენოვან გვერდებს (წესები/კონფიდენციალურობა) ალტერნატივები არ აქვთ
  const isKaOnly = KA_ONLY_PATHS.includes(router.pathname);
  const canonicalUrl = absoluteUrl(isKaOnly ? DEFAULT_LOCALE : currentLocale, canonicalPath);
  // noindex გვერდზე (ძიება, ფილტრები — getServerSideProps-ის `noindex` prop) canonical/
  // hreflang არ ისმება: "noindex + canonical სხვა URL-ზე" Google-ისთვის ურთიერთსაწინააღმდეგოა
  const isNoindex = !!pageProps.noindex;
  const showAlternates = !isKaOnly && !isNoindex;

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t("default-page-title"),
    url: BASEPATH,
    inLanguage: SEO_LOCALES,
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t("default-page-title"),
    url: BASEPATH,
    logo: SITE_LOGO,
    image: DEFAULT_OG_IMAGE,
  };

  return (
    <ThemeProvider theme={ssTheme}>
      <Head>
        <title>{t("default-page-title")}</title>
        <meta name="description" content={t("page-description")} />
        <meta name="format-detection" content="telephone=no" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta property="og:url" content={canonicalUrl} key="ogUrl" />
        <meta property="og:type" content="website" key="ogType" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} key="ogImage" />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} key="twitterImage" />
        <meta
          property="og:description"
          content={t("page-description")}
          key="description"
        />
        <meta
          property="og:title"
          content={t("default-page-title")}
          key="title"
        />
        <meta property="og:site_name" content={t("default-page-title")} key="ogSiteName" />
        <meta
          property="og:locale"
          content={OG_LOCALE_MAP[currentLocale] || "ka_GE"}
          key="ogLocale"
        />
        {SEO_LOCALES.filter((loc) => loc !== currentLocale).map((loc) => (
          <meta
            property="og:locale:alternate"
            content={OG_LOCALE_MAP[loc]}
            key={`ogLocaleAlt-${loc}`}
          />
        ))}
        <meta name="twitter:card" content="summary_large_image" key="twitterCard" />
        <meta name="twitter:title" content={t("default-page-title")} key="twitterTitle" />
        <meta
          name="twitter:description"
          content={t("page-description")}
          key="twitterDescription"
        />
        <meta name="theme-color" content="#FFFFFF" />
        {/* Google Search Console-ის HTML-tag verification (იხ. .env.example) */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        {!isNoindex && <link rel="canonical" href={canonicalUrl} key="canonical" />}
        {showAlternates &&
          SEO_LOCALES.map((loc) => (
            <link
              rel="alternate"
              hrefLang={loc}
              href={absoluteUrl(loc, canonicalPath)}
              key={`hreflang-${loc}`}
            />
          ))}
        {showAlternates && (
          <link
            rel="alternate"
            hrefLang="x-default"
            href={absoluteUrl(DEFAULT_LOCALE, canonicalPath)}
            key="hreflang-x-default"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          key="jsonld-website"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          key="jsonld-organization"
        />
      </Head>
      <CookieConsentProvider>
      <Analytics />
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          errorRetryCount: 3,
        }}
      >
        <ScreenClassProvider>
          <SessionProvider
            session={pageProps.session}
            refetchInterval={60}
            refetchOnWindowFocus={false}
          >
            {/* <GlobalProvider> */}
              <SessionErrorWatcher />
              <CategoryTreeProvider initialTree={pageProps.categoryTree}>
              <CartProvider>
                <WishlistProvider>
                  <NotificationsProvider>
                    <ErrorBoundary>
                      <Component {...pageProps} />
                    </ErrorBoundary>
                  </NotificationsProvider>
                </WishlistProvider>
              </CartProvider>
              </CategoryTreeProvider>
              <ToastContainer
                autoClose={3000}
                transition={ToastAnimation}
                theme="colored"
                closeButton={<Icon name="close" />}
                icon={({ type }) => {
                  if (type === "success") {
                    return <Icon name="check" />;
                  } else if (type === "error") {
                    return <Icon name="cancel" filled />;
                  } else {
                    return <Icon name={type} filled />;
                  }
                }}
              />
            {/* </GlobalProvider> */}
          </SessionProvider>
        </ScreenClassProvider>
      </SWRConfig>
      <CookieConsent />
      </CookieConsentProvider>
    </ThemeProvider>
  );
};

export default withTranslateRoutes(MyApp);
