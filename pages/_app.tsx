import "intl-pluralrules";

import "@/styles/globals.css";
import "@/styles/iconFont.css";
import "swiper/swiper-bundle.min.css";

import { ssTheme } from "@/theme";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import { SessionProvider } from "next-auth/react";
import { ScreenClassProvider, setConfiguration } from "react-grid-system";
import { ToastContainer, cssTransition } from "react-toastify";
import Icon from "@/components/ui/Icon";
import { SWRConfig } from "swr";
import { BASEPATH, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/constants";
import NProgress from "nprogress";
import { Router, useRouter } from "next/router";
import { withTranslateRoutes } from "next-translate-routes";
import useTranslation from "next-translate/useTranslation";
import Head from "next/head";
import { CartProvider } from "@/context/Cart";
import { WishlistProvider } from "@/context/Wishlist";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

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

const MyApp = ({ Component, pageProps }: AppProps) => {
  const { lang, t } = useTranslation("common");
  const router = useRouter();
  const currentLocale = router.locale && router.locale !== "default" ? router.locale : DEFAULT_LOCALE;
  const canonicalUrl = `${BASEPATH}/${currentLocale}${router.asPath}`;

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
  };

  return (
    <ThemeProvider theme={ssTheme}>
      <Head>
        <title>{t("default-page-title")}</title>
        <meta name="description" content={t("page-description")} />
        <meta name="format-detection" content="telephone=no" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"
        />
        <meta property="og:url" content={canonicalUrl} key="ogUrl" />
        <meta property="og:type" content="website" />
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
        <meta name="twitter:card" content="summary" key="twitterCard" />
        <meta name="twitter:title" content={t("default-page-title")} key="twitterTitle" />
        <meta
          name="twitter:description"
          content={t("page-description")}
          key="twitterDescription"
        />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="canonical" href={canonicalUrl} key="canonical" />
        {SEO_LOCALES.map((loc) => (
          <link
            rel="alternate"
            hrefLang={loc}
            href={`${BASEPATH}/${loc}${router.asPath}`}
            key={`hreflang-${loc}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${BASEPATH}/${DEFAULT_LOCALE}${router.asPath}`}
          key="hreflang-x-default"
        />
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
              <CartProvider>
                <WishlistProvider>
                  <ErrorBoundary>
                    <Component {...pageProps} />
                  </ErrorBoundary>
                </WishlistProvider>
              </CartProvider>
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
    </ThemeProvider>
  );
};

export default withTranslateRoutes(MyApp);
