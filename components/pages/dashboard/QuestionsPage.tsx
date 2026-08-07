import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { AnswerAPI, CategoriesAPI, QuestionAPI } from "@/API_Client";
import { Category, PaginationMetaDto, Question } from "@/API_Client/client/models";
import { getPaginationRange } from "@/utils/getPaginationRange";
import {
  CalendarIcon,
  CheckSquareIcon,
  ClipboardIcon,
  CloseIcon,
  EditIcon,
  HourglassIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  QuestionMarkIcon,
  RadioIcon,
  TagIcon,
  TargetIcon,
  TrashIcon,
} from "@/components/ui/RefIcons";
import DashboardLayout from "./DashboardLayout";
import * as S from "./style";

const QUESTIONS_PAGE_SIZE = 10;
const QUESTIONS_FETCH_PAGE_SIZE = 100; // backend-ის მაქსიმალური დასაშვები limit

export const QuestionsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState<boolean>(true);
  const [questionsPage, setQuestionsPage] = useState<number>(1);
  const [questionsMeta, setQuestionsMeta] = useState<PaginationMetaDto | null>(null);

  // მთლიანი (ყველა გვერდის ჯამური) სტატისტიკისთვის - გვერდობრივი
  // ჩვენების `questions`-ისგან დამოუკიდებლად ვინახავთ
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);
  const [totalAnswersCount, setTotalAnswersCount] = useState<number>(0);

  const [categories, setCategories] = useState<Category[]>([]);

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

  // სტატისტიკის ბლოკებისთვის ვითვლით ყველა კითხვასა და პასუხს ყველა
  // გვერდზე გავლით, რადგან `questions` მხოლოდ მიმდინარე გვერდის მონაცემებს შეიცავს
  const fetchQuestionsStats = async () => {
    if (!session?.accessToken) return;
    try {
      const api = QuestionAPI(router.locale || "ka", session.accessToken);
      let page = 1;
      let totalPages = 1;
      let total = 0;
      let answersSum = 0;
      do {
        const res = await api.questionControllerFindAll(page, QUESTIONS_FETCH_PAGE_SIZE);
        const data = res.data as any;
        const pageList: Question[] = Array.isArray(data?.data) ? data.data : [];
        answersSum += pageList.reduce((acc, q) => acc + (q.answers?.length || 0), 0);
        totalPages = data?.meta?.totalPages || 1;
        total = data?.meta?.total ?? pageList.length;
        page += 1;
      } while (page <= totalPages);
      setTotalQuestionsCount(total);
      setTotalAnswersCount(answersSum);
    } catch {
      // მთავარი სიის ჩატვირთვის შეცდომას ცალკე ვამუშავებთ fetchQuestions-ში
    }
  };

  const fetchCategories = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerFindAll();
      const data = res.data as any;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("კატეგორიების ჩატვირთვა ვერ მოხერხდა");
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role?.toLowerCase() === "admin") {
      fetchQuestions();
      fetchQuestionsStats();
      fetchCategories();
      fetchQuestionsStats();
    }
  }, [status, session, questionsPage]);

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
      await QuestionAPI(router.locale || "ka", session!.accessToken!).questionControllerCreate({
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
      fetchQuestionsStats();
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
      fetchQuestionsStats();
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
      fetchQuestionsStats();
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
      fetchQuestionsStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის წაშლა ვერ მოხერხდა");
    }
  };

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ რეფერენდუმის კითხვები, კატეგორიები და სავარაუდო პასუხები"
      headerAction={
        <S.ActionButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon size={16} /> ახალი კითხვა
        </S.ActionButton>
      }
    >
      <S.StatsGrid>
        <S.StatCard>
          <S.StatIcon><QuestionMarkIcon size={24} /></S.StatIcon>
          <S.StatInfo>
            <S.StatValue>{totalQuestionsCount}</S.StatValue>
            <S.StatLabel>სულ კითხვები</S.StatLabel>
          </S.StatInfo>
        </S.StatCard>
        <S.StatCard>
          <S.StatIcon><TargetIcon size={24} /></S.StatIcon>
          <S.StatInfo>
            <S.StatValue>{totalAnswersCount}</S.StatValue>
            <S.StatLabel>სულ სავარაუდო პასუხები</S.StatLabel>
          </S.StatInfo>
        </S.StatCard>
        <S.StatCard>
          <S.StatIcon><TagIcon size={24} /></S.StatIcon>
          <S.StatInfo>
            <S.StatValue>{categories.length}</S.StatValue>
            <S.StatLabel>კატეგორიები</S.StatLabel>
          </S.StatInfo>
        </S.StatCard>
      </S.StatsGrid>

      {loadingQ ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--ref-text-secondary)" }}>კითხვები იტვირთება...</p>
        </div>
      ) : questions.length === 0 ? (
        <S.EmptyState>
          <ClipboardIcon size={48} />
          <S.EmptyTitle>კითხვები არ არის დამატებული</S.EmptyTitle>
          <S.EmptyText>დააჭირეთ &quot;ახალი კითხვა&quot; ღილაკს პირველი კითხვის შესაქმნელად.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon size={16} /> კითხვის დამატება
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
                      {q.type === "multiple" ? <CheckSquareIcon size={13} /> : <RadioIcon size={13} />}
                      {q.type === "multiple" ? "მრავალარჩევიანი" : "ერთარჩევიანი"}
                    </S.Badge>
                    <S.Badge variant={q.isActive ? "active" : "inactive"}>
                      {q.isActive ? "აქტიური" : "არააქტიური"}
                    </S.Badge>
                    {q.category && (
                      <S.Badge variant="date"><TagIcon size={13} /> {q.category.name}</S.Badge>
                    )}
                    {q.createdAt && (
                      <S.Badge variant="date"><CalendarIcon size={13} /> {new Date(q.createdAt).toLocaleDateString("ka-GE")}</S.Badge>
                    )}
                    {q.endDate && (
                      <S.Badge variant="date"><HourglassIcon size={13} /> {new Date(q.endDate).toLocaleDateString("ka-GE")}</S.Badge>
                    )}
                  </S.BadgeGroup>
                </div>
                <S.CardActions>
                  <S.ActionButton
                    variant={q.isActive ? "secondary" : "success"}
                    onClick={() => handleToggleActive(q)}
                  >
                    {q.isActive ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                    {q.isActive ? "დეაქტივაცია" : "აქტივაცია"}
                  </S.ActionButton>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(q)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => handleDeleteQuestion(q.id)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>

              <S.AnswersSection>
                <S.AnswersTitle>სავარაუდო პასუხები ({q.answers?.length || 0}):</S.AnswersTitle>
                <S.AnswersGrid>
                  {q.answers && q.answers.length > 0 ? (
                    q.answers.map((ans, idx) => (
                      <S.AnswerPill key={ans.id || idx}>
                        <span style={{ fontWeight: 600, color: "var(--ref-primary)" }}>{idx + 1}.</span> {ans.text}
                      </S.AnswerPill>
                    ))
                  ) : (
                    <p style={{ fontSize: "13px", color: "var(--ref-text-secondary)", margin: 0 }}>პასუხები არ არის მითითებული</p>
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

      {/* ═══ CREATE QUESTION MODAL ════════════════════════════════════════════════ */}
      {isCreateModalOpen && (
        <S.ModalOverlay onClick={() => setIsCreateModalOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PlusIcon size={18} /> ახალი კითხვის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateModalOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
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
                      <S.ActionButton type="button" variant="secondary" style={{ color: "var(--ref-danger)", padding: "10px 14px" }} onClick={() => handleRemoveAnswerInput(index)}><TrashIcon size={16} /></S.ActionButton>
                    )}
                  </S.AnswerInputRow>
                ))}
                <S.ActionButton type="button" variant="outline" style={{ marginTop: "8px", justifyContent: "center" }} onClick={handleAddAnswerInput}>
                  <PlusIcon size={14} /> პასუხის ვარიანტის დამატება
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
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> კითხვის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingQuestion(null)}><CloseIcon size={16} /></S.CloseButton>
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
                      <S.ActionButton type="button" variant="secondary" style={{ color: "var(--ref-danger)", padding: "10px 14px" }} onClick={() => handleRemoveEditAnswerRow(index)}><TrashIcon size={16} /></S.ActionButton>
                    )}
                  </S.AnswerInputRow>
                ))}
                <S.ActionButton type="button" variant="outline" style={{ marginTop: "8px", justifyContent: "center" }} onClick={handleAddEditAnswerRow}>
                  <PlusIcon size={14} /> პასუხის ვარიანტის დამატება
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
    </DashboardLayout>
  );
};

export default QuestionsPage;
