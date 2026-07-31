import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper";
import Header from "@/components/shared/Header";
import ReferendumFooter from "@/components/shared/ReferendumFooter";
import AuthModal from "@/components/shared/AuthModal";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { CategoriesAPI, FavoritesAPI, QuestionAPI, StatsAPI, UserAnswerAPI } from "@/API_Client";
import { Category, PaginationMetaDto, Question } from "@/API_Client/client/models";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { ParsedResult, parseResultsData } from "@/utils/parseQuestionResults";
import { BallotIcon, ClipboardIcon, FireIcon, SearchIcon, TagIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

const QUESTIONS_PAGE_SIZE = 6;
const POPULAR_QUESTIONS_LIMIT = 5;

// ბექიდან მოსული `popular-questions` პასუხის ტიპი გენერირებულ კლიენტში
// `void`-ადაა მონიშნული (OpenAPI სქემას პასუხის DTO არ ჰქონდა), ამიტომ
// საველეებს რამდენიმე შესაძლო სახელით ვცდით.
const pickField = (obj: any, keys: string[], fallback: any = undefined) => {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
};

interface PopularQuestion {
  id: number;
  text: string;
  categoryName?: string;
  votes: number;
}

export const HomeComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [questionsMeta, setQuestionsMeta] = useState<PaginationMetaDto | null>(null);

  // Selected answer IDs per questionId: { [questionId]: number[] }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});

  // Question IDs where user has voted or is viewing results: Set<number>
  const [viewResultsSet, setViewResultsSet] = useState<Record<number, boolean>>({});

  // Parsed results per questionId: { [questionId]: ParsedResult }
  const [questionResults, setQuestionResults] = useState<Record<number, ParsedResult>>({});

  // Loading state during voting submission
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  // Auth modal control if guest tries to vote
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [votedQuestionIds, setVotedQuestionIds] = useState<Set<number>>(new Set());

  // Categories for filter
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  // Favorite question IDs and per-question loading state during toggle
  const [favoriteQuestionIds, setFavoriteQuestionIds] = useState<Set<number>>(new Set());
  const [favoritingId, setFavoritingId] = useState<number | null>(null);

  // Popular questions slider
  const [popularQuestions, setPopularQuestions] = useState<PopularQuestion[]>([]);
  const [loadingPopular, setLoadingPopular] = useState<boolean>(true);
  const [popularPrevEl, setPopularPrevEl] = useState<HTMLButtonElement | null>(null);
  const [popularNextEl, setPopularNextEl] = useState<HTMLButtonElement | null>(null);

  // Fetch results for a single question
  const fetchSingleResults = async (q: Question) => {
    try {
      const res = await UserAnswerAPI(
        router.locale || "ka",
        session?.accessToken || ""
      ).userAnswerControllerGetResults(String(q.id));

      const parsed = parseResultsData(res.data, q);
      setQuestionResults((prev) => ({ ...prev, [q.id]: parsed }));
    } catch (err: any) {
      console.log(`Could not fetch results for question ${q.id}:`, err);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    fetchQuestions();
    fetchCategories();
    fetchPopularQuestions();
  }, [status, session?.accessToken, page]);

  // Fetch questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await QuestionAPI(
        router.locale || "ka",
        session?.accessToken || ""
      ).questionControllerFindAll(page, QUESTIONS_PAGE_SIZE);

      const qList = Array.isArray(res.data?.data) ? res.data.data : [];
      setQuestions(qList);
      setQuestionsMeta(res.data?.meta || null);

      qList.forEach((q: any) => {
        fetchSingleResults(q);
      });

      if (status === "authenticated" && session?.accessToken) {
        try {
          const votedRes = await UserAnswerAPI(
            router.locale || "ka",
            session.accessToken
          ).userAnswerControllerGetMyVotedQuestions();

          const votedIds: number[] = Array.isArray(votedRes.data) ? votedRes.data : [];

          if (votedIds.length > 0) {
            setVotedQuestionIds(new Set(votedIds));
            const newViewResults: Record<number, boolean> = {};
            votedIds.forEach((id) => { newViewResults[id] = true; });
            setViewResultsSet((prev) => ({ ...prev, ...newViewResults }));
          }
        } catch (err) {
          console.log("Could not fetch voted questions:", err);
        }

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

            const data = favoritesRes.data as any;
            const favoritesData = data?.data;
            if (Array.isArray(favoritesData)) {
              favoriteIds.push(...favoritesData.map((q: any) => q.id).filter((id: any) => id != null));
            }

            hasNext = !!data?.meta?.hasNext;
            favPage += 1;
          }

          setFavoriteQuestionIds(new Set(favoriteIds));
        } catch (err) {
          console.log("Could not fetch favorite questions:", err);
        }
      }
    } catch (err: any) {
      console.error("Error fetching questions:", err);
      toast.error("კითხვების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await CategoriesAPI(router.locale || "ka", session?.accessToken || "").categoryControllerFindAll();
      const data = res.data as any;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // categories are optional, ignore errors silently
    }
  };

  const fetchPopularQuestions = async () => {
    setLoadingPopular(true);
    try {
      const res = await StatsAPI(
        router.locale || "ka",
        session?.accessToken || ""
      ).statsControllerGetPopularQuestions(POPULAR_QUESTIONS_LIMIT);

      const data = res.data as any;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.mostVoted)
        ? data.mostVoted
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setPopularQuestions(
        list.map((item: any) => {
          const question = pickField(item, ["question"], item);
          return {
            id: pickField(question, ["id", "questionId"]),
            text: pickField(question, ["text", "questionText", "title"], "—"),
            categoryName: pickField(question, ["category", "categoryName"]) || question?.category?.name,
            votes: pickField(item, ["votes", "votesCount", "totalVotes", "count"], 0),
          };
        })
      );
    } catch {
      // popular questions are optional, ignore errors silently
    } finally {
      setLoadingPopular(false);
    }
  };

  const handlePopularCardClick = (questionId: number) => {
    const el = document.getElementById(`question-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };


  // Handle Option Click
  const handleSelectOption = (questionId: number, answerId: number, isMultiple: boolean) => {
    const current = selectedAnswers[questionId] || [];

    if (isMultiple) {
      if (current.includes(answerId)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionId]: current.filter((id) => id !== answerId),
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionId]: [...current, answerId],
        });
      }
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: [answerId],
      });
    }
  };

  // Handle Voting Submit
  const handleVote = async (q: Question) => {
    if (status !== "authenticated" || !session?.accessToken) {
      toast.info("ხმის მისაცემად გთხოვთ გაიაროთ ავტორიზაცია");
      setAuthModalOpen(true);
      return;
    }

    const chosen = selectedAnswers[q.id] || [];

    if (chosen.length === 0) {
      toast.warning("გთხოვთ აირჩიოთ მინიმუმ ერთი პასუხი");
      return;
    }

    setSubmittingId(q.id);
    try {
      await UserAnswerAPI(
        router.locale || "ka",
        session.accessToken
      ).userAnswerControllerSubmitAnswer({ answerIds: chosen }, String(q.id));

      toast.success("თქვენი ხმა წარმატებით დარეგისტრირდა!");

      setVotedQuestionIds((prev) => new Set(prev).add(q.id));

      await fetchSingleResults(q);
      setViewResultsSet((prev) => ({ ...prev, [q.id]: true }));
    } catch (err: any) {
      console.error("Error submitting vote:", err);
      toast.error(err?.response?.data?.message || "ხმის მიცემა ვერ მოხერხდა");
    } finally {
      setSubmittingId(null);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (q: Question) => {
    if (status !== "authenticated" || !session?.accessToken) {
      toast.info("ფავორიტებში დასამატებლად გთხოვთ გაიაროთ ავტორიზაცია");
      setAuthModalOpen(true);
      return;
    }

    const isFavorite = favoriteQuestionIds.has(q.id);
    setFavoritingId(q.id);
    try {
      if (isFavorite) {
        await FavoritesAPI(
          router.locale || "ka",
          session.accessToken
        ).favoriteControllerRemoveFavorite(String(q.id));

        setFavoriteQuestionIds((prev) => {
          const next = new Set(prev);
          next.delete(q.id);
          return next;
        });
      } else {
        await FavoritesAPI(
          router.locale || "ka",
          session.accessToken
        ).favoriteControllerAddFavorite(String(q.id));

        setFavoriteQuestionIds((prev) => new Set(prev).add(q.id));
      }
    } catch (err: any) {
      // Local state was stale (e.g. already favorited server-side) — resync instead of erroring
      if (err?.response?.status === 409) {
        setFavoriteQuestionIds((prev) => new Set(prev).add(q.id));
      } else if (err?.response?.status === 404 && isFavorite) {
        setFavoriteQuestionIds((prev) => {
          const next = new Set(prev);
          next.delete(q.id);
          return next;
        });
      } else {
        console.error("Error toggling favorite:", err);
        toast.error(err?.response?.data?.message || "ფავორიტების განახლება ვერ მოხერხდა");
      }
    } finally {
      setFavoritingId(null);
    }
  };

  // Toggle Results / Vote View
  const toggleResultsView = (q: Question) => {
    setViewResultsSet((prev) => {
      const isShowingResults = !!prev[q.id];
      if (!isShowingResults) {
        fetchSingleResults(q);
      }
      return { ...prev, [q.id]: !isShowingResults };
    });
  };


  useEffect(() => {
   console.log(popularQuestions)
  }, [popularQuestions])
  
  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Hero Banner */}
      <S.HeroSection>
        <S.HeroTitle><BallotIcon size={32} /> სახალხო რეფერენდუმი</S.HeroTitle>
        <S.HeroSubtitle>
          დააფიქსირეთ თქვენი პოზიცია მნიშვნელოვან საკითხებზე და იხილეთ საზოგადოებრივი აზრის რეალური შედეგები.
        </S.HeroSubtitle>
      </S.HeroSection>

      {/* Popular Active Questions Slider */}
      {!loadingPopular && popularQuestions.length > 0 && (() => {
        const maxVotes = Math.max(...popularQuestions.map((pq) => pq.votes), 1);

        return (
          <S.PopularSection>
            <S.PopularSectionHeader>
              <S.PopularSectionTitle>
                <FireIcon size={22} /> პოპულარული კითხვები
              </S.PopularSectionTitle>
              <S.PopularNavButtons>
                <S.PopularNavButton ref={setPopularPrevEl} type="button" aria-label="წინა">
                  ‹
                </S.PopularNavButton>
                <S.PopularNavButton ref={setPopularNextEl} type="button" aria-label="შემდეგი">
                  ›
                </S.PopularNavButton>
              </S.PopularNavButtons>
            </S.PopularSectionHeader>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation={{ prevEl: popularPrevEl, nextEl: popularNextEl }}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop={popularQuestions.length > 3}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {popularQuestions.map((pq, idx) => {
                const rank = idx + 1;
                const percent = (pq.votes / maxVotes) * 100;

                return (
                  <SwiperSlide key={pq.id}>
                    <S.PopularCard rank={rank} onClick={() => handlePopularCardClick(pq.id)}>
                      {rank === 1 && (
                        <S.PopularTrendingTag>
                          <FireIcon size={12} /> ტრენდში
                        </S.PopularTrendingTag>
                      )}
                      <S.PopularCardTop>
                        <S.PopularRankBadge rank={rank}>{rank}</S.PopularRankBadge>
                        <S.PopularCardText>{pq.text}</S.PopularCardText>
                      </S.PopularCardTop>
                      <S.PopularVoteBarTrack>
                        <S.PopularVoteBarFill percent={percent} />
                      </S.PopularVoteBarTrack>
                      <S.PopularCardFooter>
                        <S.PopularVotesBadge><BallotIcon size={14} /> {pq.votes} ხმა</S.PopularVotesBadge>
                        {pq.categoryName && (
                          <S.PopularCategoryLabel>
                            <TagIcon size={13} /> {pq.categoryName}
                          </S.PopularCategoryLabel>
                        )}
                      </S.PopularCardFooter>
                    </S.PopularCard>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </S.PopularSection>
        );
      })()}

      <S.Container>
        <S.SectionHeader>
          <S.SectionTitle>
            <ClipboardIcon size={24} /> აქტიური კითხვები
          </S.SectionTitle>
        </S.SectionHeader>

        {/* Category Filter Bar */}
        {categories.length > 0 && (
          <S.FilterBar>
            <S.FilterChip active={activeCategoryId === null} onClick={() => setActiveCategoryId(null)}>
              <BallotIcon size={16} /> ყველა
            </S.FilterChip>
            {categories.map((cat) => (
              <S.FilterChip
                key={cat.id}
                active={activeCategoryId === cat.id}
                onClick={() => setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)}
              >
                <TagIcon size={16} /> {cat.name}
              </S.FilterChip>
            ))}
          </S.FilterBar>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <p style={{ fontSize: "18px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
          </div>
        ) : questions.length === 0 ? (
          <S.EmptyState>
            <BallotIcon size={48} />
            <S.EmptyStateTitle>
              ამ ეტაპზე აქტიური კითხვები არ არის
            </S.EmptyStateTitle>
            <S.EmptyStateText>
              გთხოვთ მოგვიანებით შეამოწმოთ.
            </S.EmptyStateText>
          </S.EmptyState>
        ) : (() => {
          const activeQuestions = questions.filter((q) => {
            if (!q.isActive) return false;
            if (q.endDate && new Date(q.endDate).getTime() < Date.now()) return false;
            return true;
          });

          const filteredQuestions = activeCategoryId === null
            ? activeQuestions
            : activeQuestions.filter((q) => (q as any).categoryId === activeCategoryId || q.category?.id === activeCategoryId);

          if (filteredQuestions.length === 0) {
            return (
              <S.EmptyState>
                <SearchIcon size={48} />
                <S.EmptyStateTitle>
                  {activeCategoryId === null ? "აქტიური კითხვები არ არის" : "ამ კატეგორიაში აქტიური კითხვები არ არის"}
                </S.EmptyStateTitle>
              </S.EmptyState>
            );
          }

          return (
            <S.QuestionsGrid>
              {filteredQuestions.map((q) => {
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
                    isFavorite={favoriteQuestionIds.has(q.id)}
                    favoriting={favoritingId === q.id}
                    onSelectOption={(answerId, isMultiple) => handleSelectOption(q.id, answerId, isMultiple)}
                    onVote={() => handleVote(q)}
                    onToggleResults={() => toggleResultsView(q)}
                    onToggleFavorite={() => handleToggleFavorite(q)}
                  />
                );
              })}
            </S.QuestionsGrid>
          );
        })()}

        {questionsMeta && questionsMeta.totalPages > 1 && (
          <S.PaginationBar>
            <S.PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!questionsMeta.hasPrevious}
            >
              ← წინა
            </S.PageButton>

            <S.PageNumbers>
              {getPaginationRange(questionsMeta.page, questionsMeta.totalPages).map((item, idx) =>
                item === "..." ? (
                  <S.PageEllipsis key={`ellipsis-${idx}`}>...</S.PageEllipsis>
                ) : (
                  <S.PageNumberButton
                    key={item}
                    active={item === questionsMeta.page}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </S.PageNumberButton>
                )
              )}
            </S.PageNumbers>

            <S.PageButton
              onClick={() => setPage((p) => p + 1)}
              disabled={!questionsMeta.hasNext}
            >
              შემდეგი →
            </S.PageButton>
          </S.PaginationBar>
        )}
      </S.Container>

      <ReferendumFooter />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </S.PageBackground>
  );
};

export default HomeComponent;
