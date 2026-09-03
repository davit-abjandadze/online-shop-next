import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { ProductsAPI } from "@/API_Client";
import { Product } from "@/API_Client/types";
import { BASEPATH } from "@/constants";
import ProductDetailComponent from "@/components/pages/productDetail";

interface ProductDetailPageProps {
  product: Product | null;
}

const SEO_LOCALES = ["ka", "en", "ru"] as const;

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product }) => {
  const router = useRouter();
  const currentLocale = router.locale && router.locale !== "default" ? router.locale : "ka";

  if (!product) {
    return (
      <>
        <Head>
          <title>პროდუქტი ვერ მოიძებნა - მაღაზია</title>
        </Head>
        <main style={{ padding: "100px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 18 }}>მოთხოვნილი პროდუქტი ვერ მოიძებნა.</p>
        </main>
      </>
    );
  }

  const title = truncate(`${product.name} — მაღაზია`, 95);
  const description = product.description
    ? truncate(product.description, 155)
    : `შეიძინეთ ${product.name} ჩვენს ონლაინ მაღაზიაში.`;
  const url = `${BASEPATH}/${currentLocale}/products/${product.id}`;
  const image = product.images?.[0];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        {SEO_LOCALES.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={`${BASEPATH}/${locale}/products/${product.id}`}
          />
        ))}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        {image && <meta property="og:image" content={image} />}
      </Head>
      <ProductDetailComponent product={product} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ProductDetailPageProps> = async ({ params, locale }) => {
  const id = params?.id as string;

  try {
    const res = await ProductsAPI(locale || "ka", "").productsControllerFindOne(id);
    return { props: { product: res.data as unknown as Product } };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return { props: { product: null } };
    }
    console.error(`Could not fetch product ${id}:`, err);
    return { props: { product: null } };
  }
};

export default ProductDetailPage;
