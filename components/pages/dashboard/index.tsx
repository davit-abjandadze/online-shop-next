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
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import Header from "@/components/shared/Header";
import { AnswerAPI, CategoriesAPI, QuestionAPI, StatsAPI } from "@/API_Client";
import { Category, PaginationMetaDto, Question } from "@/API_Client/client/models";
import { getPaginationRange } from "@/utils/getPaginationRange";
import * as S from "./style";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

type DashboardTab = "questions" | "categories" | "stats";
type TrendsPeriod = "week" | "month" | "year";
const QUESTIONS_PAGE_SIZE = 10;

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

export const DashboardComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<DashboardTab>("questions");

  // ─── Questions State ─────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState<boolean>(true);
  const [questionsPage, setQuestionsPage] = useState<number>(1);
  const [questionsMeta, setQuestionsMeta] = useState<PaginationMetaDto | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newQuestionText, setNewQuestionText] = useState<string>("");
  const [newQuestionType, setNewQuestionType] = useState<"single" | "multiple">("single");
  const [newQuestionCategoryId, setNewQuestionCategoryId] = useState<number | "">("");
  const [newAnswers, setNewAnswers] = useState<string[]>(["", ""]);
  const [newEndDate, setNewEndDate] = useState<string>("");
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [editType, setEditType] = useState<"single" | "multiple">("single");
  const [editCategoryId, setEditCategoryId] = useState<number | "">("");
  const [editAnswers, setEditAnswers] = useState<{ id?: number; text: string }[]>([]);
  const [deletedAnswerIds, setDeletedAnswerIds] = useState<number[]>([]);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  // ─── Categories State ─────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingC, setLoadingC] = useState<boolean>(true);

  const [isCatCreateOpen, setIsCatCreateOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatDesc, setNewCatDesc] = useState<string>("");
  const [catCreateSubmitting, setCatCreateSubmitting] = useState<boolean>(false);

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState<string>("");
  const [editCatDesc, setEditCatDesc] = useState<string>("");
  const [catEditSubmitting, setCatEditSubmitting] = useState<boolean>(false);

  // ─── Analytics State ──────────────────────────────────────────────────────────
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [popularQuestions, setPopularQuestions] = useState<PopularQuestion[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [trendsPeriod, setTrendsPeriod] = useState<TrendsPeriod>("month");
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsLoaded, setStatsLoaded] = useState<boolean>(false);

  // ─── Fetch helpers ────────────────────────────────────────────────────────────
  const fetchQuestions = async () => {
    if (!session?.accessToken) return;
    setLoadingQ(true);
    try {
      const res = await QuestionAPI(router.locale || "ka", session.accessToken).questionControllerFindAll(questionsPage, QUESTIONS_PAGE_SIZE);
      setQuestions(Array.isArray(res.data?.data) ? res.data.data : []);
      setQuestionsMeta(res.data?.meta || null);
    } catch {
      toast.error("კითხვების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingQ(false);
    }
  };

  const fetchCategories = async () => {
    if (!session?.accessToken) return;
    setLoadingC(true);
    try {
      const res = await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerFindAll();
      const data = res.data as any;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("კატეგორიების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingC(false);
    }
  };

  const fetchStats = async () => {
    if (!session?.accessToken) return;
    setLoadingStats(true);
    try {
      const api = StatsAPI(router.locale || "ka", session.accessToken);
      const [globalRes, categoriesRes, popularRes, trendsRes] = await Promise.all([
        api.statsControllerGetGlobalStats(),
        api.statsControllerGetCategoriesStats(),
        api.statsControllerGetPopularQuestions(5),
        api.statsControllerGetTrends(trendsPeriod),
      ]);

      const g = globalRes.data as any;
      setGlobalStats({
        totalQuestions: pickField(g, ["totalQuestions", "questionsCount", "questions"]),
        totalVotes: pickField(g, ["totalVotes", "votesCount", "totalAnswers", "votes"]),
        totalCategories: pickField(g, ["totalCategories", "categoriesCount", "categories"]),
        activeQuestions: pickField(g, ["activeQuestions", "activeQuestionsCount", "active"]),
      });

      const cData = categoriesRes.data as any;
      const cList = Array.isArray(cData) ? cData : Array.isArray(cData?.data) ? cData.data : [];
      setCategoryStats(
        cList.map((item: any) => ({
          label: pickField(item, ["categoryName", "name", "label"], "—"),
          votes: pickField(item, ["votesCount", "totalVotes", "votes", "count"]),
          questionsCount: pickField(item, ["questionsCount", "questions"]),
        }))
      );

      const pData = popularRes.data as any;
      const pList = Array.isArray(pData) ? pData : Array.isArray(pData?.data) ? pData.data : [];
      setPopularQuestions(
        pList.map((item: any) => ({
          id: pickField(item, ["id", "questionId"], Math.random()),
          text: pickField(item, ["text", "questionText", "title"], "—"),
          votes: pickField(item, ["votesCount", "totalVotes", "votes", "count"]),
        }))
      );

      const tData = trendsRes.data as any;
      const tList = Array.isArray(tData) ? tData : Array.isArray(tData?.data) ? tData.data : [];
      setTrends(
        tList.map((item: any) => ({
          label: pickField(item, ["label", "period", "date", "day"], "—"),
          votes: pickField(item, ["votesCount", "totalVotes", "votes", "count"]),
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
    if (status === "authenticated" && session?.user?.role?.toLowerCase() === "admin") {
      fetchQuestions();
      fetchCategories();
    }
  }, [status, session, questionsPage]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role?.toLowerCase() === "admin" && activeTab === "stats") {
      fetchStats();
    }
  }, [status, session, activeTab, trendsPeriod]);

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "#64748b" }}>იტვირთება...</p>
          </S.Container>
        </S.PageWrapper>
      </>
    );
  }

  if (status === "unauthenticated" || session?.user?.role?.toLowerCase() !== "admin") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.AccessDeniedCard>
            <span style={{ fontSize: "48px" }}>🚫</span>
            <S.AccessDeniedTitle>წვდომა უარყოფილია</S.AccessDeniedTitle>
            <S.AccessDeniedText>ამ გვერდზე გადასასვლელად გესაჭიროებათ ადმინისტრატორის უფლებები.</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              მთავარ გვერდზე დაბრუნება
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageWrapper>
      </>
    );
  }

  // ─── Question Handlers ────────────────────────────────────────────────────────
  const handleAddAnswerInput = () => setNewAnswers([...newAnswers, ""]);
  const handleRemoveAnswerInput = (index: number) => {
    if (newAnswers.length <= 2) { toast.warning("კითხვას უნდა ჰქონდეს მინიმუმ 2 სავარაუდო პასუხი"); return; }
    setNewAnswers(newAnswers.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) { toast.warning("გთხოვთ შეავსოთ კითხვის ტექსტი"); return; }
    const validAnswers = newAnswers.map((a) => a.trim()).filter((a) => a.length > 0);
    if (validAnswers.length < 2) { toast.warning("გთხოვთ მიუთითოთ მინიმუმ 2 სავარაუდო პასუხი"); return; }

    setCreateSubmitting(true);
    try {
      await QuestionAPI(router.locale || "ka", session.accessToken!).questionControllerCreate({
        text: newQuestionText.trim(),
        type: newQuestionType as any,
        categoryId: newQuestionCategoryId !== "" ? Number(newQuestionCategoryId) : undefined,
        answers: validAnswers.map((text) => ({ text })),
        endDate: newEndDate ? new Date(newEndDate).toISOString() : undefined,
      });
      toast.success("კითხვა წარმატებით დაემატა!");
      setIsCreateModalOpen(false);
      setNewQuestionText(""); setNewQuestionType("single"); setNewAnswers(["", ""]); setNewQuestionCategoryId(""); setNewEndDate("");
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setEditText(q.text);
    setEditType((q.type as any) || "single");
    setEditCategoryId(q.categoryId ?? "");
    setEditAnswers((q.answers || []).map((a) => ({ id: a.id, text: a.text })));
    setDeletedAnswerIds([]);
  };

  const handleAddEditAnswerRow = () => setEditAnswers([...editAnswers, { text: "" }]);
  const handleRemoveEditAnswerRow = (index: number) => {
    if (editAnswers.length <= 2) { toast.warning("კითხვას უნდა ჰქონდეს მინიმუმ 2 სავარაუდო პასუხი"); return; }
    const target = editAnswers[index];
    if (target.id) setDeletedAnswerIds([...deletedAnswerIds, target.id]);
    setEditAnswers(editAnswers.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !session?.accessToken) return;
    if (!editText.trim()) { toast.warning("გთხოვთ შეავსოთ კითხვის ტექსტი"); return; }
    const validAnswers = editAnswers.filter((a) => a.text.trim().length > 0);
    if (validAnswers.length < 2) { toast.warning("გთხოვთ მიუთითოთ მინიმუმ 2 სავარაუდო პასუხი"); return; }

    setEditSubmitting(true);
    try {
      const qApi = QuestionAPI(router.locale || "ka", session.accessToken);
      const aApi = AnswerAPI(router.locale || "ka", session.accessToken);

      await qApi.questionControllerUpdate(
        { text: editText.trim(), type: editType as any, categoryId: editCategoryId !== "" ? Number(editCategoryId) : undefined } as any,
        String(editingQuestion.id)
      );

      for (const delId of deletedAnswerIds) {
        await aApi.answerControllerRemove(String(delId));
      }

      const originalAnswersMap = new Map((editingQuestion.answers || []).map((a) => [a.id, a.text]));
      for (const ans of validAnswers) {
        if (ans.id) {
          if (originalAnswersMap.get(ans.id) !== ans.text.trim()) {
            await aApi.answerControllerUpdate({ text: ans.text.trim() }, String(ans.id));
          }
        } else {
          await aApi.answerControllerAddAnswer({ text: ans.text.trim() }, String(editingQuestion.id));
        }
      }

      toast.success("კითხვა წარმატებით განახლდა!");
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleActive = async (q: Question) => {
    try {
      const qApi = QuestionAPI(router.locale || "ka", session?.accessToken || "");
      if (q.isActive) {
        await qApi.questionControllerDeactivate(String(q.id));
        toast.success("კითხვა დეაქტივირებულია!");
      } else {
        await qApi.questionControllerActivate(String(q.id));
        toast.success("კითხვა გააქტიურებულია!");
      }
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "სტატუსის შეცვლა ვერ მოხერხდა");
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (!window.confirm("ნამდვილად გსურთ კითხვის წაშლა?")) return;
    try {
      await QuestionAPI(router.locale || "ka", session?.accessToken || "").questionControllerRemove(String(qId));
      toast.success("კითხვა წარმატებით წაიშალა!");
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის წაშლა ვერ მოხერხდა");
    }
  };

  // ─── Category Handlers ────────────────────────────────────────────────────────
  const handleCatCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) { toast.warning("გთხოვთ შეავსოთ კატეგორიის სახელი"); return; }
    setCatCreateSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session!.accessToken!).categoryControllerCreate({
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
      });
      toast.success("კატეგორია წარმატებით დაემატა!");
      setIsCatCreateOpen(false); setNewCatName(""); setNewCatDesc("");
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის დამატება ვერ მოხერხდა");
    } finally {
      setCatCreateSubmitting(false);
    }
  };

  const handleOpenEditCat = (cat: Category) => {
    setEditingCat(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || "");
  };

  const handleCatEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !session?.accessToken) return;
    if (!editCatName.trim()) { toast.warning("გთხოვთ შეავსოთ კატეგორიის სახელი"); return; }
    setCatEditSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerUpdate(
        { name: editCatName.trim(), description: editCatDesc.trim() || undefined },
        String(editingCat.id)
      );
      toast.success("კატეგორია წარმატებით განახლდა!");
      setEditingCat(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის განახლება ვერ მოხერხდა");
    } finally {
      setCatEditSubmitting(false);
    }
  };

  const handleDeleteCat = async (catId: number) => {
    if (!window.confirm("ნამდვილად გსურთ კატეგორიის წაშლა?")) return;
    try {
      await CategoriesAPI(router.locale || "ka", session?.accessToken || "").categoryControllerRemove(String(catId));
      toast.success("კატეგორია წარმატებით წაიშალა!");
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის წაშლა ვერ მოხერხდა");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <S.PageWrapper>
        <S.Container>
          {/* Page Header */}
          <S.HeaderSection>
            <S.TitleGroup>
              <S.PageTitle>⚙️ ადმინ დეშბორდი</S.PageTitle>
              <S.PageSubtitle>მართეთ რეფერენდუმის კითხვები, კატეგორიები და სავარაუდო პასუხები</S.PageSubtitle>
            </S.TitleGroup>
            {activeTab === "questions" && (
              <S.ActionButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                ➕ ახალი კითხვა
              </S.ActionButton>
            )}
            {activeTab === "categories" && (
              <S.ActionButton variant="primary" onClick={() => setIsCatCreateOpen(true)}>
                ➕ ახალი კატეგორია
              </S.ActionButton>
            )}
          </S.HeaderSection>

          {/* Tab Navigation */}
          <S.TabBar>
            <S.Tab active={activeTab === "questions"} onClick={() => setActiveTab("questions")}>
              ❓ კითხვები ({questions.length})
            </S.Tab>
            <S.Tab active={activeTab === "categories"} onClick={() => setActiveTab("categories")}>
              🏷️ კატეგორიები ({categories.length})
            </S.Tab>
            <S.Tab active={activeTab === "stats"} onClick={() => setActiveTab("stats")}>
              📊 ანალიტიკა
            </S.Tab>
          </S.TabBar>

          {/* ═══ QUESTIONS TAB ═══════════════════════════════════════════════════ */}
          {activeTab === "questions" && (
            <>
              <S.StatsGrid>
                <S.StatCard>
                  <S.StatIcon>❓</S.StatIcon>
                  <S.StatInfo>
                    <S.StatValue>{questions.length}</S.StatValue>
                    <S.StatLabel>სულ კითხვები</S.StatLabel>
                  </S.StatInfo>
                </S.StatCard>
                <S.StatCard>
                  <S.StatIcon>🎯</S.StatIcon>
                  <S.StatInfo>
                    <S.StatValue>{questions.reduce((acc, q) => acc + (q.answers?.length || 0), 0)}</S.StatValue>
                    <S.StatLabel>სულ სავარაუდო პასუხები</S.StatLabel>
                  </S.StatInfo>
                </S.StatCard>
                <S.StatCard>
                  <S.StatIcon>🏷️</S.StatIcon>
                  <S.StatInfo>
                    <S.StatValue>{categories.length}</S.StatValue>
                    <S.StatLabel>კატეგორიები</S.StatLabel>
                  </S.StatInfo>
                </S.StatCard>
              </S.StatsGrid>

              {loadingQ ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#64748b" }}>კითხვები იტვირთება...</p>
                </div>
              ) : questions.length === 0 ? (
                <S.EmptyState>
                  <span style={{ fontSize: "48px" }}>📋</span>
                  <S.EmptyTitle>კითხვები არ არის დამატებული</S.EmptyTitle>
                  <S.EmptyText>დააჭირეთ "ახალი კითხვა" ღილაკს პირველი კითხვის შესაქმნელად.</S.EmptyText>
                  <S.ActionButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    ➕ კითხვის დამატება
                  </S.ActionButton>
                </S.EmptyState>
              ) : (
                <S.QuestionsList>
                  {questions.map((q) => (
                    <S.QuestionCard key={q.id}>
                      <S.CardHeader>
                        <div>
                          <S.QuestionText>{q.text}</S.QuestionText>
                          <S.BadgeGroup>
                            <S.Badge variant={q.type === "multiple" ? "multiple" : "single"}>
                              {q.type === "multiple" ? "☑️ მრავალარჩევიანი" : "🔘 ერთარჩევიანი"}
                            </S.Badge>
                            <S.Badge variant={q.isActive ? "active" : "inactive"}>
                              {q.isActive ? "🟢 აქტიური" : "⚪ არააქტიური"}
                            </S.Badge>
                            {q.category && (
                              <S.Badge variant="date">🏷️ {q.category.name}</S.Badge>
                            )}
                            {q.createdAt && (
                              <S.Badge variant="date">📅 {new Date(q.createdAt).toLocaleDateString("ka-GE")}</S.Badge>
                            )}
                            {q.endDate && (
                              <S.Badge variant="date">⏳ {new Date(q.endDate).toLocaleDateString("ka-GE")}</S.Badge>
                            )}
                          </S.BadgeGroup>
                        </div>
                        <S.CardActions>
                          <S.ActionButton
                            variant={q.isActive ? "secondary" : "success"}
                            onClick={() => handleToggleActive(q)}
                          >
                            {q.isActive ? "⏸️ დეაქტივაცია" : "▶️ აქტივაცია"}
                          </S.ActionButton>
                          <S.ActionButton variant="outline" onClick={() => handleOpenEdit(q)}>
                            ✏️ რედაქტირება
                          </S.ActionButton>
                          <S.ActionButton variant="danger" onClick={() => handleDeleteQuestion(q.id)}>
                            🗑️ წაშლა
                          </S.ActionButton>
                        </S.CardActions>
                      </S.CardHeader>

                      <S.AnswersSection>
                        <S.AnswersTitle>სავარაუდო პასუხები ({q.answers?.length || 0}):</S.AnswersTitle>
                        <S.AnswersGrid>
                          {q.answers && q.answers.length > 0 ? (
                            q.answers.map((ans, idx) => (
                              <S.AnswerPill key={ans.id || idx}>
                                <span style={{ fontWeight: 600, color: "#2563eb" }}>{idx + 1}.</span> {ans.text}
                              </S.AnswerPill>
                            ))
                          ) : (
                            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>პასუხები არ არის მითითებული</p>
                          )}
                        </S.AnswersGrid>
                      </S.AnswersSection>
                    </S.QuestionCard>
                  ))}
                </S.QuestionsList>
              )}

              {questionsMeta && questionsMeta.totalPages > 1 && (
                <S.PaginationBar>
                  <S.PageButton
                    onClick={() => setQuestionsPage((p) => Math.max(1, p - 1))}
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
                          onClick={() => setQuestionsPage(item)}
                        >
                          {item}
                        </S.PageNumberButton>
                      )
                    )}
                  </S.PageNumbers>

                  <S.PageButton
                    onClick={() => setQuestionsPage((p) => p + 1)}
                    disabled={!questionsMeta.hasNext}
                  >
                    შემდეგი →
                  </S.PageButton>
                </S.PaginationBar>
              )}
            </>
          )}

          {/* ═══ CATEGORIES TAB ══════════════════════════════════════════════════ */}
          {activeTab === "categories" && (
            <>
              {loadingC ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#64748b" }}>კატეგორიები იტვირთება...</p>
                </div>
              ) : categories.length === 0 ? (
                <S.EmptyState>
                  <span style={{ fontSize: "48px" }}>🏷️</span>
                  <S.EmptyTitle>კატეგორიები არ არის</S.EmptyTitle>
                  <S.EmptyText>დაამატეთ პირველი კატეგორია კითხვების გასაჯგუფებლად.</S.EmptyText>
                  <S.ActionButton variant="primary" onClick={() => setIsCatCreateOpen(true)}>
                    ➕ კატეგორიის დამატება
                  </S.ActionButton>
                </S.EmptyState>
              ) : (
                <S.QuestionsList>
                  {categories.map((cat) => (
                    <S.QuestionCard key={cat.id}>
                      <S.CardHeader>
                        <div>
                          <S.QuestionText>🏷️ {cat.name}</S.QuestionText>
                          {cat.description && (
                            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" }}>{cat.description}</p>
                          )}
                          <S.Badge variant="date" style={{ marginTop: "8px", display: "inline-block" }}>
                            {cat.questions?.length || 0} კითხვა
                          </S.Badge>
                        </div>
                        <S.CardActions>
                          <S.ActionButton variant="outline" onClick={() => handleOpenEditCat(cat)}>
                            ✏️ რედაქტირება
                          </S.ActionButton>
                          <S.ActionButton variant="danger" onClick={() => handleDeleteCat(cat.id)}>
                            🗑️ წაშლა
                          </S.ActionButton>
                        </S.CardActions>
                      </S.CardHeader>
                    </S.QuestionCard>
                  ))}
                </S.QuestionsList>
              )}
            </>
          )}

          {/* ═══ STATS / ANALYTICS TAB ═══════════════════════════════════════════ */}
          {activeTab === "stats" && (
            <>
              {loadingStats && !statsLoaded ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#64748b" }}>ანალიტიკა იტვირთება...</p>
                </div>
              ) : (
                <>
                  <S.StatsGrid>
                    <S.StatCard>
                      <S.StatIcon>❓</S.StatIcon>
                      <S.StatInfo>
                        <S.StatValue>{globalStats?.totalQuestions ?? 0}</S.StatValue>
                        <S.StatLabel>სულ კითხვები</S.StatLabel>
                      </S.StatInfo>
                    </S.StatCard>
                    <S.StatCard>
                      <S.StatIcon>🗳️</S.StatIcon>
                      <S.StatInfo>
                        <S.StatValue>{globalStats?.totalVotes ?? 0}</S.StatValue>
                        <S.StatLabel>სულ ხმები</S.StatLabel>
                      </S.StatInfo>
                    </S.StatCard>
                    <S.StatCard>
                      <S.StatIcon>🟢</S.StatIcon>
                      <S.StatInfo>
                        <S.StatValue>{globalStats?.activeQuestions ?? 0}</S.StatValue>
                        <S.StatLabel>აქტიური კითხვები</S.StatLabel>
                      </S.StatInfo>
                    </S.StatCard>
                    <S.StatCard>
                      <S.StatIcon>🏷️</S.StatIcon>
                      <S.StatInfo>
                        <S.StatValue>{globalStats?.totalCategories ?? 0}</S.StatValue>
                        <S.StatLabel>კატეგორიები</S.StatLabel>
                      </S.StatInfo>
                    </S.StatCard>
                  </S.StatsGrid>

                  <S.ChartsGrid>
                    <S.ChartCard>
                      <S.ChartCardTitle>
                        <S.ChartTitleText>🏷️ ხმები კატეგორიების მიხედვით</S.ChartTitleText>
                      </S.ChartCardTitle>
                      {categoryStats.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#94a3b8" }}>მონაცემები არ არის</p>
                      ) : (
                        <S.ChartCanvasWrapper>
                          <Bar
                            data={{
                              labels: categoryStats.map((c) => c.label),
                              datasets: [
                                {
                                  label: "ხმები",
                                  data: categoryStats.map((c) => c.votes),
                                  backgroundColor: "#2563eb",
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
                        <S.ChartTitleText>📈 ხმების ტრენდი</S.ChartTitleText>
                        <S.PeriodSelector>
                          <S.PeriodButton active={trendsPeriod === "week"} onClick={() => setTrendsPeriod("week")}>კვირა</S.PeriodButton>
                          <S.PeriodButton active={trendsPeriod === "month"} onClick={() => setTrendsPeriod("month")}>თვე</S.PeriodButton>
                          <S.PeriodButton active={trendsPeriod === "year"} onClick={() => setTrendsPeriod("year")}>წელი</S.PeriodButton>
                        </S.PeriodSelector>
                      </S.ChartCardTitle>
                      {trends.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#94a3b8" }}>მონაცემები არ არის</p>
                      ) : (
                        <S.ChartCanvasWrapper>
                          <Line
                            data={{
                              labels: trends.map((t) => t.label),
                              datasets: [
                                {
                                  label: "ხმები",
                                  data: trends.map((t) => t.votes),
                                  borderColor: "#2563eb",
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
                      <S.ChartTitleText>🔥 პოპულარული კითხვები</S.ChartTitleText>
                    </S.ChartCardTitle>
                    {popularQuestions.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#94a3b8" }}>მონაცემები არ არის</p>
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
            </>
          )}
        </S.Container>
      </S.PageWrapper>

      {/* ═══ CREATE QUESTION MODAL ════════════════════════════════════════════════ */}
      {isCreateModalOpen && (
        <S.ModalOverlay onClick={() => setIsCreateModalOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>➕ ახალი კითხვის დამატება</S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateModalOpen(false)}>✕</S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit}>
              <S.FormGroup>
                <S.Label>კითხვის ტექსტი</S.Label>
                <S.Input
                  type="text"
                  placeholder="მაგ: რომელ ქალაქს ანიჭებთ უპირატესობას?"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  required
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კატეგორია (არასავალდებულო)</S.Label>
                <S.Select
                  value={newQuestionCategoryId}
                  onChange={(e) => setNewQuestionCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">— კატეგორიის გარეშე —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კითხვის ტიპი</S.Label>
                <S.Select value={newQuestionType} onChange={(e) => setNewQuestionType(e.target.value as "single" | "multiple")}>
                  <option value="single">ერთარჩევიანი (Single Choice)</option>
                  <option value="multiple">მრავალარჩევიანი (Multiple Choice)</option>
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>დამთავრების თარიღი (არასავალდებულო)</S.Label>
                <S.Input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სავარაუდო პასუხები (მინიმუმ 2)</S.Label>
                {newAnswers.map((ansText, index) => (
                  <S.AnswerInputRow key={index}>
                    <S.Input
                      type="text"
                      placeholder={`პასუხის ვარიანტი ${index + 1}`}
                      value={ansText}
                      onChange={(e) => { const u = [...newAnswers]; u[index] = e.target.value; setNewAnswers(u); }}
                      required
                    />
                    {newAnswers.length > 2 && (
                      <S.ActionButton type="button" variant="secondary" style={{ color: "#ef4444", padding: "10px 14px" }} onClick={() => handleRemoveAnswerInput(index)}>🗑️</S.ActionButton>
                    )}
                  </S.AnswerInputRow>
                ))}
                <S.ActionButton type="button" variant="outline" style={{ marginTop: "8px", justifyContent: "center" }} onClick={handleAddAnswerInput}>
                  ➕ პასუხის ვარიანტის დამატება
                </S.ActionButton>
              </S.FormGroup>

              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={createSubmitting}>{createSubmitting ? "ემატება..." : "შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT QUESTION MODAL ═════════════════════════════════════════════════ */}
      {editingQuestion && (
        <S.ModalOverlay onClick={() => setEditingQuestion(null)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>✏️ კითხვის რედაქტირება</S.ModalTitle>
              <S.CloseButton onClick={() => setEditingQuestion(null)}>✕</S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit}>
              <S.FormGroup>
                <S.Label>კითხვის ტექსტი</S.Label>
                <S.Input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} required />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კატეგორია (არასავალდებულო)</S.Label>
                <S.Select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value === "" ? "" : Number(e.target.value))}>
                  <option value="">— კატეგორიის გარეშე —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კითხვის ტიპი</S.Label>
                <S.Select value={editType} onChange={(e) => setEditType(e.target.value as "single" | "multiple")}>
                  <option value="single">ერთარჩევიანი (Single Choice)</option>
                  <option value="multiple">მრავალარჩევიანი (Multiple Choice)</option>
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სავარაუდო პასუხები (მინიმუმ 2)</S.Label>
                {editAnswers.map((ans, index) => (
                  <S.AnswerInputRow key={index}>
                    <S.Input
                      type="text"
                      placeholder={`პასუხის ვარიანტი ${index + 1}`}
                      value={ans.text}
                      onChange={(e) => { const u = [...editAnswers]; u[index] = { ...u[index], text: e.target.value }; setEditAnswers(u); }}
                      required
                    />
                    {editAnswers.length > 2 && (
                      <S.ActionButton type="button" variant="secondary" style={{ color: "#ef4444", padding: "10px 14px" }} onClick={() => handleRemoveEditAnswerRow(index)}>🗑️</S.ActionButton>
                    )}
                  </S.AnswerInputRow>
                ))}
                <S.ActionButton type="button" variant="outline" style={{ marginTop: "8px", justifyContent: "center" }} onClick={handleAddEditAnswerRow}>
                  ➕ პასუხის ვარიანტის დამატება
                </S.ActionButton>
              </S.FormGroup>

              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingQuestion(null)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={editSubmitting}>{editSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ CREATE CATEGORY MODAL ═══════════════════════════════════════════════ */}
      {isCatCreateOpen && (
        <S.ModalOverlay onClick={() => setIsCatCreateOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>🏷️ ახალი კატეგორიის დამატება</S.ModalTitle>
              <S.CloseButton onClick={() => setIsCatCreateOpen(false)}>✕</S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCatCreateSubmit}>
              <S.FormGroup>
                <S.Label>კატეგორიის სახელი</S.Label>
                <S.Input type="text" placeholder="მაგ: პოლიტიკა" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>მოკლე აღწერა (არასავალდებულო)</S.Label>
                <S.Input type="text" placeholder="მაგ: პოლიტიკური თემატიკის კითხვები" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
              </S.FormGroup>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setIsCatCreateOpen(false)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={catCreateSubmitting}>{catCreateSubmitting ? "ემატება..." : "შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT CATEGORY MODAL ═════════════════════════════════════════════════ */}
      {editingCat && (
        <S.ModalOverlay onClick={() => setEditingCat(null)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>✏️ კატეგორიის რედაქტირება</S.ModalTitle>
              <S.CloseButton onClick={() => setEditingCat(null)}>✕</S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCatEditSubmit}>
              <S.FormGroup>
                <S.Label>კატეგორიის სახელი</S.Label>
                <S.Input type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} required />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>მოკლე აღწერა (არასავალდებულო)</S.Label>
                <S.Input type="text" value={editCatDesc} onChange={(e) => setEditCatDesc(e.target.value)} />
              </S.FormGroup>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingCat(null)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={catEditSubmitting}>{catEditSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </>
  );
};

export default DashboardComponent;
