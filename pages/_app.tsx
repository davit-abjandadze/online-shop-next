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
import { BASEPATH } from "@/constants";
import NProgress from "nprogress";
import { Router, useRouter } from "next/router";
import { withTranslateRoutes } from "next-translate-routes";
import useTranslation from "next-translate/useTranslation";
import Head from "next/head";
import { ThemeModeProvider } from "@/context/ThemeMode";

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
const MyApp = ({ Component, pageProps }: AppProps) => {
  const { lang, t } = useTranslation("common");
  const router = useRouter();

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
        <meta
          property="og:url"
          content={`${BASEPATH}/${router.locale}${router.asPath}`}
          key="ogUrl"
        />
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
        <meta name="theme-color" content="#FFFFFF" />
        <link
          rel="canonical"
          href={`${BASEPATH}/${router.locale}${router.asPath}`}
          key="canonical"
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
              <ThemeModeProvider>
                <Component {...pageProps} />
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
              </ThemeModeProvider>
            {/* </GlobalProvider> */}
          </SessionProvider>
        </ScreenClassProvider>
      </SWRConfig>
    </ThemeProvider>
  );
};

export default withTranslateRoutes(MyApp);
