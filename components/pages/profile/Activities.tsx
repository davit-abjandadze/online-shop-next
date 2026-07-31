import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { FavoritesAPI, UserAnswerAPI } from "@/API_Client";
import { PaginationMetaDto, Question } from "@/API_Client/client/models";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { ParsedResult, parseResultsData } from "@/utils/parseQuestionResults";
import { ProfileLayout } from "./ProfileLayout";
import * as S from "./style";

const ACTIVITIES_PAGE_SIZE = 10;

type ActivityItem = { question: Question; myAnswers: { id: number }[]; votedAt: string };

export const ActivitiesComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [activitiesPage, setActivitiesPage] = useState<number>(1);
  const [activitiesMeta, setActivitiesMeta] = useState<PaginationMetaDto | null>(null);
  const [favoriteQuestionIds, setFavoriteQuestionIds] = useState<Set<number>>(new Set());
  const [activityFavoritingId, setActivityFavoritingId] = useState<number | null>(null);
  const [questionResults, setQuestionResults] = useState<Record<number, ParsedResult>>({});

  const fetchSingleResults = async (q: Question) => {
    if (!session?.accessToken) return;
    try {
      const res = await UserAnswerAPI(router.locale || "ka", session.accessToken).userAnswerControllerGetResults(
        String(q.id)
      );
      const parsed = parseResultsData(res.data, q);
      setQuestionResults((prev) => ({ ...prev, [q.id]: parsed }));
    } catch (err) {
      console.log(`Could not fetch results for question ${q.id}:`, err);
    }
  };

  const fetchActivities = async () => {
    if (!session?.accessToken) return;
    setLoadingActivities(true);
    try {
      const res = await UserAnswerAPI(
        router.locale || "ka",
        session.accessToken
      ).userAnswerControllerGetMyActivities(activitiesPage, ACTIVITIES_PAGE_SIZE);
      const data = res.data as any;
      const items: ActivityItem[] = Array.isArray(data?.data) ? data.data : [];
      setActivities(items);
      setActivitiesMeta(data?.meta || null);

      items.forEach((item) => fetchSingleResults(item.question));

      try {
        // Backend caps `limit` at 100, so page through all favorites to collect every id
        const favoriteIds: number[] = [];
        let favPage = 1;
        let hasNext = true;
        while (hasNext) {
          const favoritesRes = await FavoritesAPI(
            router.locale || "ka",
            session.accessToken
          ).favoriteControllerFindMyFavorites(favPage, 100);
          const favData = favoritesRes.data as any;
          const favoritesData = favData?.data;
          if (Array.isArray(favoritesData)) {
            favoriteIds.push(...favoritesData.map((q: any) => q.id).filter((id: any) => id != null));
          }
          hasNext = !!favData?.meta?.hasNext;
          favPage += 1;
        }
        setFavoriteQuestionIds(new Set(favoriteIds));
      } catch (err) {
        console.log("Could not fetch favorite questions:", err);
      }
    } catch {
      toast.error("აქტივობების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleToggleFavoriteInActivities = async (question: Question) => {
    if (!session?.accessToken) return;
    const isFavorite = favoriteQuestionIds.has(question.id);
    setActivityFavoritingId(question.id);
    try {
      if (isFavorite) {
        await FavoritesAPI(router.locale || "ka", session.accessToken).favoriteControllerRemoveFavorite(
          String(question.id)
        );
        setFavoriteQuestionIds((prev) => {
          const next = new Set(prev);
          next.delete(question.id);
          return next;
        });
      } else {
        await FavoritesAPI(router.locale || "ka", session.accessToken).favoriteControllerAddFavorite(
          String(question.id)
        );
        setFavoriteQuestionIds((prev) => new Set(prev).add(question.id));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფავორიტების განახლება ვერ მოხერხდა");
    } finally {
      setActivityFavoritingId(null);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchActivities();
    }
  }, [status, session, activitiesPage]);

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "#65676B" }}>იტვირთება...</p>
          </S.Container>
        </S.PageWrapper>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.AccessDeniedCard>
            <span style={{ fontSize: "48px" }}>🔒</span>
            <S.AccessDeniedTitle>წვდომა უარყოფილია</S.AccessDeniedTitle>
            <S.AccessDeniedText>ამ გვერდზე გადასასვლელად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              მთავარ გვერდზე დაბრუნება
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageWrapper>
      </>
    );
  }

  return (
    <ProfileLayout
      activeTab="activities"
      title="🗂️ აქტივობები"
      subtitle="თქვენი აქტივობების ისტორია"
      activitiesCount={activitiesMeta?.total}
    >
      <S.CardTitle>🗂️ ჩემი აქტივობები</S.CardTitle>

      {loadingActivities ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#65676B" }}>იტვირთება...</p>
        </div>
      ) : activities.length === 0 ? (
        <S.EmptyState>
          <span style={{ fontSize: "48px" }}>🗂️</span>
          <S.EmptyTitle>აქტივობები არ არის</S.EmptyTitle>
          <S.EmptyText>თქვენ ჯერ არ მიგიღიათ მონაწილეობა არცერთ გამოკითხვაში.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={() => router.push("/")}>
            🗳️ კითხვების ნახვა
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.FavoritesList>
          {activities.map(({ question: q, myAnswers }) => (
            <QuestionCard
              key={q.id}
              question={q}
              hasVoted
              isShowingResults
              results={questionResults[q.id]}
              chosenIds={myAnswers.map((a) => a.id)}
              submitting={false}
              isFavorite={favoriteQuestionIds.has(q.id)}
              favoriting={activityFavoritingId === q.id}
              onSelectOption={() => {}}
              onVote={() => {}}
              onToggleResults={() => {}}
              onToggleFavorite={() => handleToggleFavoriteInActivities(q)}
            />
          ))}
        </S.FavoritesList>
      )}

      {activitiesMeta && activitiesMeta.totalPages > 1 && (
        <S.PaginationBar>
          <S.PageButton
            onClick={() => setActivitiesPage((p) => Math.max(1, p - 1))}
            disabled={!activitiesMeta.hasPrevious}
          >
            ← წინა
          </S.PageButton>

          <S.PageNumbers>
            {getPaginationRange(activitiesMeta.page, activitiesMeta.totalPages).map((item, idx) =>
              item === "..." ? (
                <S.PageEllipsis key={`ellipsis-${idx}`}>...</S.PageEllipsis>
              ) : (
                <S.PageNumberButton
                  key={item}
                  active={item === activitiesMeta.page}
                  onClick={() => setActivitiesPage(item)}
                >
                  {item}
                </S.PageNumberButton>
              )
            )}
          </S.PageNumbers>

          <S.PageButton
            onClick={() => setActivitiesPage((p) => p + 1)}
            disabled={!activitiesMeta.hasNext}
          >
            შემდეგი →
          </S.PageButton>
        </S.PaginationBar>
      )}
    </ProfileLayout>
  );
};

export default ActivitiesComponent;
