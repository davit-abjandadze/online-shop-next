import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnswerAPI, CategoriesAPI, QuestionAPI, UserAnswerAPI } from "@/API_Client";
import { Category, PaginationMetaDto, Question } from "@/API_Client/client/models";
import {
  QuestionControllerFindAllOrderEnum,
  QuestionControllerFindAllStatusEnum,
  QuestionControllerFindAllApprovalStatusEnum,
  QuestionControllerFindAllCreatorTypeEnum,
} from "@/API_Client/client/apis/questions-api";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { useAdminGuard } from "@/hooks/useAdminGuard";
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
import ConfirmDialog from "./ConfirmDialog";
import { StatsSkeleton, ListSkeleton } from "./Skeletons";
import { QuestionFormValues, questionFormSchema } from "./schemas";
import * as S from "./style";

const QUESTIONS_PAGE_SIZE = 10;
const QUESTIONS_FETCH_PAGE_SIZE = 100; // backend-ის მაქსიმალური დასაშვები limit

const emptyQuestionForm: QuestionFormValues = {
  text: "",
  type: "single",
  categoryId: "",
  endDate: "",
  answers: [{ text: "" }, { text: "" }],
};

export const QuestionsPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState<boolean>(true);
  const [questionsPage, setQuestionsPage] = useState<number>(1);
  const [questionsMeta, setQuestionsMeta] = useState<PaginationMetaDto | null>(null);

  // მთლიანი (ყველა გვერდის ჯამური) სტატისტიკისთვის - გვერდობრივი
  // ჩვენების `questions`-ისგან დამოუკიდებლად ვინახავთ
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);
  const [totalAnswersCount, setTotalAnswersCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  const [categories, setCategories] = useState<Category[]>([]);

  // კითხვის ID -> სულ ხმების (აქტივობის) რაოდენობა; `undefined` ჯერ ჩატვირთვამდე
  const [activityCounts, setActivityCounts] = useState<Record<number, number>>({});

  // ─── Filters ──────────────────────────────────────────────────────────────────
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>("");
  const [filterCreatorType, setFilterCreatorType] = useState<string>("");
  const [filterSortBy, setFilterSortBy] = useState<string>("createdAt");
  // შენიშვნა: backend `order`-ს ელოდება მკაცრად ლათინური დიდი ასოებით (ASC/DESC),
  // პატარა ასოებზე 500 აბრუნებს.
  const [filterOrder, setFilterOrder] = useState<string>("DESC");

  const hasActiveFilters =
    filterCategory !== "" ||
    filterStatus !== "" ||
    filterApprovalStatus !== "" ||
    filterCreatorType !== "" ||
    filterSortBy !== "createdAt" ||
    filterOrder !== "DESC";

  const handleResetFilters = () => {
    setFilterCategory("");
    setFilterStatus("");
    setFilterApprovalStatus("");
    setFilterCreatorType("");
    setFilterSortBy("createdAt");
    setFilterOrder("DESC");
    setQuestionsPage(1);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletedAnswerIds, setDeletedAnswerIds] = useState<number[]>([]);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: emptyQuestionForm,
  });
  const createAnswers = useFieldArray({ control: createForm.control, name: "answers" });

  const editForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: emptyQuestionForm,
  });
  const editAnswersField = useFieldArray({ control: editForm.control, name: "answers" });

  const fetchQuestions = async () => {
    if (!session?.accessToken) return;
    setLoadingQ(true);
    try {
      const res = await QuestionAPI(router.locale || "ka", session.accessToken).questionControllerFindAll(
        questionsPage,
        QUESTIONS_PAGE_SIZE,
        filterSortBy || undefined,
        (filterOrder || undefined) as QuestionControllerFindAllOrderEnum | undefined,
        filterCategory !== "" ? Number(filterCategory) : undefined,
        filterStatus !== "" ? (filterStatus as QuestionControllerFindAllStatusEnum) : undefined,
        filterApprovalStatus !== "" ? (filterApprovalStatus as QuestionControllerFindAllApprovalStatusEnum) : undefined,
        filterCreatorType !== "" ? (filterCreatorType as QuestionControllerFindAllCreatorTypeEnum) : undefined
      );
      const list: Question[] = Array.isArray(res.data?.data) ? (res.data.data as Question[]) : [];
      setQuestions(list);
      setQuestionsMeta(res.data?.meta || null);
      fetchActivityCounts(list);
    } catch {
      toast.error("კითხვების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingQ(false);
    }
  };

  // მიმდინარე გვერდზე ჩვენებული კითხვების აქტივობის (მიცემული ხმების) რაოდენობა
  const fetchActivityCounts = async (list: Question[]) => {
    if (!session?.accessToken || list.length === 0) return;
    const api = UserAnswerAPI(router.locale || "ka", session.accessToken);
    const entries = await Promise.all(
      list.map(async (q) => {
        try {
          const res = await api.userAnswerControllerGetResults(String(q.id));
          const data = res.data as any;
          const total = typeof data?.totalVotes === "number" ? data.totalVotes : 0;
          return [q.id, total] as const;
        } catch {
          return [q.id, 0] as const;
        }
      })
    );
    setActivityCounts((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
  };

  // სტატისტიკის ბლოკებისთვის ვითვლით ყველა კითხვასა და პასუხს ყველა
  // გვერდზე გავლით, რადგან `questions` მხოლოდ მიმდინარე გვერდის მონაცემებს შეიცავს
  const fetchQuestionsStats = async () => {
    if (!session?.accessToken) return;
    setStatsLoading(true);
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
    } finally {
      setStatsLoading(false);
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
    if (session?.accessToken) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, questionsPage, filterCategory, filterStatus, filterApprovalStatus, filterCreatorType, filterSortBy, filterOrder]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchQuestionsStats();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // ფილტრის ცვლილებისას ვბრუნდებით პირველ გვერდზე
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setQuestionsPage(1);
  };

  // ─── Create Question ──────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    createForm.reset(emptyQuestionForm);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    setCreateSubmitting(true);
    try {
      const validAnswers = data.answers.map((a) => a.text.trim()).filter((a) => a.length > 0);
      await QuestionAPI(router.locale || "ka", session!.accessToken!).questionControllerCreate({
        text: data.text.trim(),
        type: data.type as any,
        categoryId: data.categoryId !== "" ? Number(data.categoryId) : undefined,
        answers: validAnswers.map((text) => ({ text })),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      });
      toast.success("კითხვა წარმატებით დაემატა!");
      setIsCreateModalOpen(false);
      createForm.reset(emptyQuestionForm);
      fetchQuestions();
      fetchQuestionsStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  // ─── Edit Question ────────────────────────────────────────────────────────────
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    editForm.reset({
      text: q.text,
      type: ((q.type as any) || "single"),
      categoryId: q.categoryId ?? "",
      endDate: "",
      answers: (q.answers || []).map((a) => ({ id: a.id, text: a.text })),
    });
    setDeletedAnswerIds([]);
  };

  const handleRemoveEditAnswerRow = (index: number) => {
    const target = editForm.getValues(`answers.${index}`);
    if (target?.id) setDeletedAnswerIds((prev) => [...prev, target.id as number]);
    editAnswersField.remove(index);
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingQuestion || !session?.accessToken) return;
    const validAnswers = data.answers.filter((a) => a.text.trim().length > 0);

    setEditSubmitting(true);
    try {
      const qApi = QuestionAPI(router.locale || "ka", session.accessToken);
      const aApi = AnswerAPI(router.locale || "ka", session.accessToken);

      await qApi.questionControllerUpdate(
        String(editingQuestion.id),
        { text: data.text.trim(), type: data.type as any, categoryId: data.categoryId !== "" ? Number(data.categoryId) : undefined } as any
      );

      for (const delId of deletedAnswerIds) {
        await aApi.answerControllerRemove(String(delId));
      }

      const originalAnswersMap = new Map((editingQuestion.answers || []).map((a) => [a.id, a.text]));
      for (const ans of validAnswers) {
        if (ans.id) {
          if (originalAnswersMap.get(ans.id) !== ans.text.trim()) {
            await aApi.answerControllerUpdate(String(ans.id), { text: ans.text.trim() });
          }
        } else {
          await aApi.answerControllerAddAnswer(String(editingQuestion.id), { text: ans.text.trim() });
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
  });

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

  // ─── Delete Question (confirm dialog instead of window.confirm) ─────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await QuestionAPI(router.locale || "ka", session?.accessToken || "").questionControllerRemove(String(deleteTarget.id));
      toast.success("კითხვა წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchQuestions();
      fetchQuestionsStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const answersError = (form: typeof createForm | typeof editForm) => {
    const err = form.formState.errors.answers as any;
    return err?.message || err?.root?.message;
  };

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ რეფერენდუმის კითხვები, კატეგორიები და სავარაუდო პასუხები"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი კითხვა
        </S.ActionButton>
      }
    >
      {statsLoading ? (
        <StatsSkeleton count={3} />
      ) : (
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
      )}

      <S.FilterBar>
        <S.FilterGroup>
          <S.FilterLabel>კატეგორია</S.FilterLabel>
          <S.Select
            value={filterCategory}
            onChange={(e) => handleFilterChange(setFilterCategory)(e.target.value)}
          >
            <option value="">ყველა კატეგორია</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </S.Select>
        </S.FilterGroup>

        <S.FilterGroup>
          <S.FilterLabel>აქტიურობის სტატუსი</S.FilterLabel>
          <S.Select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus)(e.target.value)}
          >
            <option value="">ყველა</option>
            <option value="active">აქტიური</option>
            <option value="inactive">არააქტიური</option>
          </S.Select>
        </S.FilterGroup>

        <S.FilterGroup>
          <S.FilterLabel>დამტკიცების სტატუსი</S.FilterLabel>
          <S.Select
            value={filterApprovalStatus}
            onChange={(e) => handleFilterChange(setFilterApprovalStatus)(e.target.value)}
          >
            <option value="">ყველა</option>
            <option value="pending">მოლოდინში</option>
            <option value="approved">დამტკიცებული</option>
            <option value="rejected">უარყოფილი</option>
          </S.Select>
        </S.FilterGroup>

        <S.FilterGroup>
          <S.FilterLabel>შემქმნელი</S.FilterLabel>
          <S.Select
            value={filterCreatorType}
            onChange={(e) => handleFilterChange(setFilterCreatorType)(e.target.value)}
          >
            <option value="">ყველა</option>
            <option value="admin">ადმინი</option>
            <option value="user">მომხმარებელი</option>
          </S.Select>
        </S.FilterGroup>

        <S.FilterGroup>
          <S.FilterLabel>დალაგება</S.FilterLabel>
          <S.Select
            value={filterSortBy}
            onChange={(e) => handleFilterChange(setFilterSortBy)(e.target.value)}
          >
            <option value="createdAt">დამატების თარიღი</option>
            <option value="endDate">დასრულების თარიღი</option>
            <option value="text">ტექსტი</option>
          </S.Select>
        </S.FilterGroup>

        <S.FilterGroup>
          <S.FilterLabel>მიმართულება</S.FilterLabel>
          <S.Select
            value={filterOrder}
            onChange={(e) => handleFilterChange(setFilterOrder)(e.target.value)}
          >
            <option value="DESC">კლებადი</option>
            <option value="ASC">ზრდადი</option>
          </S.Select>
        </S.FilterGroup>

        <S.FilterActions>
          <S.ActionButton
            type="button"
            variant="secondary"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
          >
            <CloseIcon size={14} /> ფილტრის გასუფთავება
          </S.ActionButton>
        </S.FilterActions>
      </S.FilterBar>

      {loadingQ ? (
        <ListSkeleton count={3} />
      ) : questions.length === 0 ? (
        <S.EmptyState>
          <ClipboardIcon size={48} />
          <S.EmptyTitle>კითხვები არ არის დამატებული</S.EmptyTitle>
          <S.EmptyText>დააჭირეთ &quot;ახალი კითხვა&quot; ღილაკს პირველი კითხვის შესაქმნელად.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
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
                    {/* <S.Badge variant={q.type === "multiple" ? "multiple" : "single"}>
                      {q.type === "multiple" ? <CheckSquareIcon size={13} /> : <RadioIcon size={13} />}
                      {q.type === "multiple" ? "მრავალარჩევიანი" : "ერთარჩევიანი"}
                    </S.Badge> */}
                    <S.Badge variant={q.isActive ? "active" : "inactive"}>
                      {q.isActive ? "აქტიური" : "არააქტიური"}
                    </S.Badge>
                    {q.category && (
                      <S.Badge variant="date"><TagIcon size={13} /> {q.category.name}</S.Badge>
                    )}
                    {q.creatorType === "user" && q.createdById && (
                      <S.Badge variant="date">User ID: {q.createdById}</S.Badge>
                    )}
                    {q.createdAt && (
                      <S.Badge variant="date"><CalendarIcon size={13} /> {new Date(q.createdAt).toLocaleDateString("ka-GE")}</S.Badge>
                    )}
                    {q.endDate && (
                      <S.Badge variant="date"><HourglassIcon size={13} /> {new Date(q.endDate).toLocaleDateString("ka-GE")}</S.Badge>
                    )}
                    <S.Badge variant="date">
                      <TargetIcon size={13} /> აქტივობა: {activityCounts[q.id] ?? 0}
                    </S.Badge>
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
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(q)}>
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
            ← 
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
            →
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
            <form onSubmit={handleCreateSubmit} noValidate>
              <S.FormGroup>
                <S.Label>კითხვის ტექსტი</S.Label>
                <S.Input
                  type="text"
                  placeholder="მაგ: რომელ ქალაქს ანიჭებთ უპირატესობას?"
                  {...createForm.register("text")}
                />
                {createForm.formState.errors.text && <S.FieldError>{createForm.formState.errors.text.message}</S.FieldError>}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კატეგორია (არასავალდებულო)</S.Label>
                <Controller
                  control={createForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <S.Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    >
                      <option value="">— კატეგორიის გარეშე —</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </S.Select>
                  )}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კითხვის ტიპი</S.Label>
                <S.Select {...createForm.register("type")}>
                  <option value="single">ერთარჩევიანი (Single Choice)</option>
                  <option value="multiple">მრავალარჩევიანი (Multiple Choice)</option>
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>დამთავრების თარიღი (არასავალდებულო)</S.Label>
                <S.Input type="date" {...createForm.register("endDate")} />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სავარაუდო პასუხები (მინიმუმ 2)</S.Label>
                {createAnswers.fields.map((field, index) => (
                  <S.AnswerInputRow key={field.id}>
                    <S.Input
                      type="text"
                      placeholder={`პასუხის ვარიანტი ${index + 1}`}
                      {...createForm.register(`answers.${index}.text` as const)}
                    />
                    {createAnswers.fields.length > 2 && (
                      <S.ActionButton
                        type="button"
                        variant="secondary"
                        style={{ color: "var(--ref-danger)", padding: "10px 14px" }}
                        onClick={() => createAnswers.remove(index)}
                      >
                        <TrashIcon size={16} />
                      </S.ActionButton>
                    )}
                  </S.AnswerInputRow>
                ))}
                {answersError(createForm) && <S.FieldError>{answersError(createForm)}</S.FieldError>}
                <S.ActionButton
                  type="button"
                  variant="outline"
                  style={{ marginTop: "8px", justifyContent: "center" }}
                  onClick={() => createAnswers.append({ text: "" })}
                >
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
            <form onSubmit={handleEditSubmit} noValidate>
              <S.FormGroup>
                <S.Label>კითხვის ტექსტი</S.Label>
                <S.Input type="text" {...editForm.register("text")} />
                {editForm.formState.errors.text && <S.FieldError>{editForm.formState.errors.text.message}</S.FieldError>}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კატეგორია (არასავალდებულო)</S.Label>
                <Controller
                  control={editForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <S.Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    >
                      <option value="">— კატეგორიის გარეშე —</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </S.Select>
                  )}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კითხვის ტიპი</S.Label>
                <S.Select {...editForm.register("type")}>
                  <option value="single">ერთარჩევიანი (Single Choice)</option>
                  <option value="multiple">მრავალარჩევიანი (Multiple Choice)</option>
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სავარაუდო პასუხები (მინიმუმ 2)</S.Label>
                {editAnswersField.fields.map((field, index) => (
                  <S.AnswerInputRow key={field.id}>
                    <S.Input
                      type="text"
                      placeholder={`პასუხის ვარიანტი ${index + 1}`}
                      {...editForm.register(`answers.${index}.text` as const)}
                    />
                    {editAnswersField.fields.length > 2 && (
                      <S.ActionButton
                        type="button"
                        variant="secondary"
                        style={{ color: "var(--ref-danger)", padding: "10px 14px" }}
                        onClick={() => handleRemoveEditAnswerRow(index)}
                      >
                        <TrashIcon size={16} />
                      </S.ActionButton>
                    )}
                  </S.AnswerInputRow>
                ))}
                {answersError(editForm) && <S.FieldError>{answersError(editForm)}</S.FieldError>}
                <S.ActionButton
                  type="button"
                  variant="outline"
                  style={{ marginTop: "8px", justifyContent: "center" }}
                  onClick={() => editAnswersField.append({ text: "" })}
                >
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="კითხვის წაშლა"
        description="ნამდვილად გსურთ ამ კითხვის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default QuestionsPage;
