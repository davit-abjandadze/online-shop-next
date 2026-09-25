import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { ProductsAPI } from "@/API_Client";
import { Product } from "@/API_Client/types";
import { BASEPATH, CDN_URL, DEFAULT_LOCALE } from "@/constants";
import ProductDetailComponent from "@/components/pages/productDetail";
import { getCategoryName, getLocalizedDescription } from "@/utils/getCategoryName";

interface ProductDetailPageProps {
  product: Product | null;
}

const SEO_LOCALES = ["ka", "en", "ru"] as const;

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product }) => {
  const router = useRouter();
  const currentLocale = router.locale && router.locale !== "default" ? router.locale : "ka";
  const { t } = useTranslation("product");
  const { t: tc } = useTranslation("common");

  if (!product) {
    return (
      <>
        <Head>
          <title>{`${t("not-found-page-title")} - ${tc("default-page-title")}`}</title>
        </Head>
        <main style={{ padding: "100px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 18 }}>{t("not-found-text")}</p>
        </main>
      </>
    );
  }

  const productName = getCategoryName(product, currentLocale);
  const productDescription = getLocalizedDescription(product, currentLocale);
  const title = truncate(`${productName} — ${tc("default-page-title")}`, 95);
  const description = productDescription
    ? truncate(productDescription, 155)
    : t("meta-description-fallback", { name: productName });
  const url = `${BASEPATH}/${currentLocale}/products/${product.id}`;
  // სოციალური ქსელები ფარდობით og:image-ს იგნორირებენ — resolveImage-ის
  // იგივე წესით CDN_URL-ს ვუმატებთ, თუ სრული URL არ არის.
  const rawImage = product.images?.[0];
  const image = rawImage ? (rawImage.startsWith("http") ? rawImage : `${CDN_URL}${rawImage}`) : undefined;

  return (
    <>
      {/* key-ები _app.tsx-ის იგივეა — next/head `property=`-იან meta-ს და
          <link>-ს key-ის გარეშე არ ადედუპლიკატებს და ორივე ნაკრები ჩანდა. */}
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} key="canonical" />
        {SEO_LOCALES.map((locale) => (
          <link
            key={`hreflang-${locale}`}
            rel="alternate"
            hrefLang={locale}
            href={`${BASEPATH}/${locale}/products/${product.id}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${BASEPATH}/${DEFAULT_LOCALE}/products/${product.id}`}
          key="hreflang-x-default"
        />
        <meta property="og:title" content={title} key="title" />
        <meta property="og:description" content={description} key="description" />
        <meta property="og:url" content={url} key="ogUrl" />
        <meta name="twitter:title" content={title} key="twitterTitle" />
        <meta name="twitter:description" content={description} key="twitterDescription" />
        {image && <meta property="og:image" content={image} key="ogImage" />}
      </Head>
      <ProductDetailComponent key={product.id} product={product} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ProductDetailPageProps> = async ({ params, locale }) => {
  const id = params?.id as string;
  // არარიცხვითი id-ით ბექენდი 400-ს აბრუნებს — პირდაპირ ნამდვილი 404
  if (!/^\d+$/.test(id || "")) {
    return { notFound: true };
  }

  try {
    const res = await ProductsAPI(locale || "ka", "").productsControllerFindOne(Number(id));
    return { props: { product: res.data as unknown as Product } };
  } catch (err: any) {
    // 404/400 — ნამდვილი HTTP 404 (soft 404-ის ნაცვლად, რომელსაც საძიებო
    // სისტემები ინდექსავდნენ). სხვა შეცდომა (5xx/timeout) "არ არსებობს"-ად არ
    // უნდა მოჩანდეს — ვისვრით, რომ Next-მა 500 დააბრუნოს.
    if (err?.response?.status === 404 || err?.response?.status === 400) {
      return { notFound: true };
    }
    console.error(`Could not fetch product ${id}:`, err);
    throw err;
  }
};

export default ProductDetailPage;
