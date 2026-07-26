import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import AuthModal from "@/components/shared/AuthModal";
import { CategoriesAPI, QuestionAPI, UserAnswerAPI } from "@/API_Client";
import { Category, Question } from "@/API_Client/client/models";
import * as S from "./style";

interface ParsedResult {
  totalUsers: number;
  answerCounts: Record<number, number>;
  answerPercentages: Record<number, number>;
}

export const HomeComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
  // Parse backend results into total votes and percentage breakdown
  const parseResultsData = (data: any, question: Question): ParsedResult => {
    const answerCounts: Record<number, number> = {};
    const answerPercentages: Record<number, number> = {};
    (question.answers || []).forEach((ans) => {
      answerCounts[ans.id] = 0;
      answerPercentages[ans.id] = 0;
    });

    // Log raw API response for debugging
    console.log(`[parseResultsData] question ${question.id} raw data:`, JSON.stringify(data, null, 2));

    let totalUsers = 0;

    if (!data) {
      return { totalUsers: 0, answerCounts, answerPercentages };
    }

    if (Array.isArray(data)) {
      // Count unique users (a user may have multiple UserAnswer rows for multiple-choice)
      const uniqueUserIds = new Set<number | string>();
      data.forEach((item: any) => {
        // Count answer occurrences
        const aId = item.answer?.id ?? item.answerId;
        if (aId != null && answerCounts[aId] !== undefined) {
          answerCounts[aId] += 1;
        }
        // Track unique users
        const uId = item.user?.id ?? item.userId;
        if (uId != null) uniqueUserIds.add(uId);
      });
      // totalUsers = unique voters; fallback to array length
      totalUsers = uniqueUserIds.size > 0 ? uniqueUserIds.size : data.length;
    } else if (typeof data === "object") {
      totalUsers = data.totalUsers || data.totalVotes || data.total || 0;
      if (Array.isArray(data.answers)) {
        data.answers.forEach((ans: any) => {
          const aId = ans.id || ans.answerId;
          if (aId != null) {
            answerCounts[aId] = ans.count ?? ans.votes ?? 0;
          }
        });
      } else if (data.answerCounts && typeof data.answerCounts === "object") {
        Object.entries(data.answerCounts).forEach(([aIdStr, count]) => {
          const aId = Number(aIdStr);
          if (answerCounts[aId] !== undefined) {
            answerCounts[aId] = Number(count);
          }
        });
      } else if (data.results && Array.isArray(data.results)) {
        data.results.forEach((r: any) => {
          const aId = r.answerId ?? r.answer?.id ?? r.id;
          if (aId != null) {
            answerCounts[aId] = r.count ?? r.votes ?? 0;
          }
        });
      }
    }

    // Calculate percentages based on total answer submissions (sum of counts)
    let totalVotesCount = 0;
    Object.values(answerCounts).forEach((c) => (totalVotesCount += c));

    // Use unique users if available, else sum of votes as base for %
    const percentageBase = totalUsers > 0 ? totalUsers : totalVotesCount;
    const divisor = percentageBase > 0 ? percentageBase : 1;

    (question.answers || []).forEach((ans) => {
      const cnt = answerCounts[ans.id] || 0;
      answerPercentages[ans.id] = percentageBase > 0 ? Math.min(100, Math.round((cnt / divisor) * 100)) : 0;
    });

    console.log(`[parseResultsData] question ${question.id} parsed:`, { totalUsers: totalUsers > 0 ? totalUsers : totalVotesCount, answerCounts, answerPercentages });

    return {
      totalUsers: totalUsers > 0 ? totalUsers : totalVotesCount,
      answerCounts,
      answerPercentages,
    };
  };

  // Fetch results for a single question
  // ეს ფუნქცია უცვლელი რჩება, უბრალოდ დარწმუნდი რომ session?.user?.id-ს იყენებს
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

  // ⭐ განახლებული useEffect: ველოდებით სტატუსს
  useEffect(() => {
    // თუ სესია ჯერ კიდევ იტვირთება, არაფერს ვაკეთებთ (ვჩვენებთ ლოადერს)
    if (status === "loading") return;

    fetchQuestions();
    // დამოკიდებულებაში ვამატებთ status-ს, რომ რეფრეშისას სწორად რეაგირებდეს
  }, [status, session]);

  // Fetch questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // 1. ჩავტვირთოთ კითხვები
      const res = await QuestionAPI(
        router.locale || "ka",
        session?.accessToken || ""
      ).questionControllerFindAll();

      const qList = Array.isArray(res.data) ? res.data : [];
      setQuestions(qList);

      // 2. ჩავტვირთოთ შედეგები თითოეული კითხვისთვის
      qList.forEach((q: any) => {
        fetchSingleResults(q);
      });

      // ⭐ 3. ახალი ლოგიკა: ჩავტვირთოთ კითხვები, რომლებზეც უკვე აქვს ხმა მიცემული
      if (status === "authenticated" && session?.accessToken) {
        try {
          const votedRes = await UserAnswerAPI(
            router.locale || "ka",
            session.accessToken
          ).userAnswerControllerGetMyVotedQuestions(); // ← ახალი მეთოდი

          const votedIds: number[] = Array.isArray(votedRes.data) ? votedRes.data : [];

          if (votedIds.length > 0) {
            setVotedQuestionIds(new Set(votedIds));
            // ავტომატურად ვაჩვენოთ შედეგები ამ კითხვებზე
            const newViewResults: Record<number, boolean> = {};
            votedIds.forEach(id => { newViewResults[id] = true; });
            setViewResultsSet(prev => ({ ...prev, ...newViewResults }));
          }
        } catch (err) {
          console.log("Could not fetch voted questions:", err);
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

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [session]);

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
    // 1. შემოწმება: არის თუ არა მომხმარებელი ავტორიზებული
    if (status !== "authenticated" || !session?.accessToken) {
      toast.info("ხმის მისაცემად გთხოვთ გაიაროთ ავტორიზაცია");
      setAuthModalOpen(true);
      return;
    }

    // 2. ⭐ ეს ხაზი აუცილებელია! იღებს არჩეულ პასუხებს კონკრეტული კითხვისთვის
    const chosen = selectedAnswers[q.id] || [];

    // 3. შემოწმება: არის თუ არა არჩეული რამე
    if (chosen.length === 0) {
      toast.warning("გთხოვთ აირჩიოთ მინიმუმ ერთი პასუხი");
      return;
    }

    setSubmittingId(q.id);
    try {
      // 4. API-ს გამოძახება (აქ უკვე 'chosen' განსაზღვრულია)
      await UserAnswerAPI(
        router.locale || "ka",
        session.accessToken
      ).userAnswerControllerSubmitAnswer({ answerIds: chosen }, String(q.id));

      toast.success("თქვენი ხმა წარმატებით დარეგისტრირდა!");

      // 5. დავამატოთ ეს კითხვა უკვე ხმა მიცემულების სიაში
      setVotedQuestionIds((prev) => new Set(prev).add(q.id));

      // 6. განვაახლოთ შედეგები და გადართოს შედეგების რეჟიმზე
      await fetchSingleResults(q);
      setViewResultsSet((prev) => ({ ...prev, [q.id]: true }));

    } catch (err: any) {
      console.error("Error submitting vote:", err);
      toast.error(err?.response?.data?.message || "ხმის მიცემა ვერ მოხერხდა");
    } finally {
      setSubmittingId(null);
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
    console.log(questionResults)
  }, [questionResults])
  return (
    <>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Hero Banner */}
      <S.HeroSection>
        <S.HeroTitle>🗳️ სახალხო რეფერენდუმი</S.HeroTitle>
        <S.HeroSubtitle>
          დააფიქსირეთ თქვენი პოზიცია მნიშვნელოვან საკითხებზე და იხილეთ საზოგადოებრივი აზრის რეალური შედეგები.
        </S.HeroSubtitle>
      </S.HeroSection>

      <S.Container>
        <S.SectionHeader>
          <S.SectionTitle>
            <span>📋</span> აქტიური კითხვები
          </S.SectionTitle>
        </S.SectionHeader>

        {/* Category Filter Bar */}
        {categories.length > 0 && (
          <S.FilterBar>
            <S.FilterChip active={activeCategoryId === null} onClick={() => setActiveCategoryId(null)}>
              🗳️ ყველა
            </S.FilterChip>
            {categories.map((cat) => (
              <S.FilterChip
                key={cat.id}
                active={activeCategoryId === cat.id}
                onClick={() => setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)}
              >
                🏷️ {cat.name}
              </S.FilterChip>
            ))}
          </S.FilterBar>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <p style={{ fontSize: "18px", color: "#64748b" }}>იტვირთება...</p>
          </div>
        ) : questions.length === 0 ? (
          <S.EmptyState>
            <span style={{ fontSize: "48px" }}>🗳️</span>
            <h3 style={{ fontSize: "18px", color: "#334155", marginTop: "16px" }}>
              ამ ეტაპზე აქტიური კითხვები არ არის
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              გთხოვთ მოგვიანებით შეამოწმოთ.
            </p>
          </S.EmptyState>
        ) : (() => {
          const filteredQuestions = activeCategoryId === null
            ? questions
            : questions.filter((q) => (q as any).categoryId === activeCategoryId || q.category?.id === activeCategoryId);

          if (filteredQuestions.length === 0) {
            return (
              <S.EmptyState>
                <span style={{ fontSize: "48px" }}>🔍</span>
                <h3 style={{ fontSize: "18px", color: "#334155", marginTop: "16px" }}>
                  ამ კატეგორიაში კითხვები არ არის
                </h3>
              </S.EmptyState>
            );
          }

          return (
          <S.QuestionsGrid>
            {filteredQuestions.map((q) => {
              const hasVoted = votedQuestionIds.has(q.id);
              // თუ უკვე აქვს მიცემული, ან მომხმარებელმა დააჭირა "შედეგების ნახვას"
              const isShowingResults = hasVoted || !!viewResultsSet[q.id];

              const results = questionResults[q.id];
              const isMultiple = q.type === "multiple";
              const chosenIds = selectedAnswers[q.id] || [];

              const maxPct = results
                ? Math.max(...Object.values(results.answerPercentages), 0)
                : 0;

              return (
                <S.QuestionCard key={q.id}>
                  <S.CardTop>
                    <div>
                      <S.QuestionText>{q.text}</S.QuestionText>
                      <S.Badge variant={isMultiple ? "multiple" : "single"}>
                        {isMultiple ? "☑️ მრავალარჩევიანი" : "🔘 ერთარჩევიანი"}
                      </S.Badge>
                      {/* ⭐ ახალი ბეიჯი, თუ უკვე აქვს მიცემული */}
                      {hasVoted && (
                        <S.Badge variant="single" style={{ marginTop: "8px", display: "inline-block" }}>
                          ✅ თქვენ უკვე მიეცით ხმა
                        </S.Badge>
                      )}
                    </div>
                  </S.CardTop>

                  {!isShowingResults ? (
                    /* VOTING MODE (ჩანს მხოლოდ თუ არ აქვს მიცემული ხმა) */
                    <>
                      <S.OptionsList>
                        {q.answers?.map((ans) => {
                          const selected = chosenIds.includes(ans.id);
                          return (
                            <S.OptionItem
                              key={ans.id}
                              selected={selected}
                              onClick={() => handleSelectOption(q.id, ans.id, isMultiple)}
                            >
                              <S.CheckIndicator
                                selected={selected}
                                type={isMultiple ? "multiple" : "single"}
                              />
                              <S.OptionText>{ans.text}</S.OptionText>
                            </S.OptionItem>
                          );
                        })}
                      </S.OptionsList>

                      <S.CardFooter>
                        <S.ActionButton
                          variant="primary"
                          onClick={() => handleVote(q)}
                          disabled={submittingId === q.id}
                        >
                          {submittingId === q.id ? "იგზავნება..." : "🗳️ ხმის მიცემა"}
                        </S.ActionButton>

                        <S.ActionButton
                          variant="secondary"
                          onClick={() => toggleResultsView(q)}
                        >
                          📊 შედეგების ნახვა
                        </S.ActionButton>
                      </S.CardFooter>
                    </>
                  ) : (
                    /* RESULTS MODE */
                    <>
                      <S.ResultsContainer>
                        <S.ResultsHeader>
                          <S.TotalVotesText>
                            <span>👥</span> სულ მიღებულია {results?.totalUsers || 0} ხმა
                          </S.TotalVotesText>
                        </S.ResultsHeader>

                        {q.answers?.map((ans) => {
                          const count = results?.answerCounts[ans.id] || 0;
                          const pct = results?.answerPercentages[ans.id] || 0;
                          const isTop = pct > 0 && pct === maxPct;

                          return (
                            <S.ResultRow key={ans.id}>
                              <S.ResultInfo>
                                <S.ResultOptionText>{ans.text}</S.ResultOptionText>
                                <S.ResultPercentageText>
                                  {pct}% ({count} ხმა)
                                </S.ResultPercentageText>
                              </S.ResultInfo>
                              <S.ProgressBarTrack>
                                <S.ProgressBarFill percentage={pct} isTop={isTop} />
                              </S.ProgressBarTrack>
                            </S.ResultRow>
                          );
                        })}
                      </S.ResultsContainer>

                      <S.CardFooter>
                        {/* ⭐ თუ უკვე აქვს მიცემული, ღილაკი არის დისაბლეიდებული, რადგან ბექენდი კრძალავს ხელახლა მიცემას */}
                        {hasVoted ? (
                          <S.ActionButton variant="outline" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                            🔒 ხმის შეცვლა შეუძლებელია
                          </S.ActionButton>
                        ) : (
                          <S.ActionButton
                            variant="outline"
                            onClick={() => toggleResultsView(q)}
                          >
                            ↩️ ხმის მიცემის ფორმაზე დაბრუნება
                          </S.ActionButton>
                        )}
                      </S.CardFooter>
                    </>
                  )}
                </S.QuestionCard>
              );
            })}
          </S.QuestionsGrid>
          );
        })()}
      </S.Container>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </>
  );
};

export default HomeComponent;
