import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { QuestionAPI } from "@/API_Client";
import { Question } from "@/API_Client/client/models";
import { BASEPATH } from "@/constants";
import QuestionDetailComponent from "@/components/pages/questionDetail";

interface QuestionDetailPageProps {
  question: Question | null;
}

const SEO_LOCALES = ["ka", "en", "ru"] as const;

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const QuestionDetailPage: NextPage<QuestionDetailPageProps> = ({ question }) => {
  const router = useRouter();
  const currentLocale = router.locale && router.locale !== "default" ? router.locale : "ka";

  if (!question) {
    return (
      <>
        <Head>
          <title>კითხვა ვერ მოიძებნა - საზოგადოებრივი აზრის პლატფორმა</title>
        </Head>
        <main style={{ padding: "100px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 18 }}>მოთხოვნილი კითხვა ვერ მოიძებნა.</p>
        </main>
      </>
    );
  }

  const title = truncate(`${question.text} — საზოგადოებრივი აზრის პლატფორმა`, 95);
  const description = question.category?.name
    ? `კატეგორია: ${question.category.name}. მიეცით ხმა და იხილეთ საზოგადოებრივი აზრის რეალური შედეგები.`
    : "მიეცით ხმა და იხილეთ საზოგადოებრივი აზრის რეალური შედეგები.";
  const url = `${BASEPATH}/${currentLocale}/questions/${question.id}`;
  const ogImage = `${BASEPATH}/images/og-share.jpg`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "მთავარი",
        item: `${BASEPATH}/${currentLocale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: question.text,
        item: url,
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} key="title" />
        <meta property="og:description" content={description} key="description" />
        <meta property="og:url" content={url} key="ogUrl" />
        <meta property="og:image" content={ogImage} key="ogImage" />
        <meta property="og:image:secure_url" content={ogImage} key="ogImageSecure" />
        <meta property="og:image:width" content="1200" key="ogImageWidth" />
        <meta property="og:image:height" content="630" key="ogImageHeight" />
        <meta name="twitter:card" content="summary_large_image" key="twitterCard" />
        <meta name="twitter:image" content={ogImage} key="twitterImage" />
        <link rel="canonical" href={url} key="canonical" />
        {SEO_LOCALES.map((loc) => (
          <link
            rel="alternate"
            hrefLang={loc}
            href={`${BASEPATH}/${loc}/questions/${question.id}`}
            key={`hreflang-${loc}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${BASEPATH}/ka/questions/${question.id}`}
          key="hreflang-x-default"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          key="jsonld-breadcrumb"
        />
      </Head>
      <main>
        <QuestionDetailComponent question={question} />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<QuestionDetailPageProps> = async (context) => {
  const { id } = context.params as { id: string };
  const locale = context.locale && context.locale !== "default" ? context.locale : "ka";

  try {
    const res = await QuestionAPI(locale, "").questionControllerFindOne(id);
    return { props: { question: res.data ?? null } };
  } catch (err) {
    console.error(`Could not fetch question ${id}:`, err);
    return { props: { question: null } };
  }
};

export default QuestionDetailPage;
