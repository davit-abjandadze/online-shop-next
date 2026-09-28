import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { ProductsAPI } from "@/API_Client";
import { Product, ProductVariant } from "@/API_Client/types";
import { DEFAULT_LOCALE } from "@/constants";
import ProductDetailComponent from "@/components/pages/productDetail";
import Seo from "@/components/shared/Seo";
import { getCategoryName, getLocalizedDescription } from "@/utils/getCategoryName";
import { getDiscountedPrice } from "@/utils/getDiscountedPrice";
import { getPublicPageProps } from "@/utils/publicPage";
import {
  absoluteImage,
  absoluteUrl,
  parseProductParam,
  productPath,
  resolveLocale,
  stripHtml,
  truncate,
} from "@/utils/seo";

interface ProductDetailPageProps {
  product: Product | null;
  similarProducts: Product[];
  // მხოლოდ JSON-LD-ისთვის (ფასების დიაპაზონი/მარაგი) — UI თავად ტვირთავს ვარიანტებს
  variants: ProductVariant[];
}

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product, similarProducts, variants }) => {
  const router = useRouter();
  const currentLocale = resolveLocale(router.locale);
  const { t } = useTranslation("product");
  const { t: tc } = useTranslation("common");
  const { t: tCatalog } = useTranslation("catalog");

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
  const productDescription = stripHtml(getLocalizedDescription(product, currentLocale));
  const title = truncate(`${productName} — ${tc("default-page-title")}`, 95);
  const description = productDescription
    ? truncate(productDescription, 155)
    : t("meta-description-fallback", { name: productName });
  const url = absoluteUrl(currentLocale, productPath(product));
  const images = (product.images || []).map((img) => absoluteImage(img)).filter(Boolean) as string[];
  const { price } = getDiscountedPrice(product);

  // ვარიანტებიან პროდუქტზე ფასი/მარაგი ვარიანტებიდან მოდის (ProductCard-ის "დან"
  // ფასის იგივე ლოგიკა, ფასდაკლების ჩათვლით) — სხვადასხვა ფასისას AggregateOffer.
  const buildOffers = () => {
    const base = { priceCurrency: "GEL", url, itemCondition: "https://schema.org/NewCondition" };
    if (variants.length === 0) {
      return {
        "@type": "Offer",
        ...base,
        price: price.toFixed(2),
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      };
    }
    const inStock = variants.some((v) => v.stock > 0);
    const availability = inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
    const candidates = inStock ? variants.filter((v) => v.stock > 0) : variants;
    const prices = candidates.map(
      (v) => getDiscountedPrice({ price: v.resolvedPrice, discountPercent: product.discountPercent }).price
    );
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    if (low === high) return { "@type": "Offer", ...base, price: low.toFixed(2), availability };
    return {
      "@type": "AggregateOffer",
      ...base,
      lowPrice: low.toFixed(2),
      highPrice: high.toFixed(2),
      offerCount: candidates.length,
      availability,
    };
  };

  const category = product.category;
  const breadcrumbItems = [
    { name: tCatalog("breadcrumb-home"), url: absoluteUrl(currentLocale, "") },
    ...(category?.parent
      ? [{ name: getCategoryName(category.parent, currentLocale), url: absoluteUrl(currentLocale, `/categories/${category.parent.slug}`) }]
      : []),
    ...(category ? [{ name: getCategoryName(category, currentLocale), url: absoluteUrl(currentLocale, `/categories/${category.slug}`) }] : []),
    { name: productName, url },
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description,
    sku: String(product.id),
    url,
    ...(images.length ? { image: images } : {}),
    ...(product.company?.name ? { brand: { "@type": "Brand", name: product.company.name } } : {}),
    ...(category ? { category: getCategoryName(category, currentLocale) } : {}),
    offers: buildOffers(),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <Seo
        title={title}
        description={description}
        image={images[0]}
        type="product"
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <Head>
        <meta property="product:price:amount" content={price.toFixed(2)} key="productPrice" />
        <meta property="product:price:currency" content="GEL" key="productCurrency" />
      </Head>
      <ProductDetailComponent key={product.id} product={product} similarProducts={similarProducts} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ProductDetailPageProps> = async ({ params, locale, resolvedUrl, res: httpRes }) => {
  const param = params?.id as string;
  const id = parseProductParam(param);
  // არარიცხვითი id-ით ბექენდი 400-ს აბრუნებს — პირდაპირ ნამდვილი 404
  if (id === null) {
    return { notFound: true };
  }

  try {
    const res = await ProductsAPI(locale || DEFAULT_LOCALE, "").productsControllerFindOne(id);
    const product = res.data as unknown as Product;

    // `/products/123` ან მოძველებული slug → 301 კანონიკურ `/products/123-name`-ზე,
    // რომ Google-მა ერთი URL დააინდექსოს და ძველი ბმულების წონა არ დაიკარგოს.
    const canonical = productPath(product);
    if (`/products/${param}` !== canonical) {
      const query = resolvedUrl.includes("?") ? resolvedUrl.slice(resolvedUrl.indexOf("?")) : "";
      return {
        redirect: { destination: `/${resolveLocale(locale)}${canonical}${query}`, permanent: true },
      };
    }

    // დამატებითი მონაცემები არასავალდებულოა — ჩავარდნისას კლიენტი თავად ტვირთავს
    const lang = locale || DEFAULT_LOCALE;
    const [similarRes, variantsRes, common] = await Promise.all([
      ProductsAPI(lang, "").productsControllerFindSimilar(id, { limit: 8 }).catch(() => null),
      ProductsAPI(lang, "").productsControllerGetVariants(id).catch(() => null),
      getPublicPageProps(httpRes, locale),
    ]);
    const similarProducts = (similarRes?.data as unknown as Product[]) || [];
    const variants = (variantsRes?.data as unknown as ProductVariant[]) || [];

    return {
      props: {
        product,
        similarProducts: Array.isArray(similarProducts) ? similarProducts : [],
        variants: Array.isArray(variants) ? variants : [],
        ...common,
      },
    };
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
