import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { QuestionAPI } from "@/API_Client";
import { Question } from "@/API_Client/client/models";
import { BASEPATH } from "@/constants";
import QuestionDetailComponent from "@/components/pages/questionDetail";

interface QuestionDetailPageProps {
  question: Question | null;
}

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const QuestionDetailPage: NextPage<QuestionDetailPageProps> = ({ question }) => {
  if (!question) {
    return (
      <>
        <Head>
          <title>კითხვა ვერ მოიძებნა - სახალხო რეფერენდუმი</title>
        </Head>
        <main style={{ padding: "100px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 18 }}>მოთხოვნილი კითხვა ვერ მოიძებნა.</p>
        </main>
      </>
    );
  }

  const title = truncate(`${question.text} — სახალხო რეფერენდუმი`, 95);
  const description = question.category?.name
    ? `კატეგორია: ${question.category.name}. მიეცით ხმა და იხილეთ საზოგადოებრივი აზრის რეალური შედეგები.`
    : "მიეცით ხმა და იხილეთ საზოგადოებრივი აზრის რეალური შედეგები.";
  const url = `${BASEPATH}/questions/${question.id}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} key="title" />
        <meta property="og:description" content={description} key="description" />
        <meta property="og:url" content={url} key="ogUrl" />
        <link rel="canonical" href={url} key="canonical" />
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
