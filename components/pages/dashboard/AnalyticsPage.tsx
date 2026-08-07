import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { QuestionAPI, StatsAPI } from "@/API_Client";
import { BallotIcon, ChartIcon, FireIcon, PlayIcon, QuestionMarkIcon, TagIcon } from "@/components/ui/RefIcons";
import DashboardLayout from "./DashboardLayout";
import * as S from "./style";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type TrendsPeriod = "week" | "month" | "year";

// ბექიდან მოსული სტატისტიკის პასუხების ტიპი გენერირებულ კლიენტში `void`-ადაა
// მონიშნული (OpenAPI სქემას პასუხის DTO არ ჰქონდა), ამიტომ საველეებს
// რამდენიმე შესაძლო სახელით ვცდით.
const pickField = (obj: any, keys: string[], fallback: any = 0) => {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
};

interface GlobalStats {
  totalQuestions: number;
  totalVotes: number;
  totalCategories: number;
  activeQuestions: number;
}

interface CategoryStat {
  label: string;
  votes: number;
  questionsCount: number;
}

interface PopularQuestion {
  id: number | string;
  text: string;
  votes: number;
}

interface TrendPoint {
  label: string;
  votes: number;
}

const QUESTIONS_FETCH_PAGE_SIZE = 100; // backend-ის მაქსიმალური დასაშვები limit

// ყველა კითხვის წამოღება გვერდობრივად (backend limit-ს არ უშვებს 100-ზე მეტს),
// რომ "აქტიური კითხვების" რაოდენობა რეალურ სიაზე დაყრდნობით გამოვთვალოთ.
const fetchAllQuestions = async (
  api: ReturnType<typeof QuestionAPI>
): Promise<{ list: any[]; total: number }> => {
  const list: any[] = [];
  let page = 1;
  let totalPages = 1;
  let total = 0;
  do {
    const res = await api.questionControllerFindAll(page, QUESTIONS_FETCH_PAGE_SIZE);
    const data = res.data as any;
    const pageList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    list.push(...pageList);
    totalPages = pickField(data?.meta, ["totalPages"], 1);
    total = pickField(data?.meta, ["total"], list.length);
    page += 1;
  } while (page <= totalPages);
  return { list, total };
};

export const AnalyticsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [popularQuestions, setPopularQuestions] = useState<PopularQuestion[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [trendsPeriod, setTrendsPeriod] = useState<TrendsPeriod>("month");
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsLoaded, setStatsLoaded] = useState<boolean>(false);

  const isAdmin = status === "authenticated" && session?.user?.role?.toLowerCase() === "admin";

  const fetchTrends = async () => {
    if (!session?.accessToken) return;
    try {
      const api = StatsAPI(router.locale || "ka", session.accessToken);
      const trendsRes = await api.statsControllerGetTrends(trendsPeriod);
      const tData = trendsRes.data as any;
      const tList = Array.isArray(tData)
        ? tData
        : Array.isArray(tData?.dailyVotes)
        ? tData.dailyVotes
        : Array.isArray(tData?.data)
        ? tData.data
        : [];
      setTrends(
        tList.map((item: any) => ({
          label: pickField(item, ["label", "date", "period", "day"], "—"),
          votes: pickField(item, ["votes", "votesCount", "totalVotes", "count"]),
        }))
      );
    } catch {
      toast.error("ტრენდის ჩატვირთვა ვერ მოხერხდა");
    }
  };

  const fetchStats = async () => {
    if (!session?.accessToken) return;
    setLoadingStats(true);
    try {
      const api = StatsAPI(router.locale || "ka", session.accessToken);
      const [globalRes, categoriesRes, popularRes, trendsRes, questionsData] = await Promise.all([
        api.statsControllerGetGlobalStats(),
        api.statsControllerGetCategoriesStats(),
        api.statsControllerGetPopularQuestions(5),
        api.statsControllerGetTrends(trendsPeriod),
        // გლობალურ სტატისტიკაში "აქტიური კითხვების" ველი დაუდასტურებელია (backend
        // პასუხის სქემა `void`-ია), ამიტომ აქტიურობას ვითვლით რეალური კითხვების
        // სიიდან იმავე წესით, რასაც მთავარი გვერდი იყენებს ხმის მისაცემად
        // საჩვენებელი კითხვების გასაფილტრად: isActive === true და (endDate არ არსებობს ან ჯერ არ გასულა).
        fetchAllQuestions(QuestionAPI(router.locale || "ka", session.accessToken)),
      ]);

      const { list: qList, total: totalQuestionsFromList } = questionsData;
      const activeQuestionsCount = qList.filter((q) => {
        if (!q?.isActive) return false;
        if (q.endDate && new Date(q.endDate).getTime() < Date.now()) return false;
        return true;
      }).length;

      const cData = categoriesRes.data as any;
      const cList = Array.isArray(cData)
        ? cData
        : Array.isArray(cData?.categories)
        ? cData.categories
        : Array.isArray(cData?.data)
        ? cData.data
        : [];
      setCategoryStats(
        cList.map((item: any) => ({
          label: pickField(item, ["name", "categoryName", "label"], "—"),
          votes: pickField(item, ["totalVotes", "votesCount", "votes", "count"]),
          questionsCount: pickField(item, ["totalQuestions", "questionsCount", "questions"]),
        }))
      );

      const g = globalRes.data as any;
      setGlobalStats({
        totalQuestions: pickField(g, ["totalQuestions", "questionsCount", "questions"], totalQuestionsFromList),
        totalVotes: pickField(g, ["totalVotes", "votesCount", "totalAnswers", "votes"]),
        // "/stats/global"-ს არ აქვს კატეგორიების საერთო რაოდენობის ველი,
        // ამიტომ ვიღებთ "/stats/categories"-დან რეალურად წამოსული სიის სიგრძეს.
        totalCategories: pickField(g, ["totalCategories", "categoriesCount", "categories"], cList.length),
        activeQuestions: activeQuestionsCount,
      });

      const pData = popularRes.data as any;
      const pList = Array.isArray(pData)
        ? pData
        : Array.isArray(pData?.mostVoted)
        ? pData.mostVoted
        : Array.isArray(pData?.data)
        ? pData.data
        : [];
      setPopularQuestions(
        pList.map((item: any) => {
          const question = pickField(item, ["question"], item);
          return {
            id: pickField(question, ["id", "questionId"], Math.random()),
            text: pickField(question, ["text", "questionText", "title"], "—"),
            votes: pickField(item, ["votes", "votesCount", "totalVotes", "count"]),
          };
        })
      );

      const tData = trendsRes.data as any;
      const tList = Array.isArray(tData)
        ? tData
        : Array.isArray(tData?.dailyVotes)
        ? tData.dailyVotes
        : Array.isArray(tData?.data)
        ? tData.data
        : [];
      setTrends(
        tList.map((item: any) => ({
          label: pickField(item, ["label", "date", "period", "day"], "—"),
          votes: pickField(item, ["votes", "votesCount", "totalVotes", "count"]),
        }))
      );

      setStatsLoaded(true);
    } catch {
      toast.error("ანალიტიკის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  useEffect(() => {
    if (isAdmin && statsLoaded) {
      fetchTrends();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendsPeriod]);

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ რეფერენდუმის კითხვები, კატეგორიები და სავარაუდო პასუხები"
    >
      {loadingStats && !statsLoaded ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--ref-text-secondary)" }}>ანალიტიკა იტვირთება...</p>
        </div>
      ) : (
        <>
          <S.StatsGrid>
            <S.StatCard>
              <S.StatIcon><QuestionMarkIcon size={24} /></S.StatIcon>
              <S.StatInfo>
                <S.StatValue>{globalStats?.totalQuestions ?? 0}</S.StatValue>
                <S.StatLabel>სულ კითხვები</S.StatLabel>
              </S.StatInfo>
            </S.StatCard>
            <S.StatCard>
              <S.StatIcon><BallotIcon size={24} /></S.StatIcon>
              <S.StatInfo>
                <S.StatValue>{globalStats?.totalVotes ?? 0}</S.StatValue>
                <S.StatLabel>სულ ხმები</S.StatLabel>
              </S.StatInfo>
            </S.StatCard>
            <S.StatCard>
              <S.StatIcon><PlayIcon size={24} /></S.StatIcon>
              <S.StatInfo>
                <S.StatValue>{globalStats?.activeQuestions ?? 0}</S.StatValue>
                <S.StatLabel>აქტიური კითხვები</S.StatLabel>
              </S.StatInfo>
            </S.StatCard>
            <S.StatCard>
              <S.StatIcon><TagIcon size={24} /></S.StatIcon>
              <S.StatInfo>
                <S.StatValue>{globalStats?.totalCategories ?? 0}</S.StatValue>
                <S.StatLabel>კატეგორიები</S.StatLabel>
              </S.StatInfo>
            </S.StatCard>
          </S.StatsGrid>

          <S.ChartsGrid>
            <S.ChartCard>
              <S.ChartCardTitle>
                <S.ChartTitleText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TagIcon size={18} /> ხმები კატეგორიების მიხედვით
                </S.ChartTitleText>
              </S.ChartCardTitle>
              {categoryStats.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--ref-text-secondary)" }}>მონაცემები არ არის</p>
              ) : (
                <S.ChartCanvasWrapper>
                  <Bar
                    data={{
                      labels: categoryStats.map((c) => c.label),
                      datasets: [
                        {
                          label: "ხმები",
                          data: categoryStats.map((c) => c.votes),
                          backgroundColor: "#1877F2",
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                    }}
                  />
                </S.ChartCanvasWrapper>
              )}
            </S.ChartCard>

            <S.ChartCard>
              <S.ChartCardTitle>
                <S.ChartTitleText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ChartIcon size={18} /> ხმების ტრენდი
                </S.ChartTitleText>
                <S.PeriodSelector>
                  <S.PeriodButton active={trendsPeriod === "week"} onClick={() => setTrendsPeriod("week")}>კვირა</S.PeriodButton>
                  <S.PeriodButton active={trendsPeriod === "month"} onClick={() => setTrendsPeriod("month")}>თვე</S.PeriodButton>
                  <S.PeriodButton active={trendsPeriod === "year"} onClick={() => setTrendsPeriod("year")}>წელი</S.PeriodButton>
                </S.PeriodSelector>
              </S.ChartCardTitle>
              {trends.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--ref-text-secondary)" }}>მონაცემები არ არის</p>
              ) : (
                <S.ChartCanvasWrapper>
                  <Line
                    data={{
                      labels: trends.map((t) => t.label),
                      datasets: [
                        {
                          label: "ხმები",
                          data: trends.map((t) => t.votes),
                          borderColor: "#1877F2",
                          backgroundColor: "rgba(37, 99, 235, 0.1)",
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                    }}
                  />
                </S.ChartCanvasWrapper>
              )}
            </S.ChartCard>
          </S.ChartsGrid>

          <S.ChartCard>
            <S.ChartCardTitle>
              <S.ChartTitleText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FireIcon size={18} /> პოპულარული კითხვები
              </S.ChartTitleText>
            </S.ChartCardTitle>
            {popularQuestions.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--ref-text-secondary)" }}>მონაცემები არ არის</p>
            ) : (
              <S.PopularQuestionsList>
                {popularQuestions.map((q, idx) => (
                  <S.PopularQuestionRow key={q.id}>
                    <S.PopularRank>{idx + 1}</S.PopularRank>
                    <S.PopularQuestionInfo>
                      <S.PopularQuestionText title={q.text}>{q.text}</S.PopularQuestionText>
                      <S.PopularQuestionMeta>კითხვის ID: {q.id}</S.PopularQuestionMeta>
                    </S.PopularQuestionInfo>
                    <S.PopularQuestionVotes>{q.votes} ხმა</S.PopularQuestionVotes>
                  </S.PopularQuestionRow>
                ))}
              </S.PopularQuestionsList>
            )}
          </S.ChartCard>
        </>
      )}
    </DashboardLayout>
  );
};

export default AnalyticsPage;
