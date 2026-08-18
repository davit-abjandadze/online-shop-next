import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    const locale = this.props.__NEXT_DATA__.locale || "en";
    return (
      <Html lang={locale}>
        <Head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          {/* TODO: Add third-party scripts here (Analytics, GTM, etc.) */}
        </Head>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var m=localStorage.getItem("ref-theme-mode");document.documentElement.setAttribute("data-theme",m==="dark"?"dark":"light");}catch(e){}})();`,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
