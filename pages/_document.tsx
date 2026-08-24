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
          <link rel="icon" type="image/svg+xml" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          {/* Nova-დიზაინის სათაურის შრიფტი (Instrument Serif) — ქართული ტექსტისთვის
              ავტომატურად უკან ვარდება --ref-font-display-ის fallback-ზე, ლათინურ/ციფრულ
              შემცველობაზე (ფასები, ბრენდის სახელი) კი აძლევს დიზაინის სერიფულ იერს. */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap"
          />
          {/* TODO: Add third-party scripts here (Analytics, GTM, etc.) */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
