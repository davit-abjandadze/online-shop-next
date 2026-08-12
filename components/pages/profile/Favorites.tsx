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
import { BallotIcon, LockIcon, StarIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

const FAVORITES_PAGE_SIZE = 10;

export const FavoritesComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [favorites, setFavorites] = useState<Question[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);
  const [favoritesPage, setFavoritesPage] = useState<number>(1);
  const [favoritesMeta, setFavoritesMeta] = useState<PaginationMetaDto | null>(null);
  const [favoritingId, setFavoritingId] = useState<number | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [viewResultsSet, setViewResultsSet] = useState<Record<number, boolean>>({});
  const [questionResults, setQuestionResults] = useState<Record<number, ParsedResult>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [votedQuestionIds, setVotedQuestionIds] = useState<Set<number>>(new Set());

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

  const fetchFavorites = async () => {
    if (!session?.accessToken) return;
    setLoadingFavorites(true);
    try {
      const res = await FavoritesAPI(
        router.locale || "ka",
        session.accessToken
      ).favoriteControllerFindMyFavorites(favoritesPage, FAVORITES_PAGE_SIZE);
      const data = res.data as any;
      const qList: Question[] = Array.isArray(data?.data) ? data.data : [];
      setFavorites(qList);
      setFavoritesMeta(data?.meta || null);

      qList.forEach((q) => fetchSingleResults(q));

      try {
        const votedRes = await UserAnswerAPI(
          router.locale || "ka",
          session.accessToken
        ).userAnswerControllerGetMyVotedQuestions();
        const votedIds: number[] = Array.isArray(votedRes.data) ? votedRes.data : [];
        setVotedQuestionIds(new Set(votedIds));
        if (votedIds.length > 0) {
          const newViewResults: Record<number, boolean> = {};
          votedIds.forEach((id) => { newViewResults[id] = true; });
          setViewResultsSet((prev) => ({ ...prev, ...newViewResults }));
        }
      } catch (err) {
        console.log("Could not fetch voted questions:", err);
      }
    } catch {
      toast.error("ფავორიტების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status, session, favoritesPage]);

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
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
            <LockIcon size={48} />
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

  const handleSelectOption = (questionId: number, answerId: number, isMultiple: boolean) => {
    const current = selectedAnswers[questionId] || [];

    if (isMultiple) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: current.includes(answerId)
          ? current.filter((id) => id !== answerId)
          : [...current, answerId],
      });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [questionId]: [answerId] });
    }
  };

  const handleVote = async (q: Question) => {
    if (!session?.accessToken) return;
    const chosen = selectedAnswers[q.id] || [];
    if (chosen.length === 0) {
      toast.warning("გთხოვთ აირჩიოთ მინიმუმ ერთი პასუხი");
      return;
    }

    setSubmittingId(q.id);
    try {
      await UserAnswerAPI(router.locale || "ka", session.accessToken).userAnswerControllerSubmitAnswer(
        String(q.id),
        { answerIds: chosen }
      );
      toast.success("თქვენი ხმა წარმატებით დარეგისტრირდა!");
      setVotedQuestionIds((prev) => new Set(prev).add(q.id));
      await fetchSingleResults(q);
      setViewResultsSet((prev) => ({ ...prev, [q.id]: true }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ხმის მიცემა ვერ მოხერხდა");
    } finally {
      setSubmittingId(null);
    }
  };

  const toggleResultsView = (q: Question) => {
    setViewResultsSet((prev) => {
      const isShowingResults = !!prev[q.id];
      if (!isShowingResults) {
        fetchSingleResults(q);
      }
      return { ...prev, [q.id]: !isShowingResults };
    });
  };

  const handleToggleFavorite = async (question: Question) => {
    if (!session?.accessToken) return;
    setFavoritingId(question.id);
    try {
      await FavoritesAPI(router.locale || "ka", session.accessToken).favoriteControllerRemoveFavorite(
        String(question.id)
      );
      toast.success("ფავორიტი წაიშალა");
      setFavorites((prev) => prev.filter((q) => q.id !== question.id));
      setFavoritesMeta((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფავორიტის წაშლა ვერ მოხერხდა");
    } finally {
      setFavoritingId(null);
    }
  };

  return (
    <ProfileLayout
      activeTab="favorites"
      title="ფავორიტები"
      subtitle="თქვენი ფავორიტი კითხვები"
      favoritesCount={favoritesMeta?.total}
    >
      <S.CardTitle>ფავორიტი კითხვები</S.CardTitle>

      {loadingFavorites ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
        </div>
      ) : favorites.length === 0 ? (
        <S.EmptyState>
          <StarIcon size={48} filled />
          <S.EmptyTitle>ფავორიტები არ არის დამატებული</S.EmptyTitle>
          <S.EmptyText>დაამატეთ კითხვები ფავორიტებში მთავარი გვერდიდან.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={() => router.push("/")}>
            <BallotIcon size={16} /> კითხვების ნახვა
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.FavoritesList>
          {favorites.map((q) => {
            const hasVoted = votedQuestionIds.has(q.id);
            const isShowingResults = hasVoted || !!viewResultsSet[q.id];

            return (
              <QuestionCard
                key={q.id}
                question={q}
                hasVoted={hasVoted}
                isShowingResults={isShowingResults}
                results={questionResults[q.id]}
                chosenIds={selectedAnswers[q.id] || []}
                submitting={submittingId === q.id}
                isFavorite
                favoriting={favoritingId === q.id}
                onSelectOption={(answerId, isMultiple) => handleSelectOption(q.id, answerId, isMultiple)}
                onVote={() => handleVote(q)}
                onToggleResults={() => toggleResultsView(q)}
                onToggleFavorite={() => handleToggleFavorite(q)}
              />
            );
          })}
        </S.FavoritesList>
      )}

      {favoritesMeta && favoritesMeta.totalPages > 1 && (
        <S.PaginationBar>
          <S.PageButton
            onClick={() => setFavoritesPage((p) => Math.max(1, p - 1))}
            disabled={!favoritesMeta.hasPrevious}
          >
            ← 
          </S.PageButton>

          <S.PageNumbers>
            {getPaginationRange(favoritesMeta.page, favoritesMeta.totalPages).map((item, idx) =>
              item === "..." ? (
                <S.PageEllipsis key={`ellipsis-${idx}`}>...</S.PageEllipsis>
              ) : (
                <S.PageNumberButton
                  key={item}
                  active={item === favoritesMeta.page}
                  onClick={() => setFavoritesPage(item)}
                >
                  {item}
                </S.PageNumberButton>
              )
            )}
          </S.PageNumbers>

          <S.PageButton
            onClick={() => setFavoritesPage((p) => p + 1)}
            disabled={!favoritesMeta.hasNext}
          >
           →
          </S.PageButton>
        </S.PaginationBar>
      )}
    </ProfileLayout>
  );
};

export default FavoritesComponent;
