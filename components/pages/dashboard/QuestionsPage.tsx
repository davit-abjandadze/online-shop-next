import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnswerAPI, CategoriesAPI, QuestionAPI, StatsAPI, UserAnswerAPI } from "@/API_Client";
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
  DragHandleIcon,
  EditIcon,
  HourglassIcon,
  PauseIcon,
  PinIcon,
  PlayIcon,
  PlusIcon,
  QuestionMarkIcon,
  RadioIcon,
  SearchIcon,
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
  categoryIds: [],
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
  // კითხვის ID -> ქალი/კაცი ამომრჩეველთა რაოდენობა (ბეიჯისთვის)
  const [genderCounts, setGenderCounts] = useState<Record<number, { female: number; male: number }>>({});

  // ─── Filters ──────────────────────────────────────────────────────────────────
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>("");
  const [filterCreatorType, setFilterCreatorType] = useState<string>("");
  const [filterSortBy, setFilterSortBy] = useState<string>("createdAt");
  // შენიშვნა: backend `order`-ს ელოდება მკაცრად ლათინური დიდი ასოებით (ASC/DESC),
  // პატარა ასოებზე 500 აბრუნებს.
  const [filterOrder] = useState<string>("DESC");
  // "აქტივობა" - როცა მონიშნულია, სია ლაგდება ხმების (მიცემული პასუხების) რაოდენობის
  // მიხედვით კლებადობით. Backend-ს არ აქვს ასეთი sortBy ველი, ამიტომ ვლაგებთ კლიენტის მხარეს.
  const [filterActivitySort, setFilterActivitySort] = useState<string>("");
  // ძიება კითხვის სათაურით (კლიენტის მხარეს ფილტრაცია)
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setQuestionsPage(1);
  }, [debouncedSearch, filterActivitySort]);

  const hasActiveFilters =
    filterCategory !== "" ||
    filterStatus !== "" ||
    filterApprovalStatus !== "" ||
    filterCreatorType !== "" ||
    filterSortBy !== "createdAt" ||
    filterActivitySort !== "" ||
    searchText !== "";

  const handleResetFilters = () => {
    setFilterCategory("");
    setFilterStatus("");
    setFilterApprovalStatus("");
    setFilterCreatorType("");
    setFilterSortBy("createdAt");
    setFilterActivitySort("");
    setSearchText("");
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

  // ─── Answer reorder (drag & drop) ──────────────────────────────────────────────
  // ერთი "საწყისი" ინდექსი გადმოგვაქვს drag-ის დაწყებისას, drag-ისას (dragover) კი
  // ვცვლით ველების თანმიმდევრობას ცოცხლად, რომ დათრევისას ვიზუალურად თანავე ჩანდეს გადალაგება.
  const [draggedAnswerIndex, setDraggedAnswerIndex] = useState<number | null>(null);

  const handleAnswerDragStart = (index: number) => () => {
    setDraggedAnswerIndex(index);
  };

  const handleAnswerDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedAnswerIndex === null || draggedAnswerIndex === index) return;
    editAnswersField.move(draggedAnswerIndex, index);
    setDraggedAnswerIndex(index);
  };

  const handleAnswerDragEnd = () => {
    setDraggedAnswerIndex(null);
  };

  // მიმდინარე გვერდზე ჩვენებული კითხვების აქტივობის (მიცემული ხმების) რაოდენობა.
  // აბრუნებს დათვლილ მნიშვნელობებს, რომ საჯარისო (activity) დალაგებას დაუყოვნებლივ დასჭირდეს.
  const fetchActivityCounts = async (list: Question[]): Promise<Record<number, number>> => {
    if (!session?.accessToken || list.length === 0) return {};
    const api = UserAnswerAPI(router.locale || "ka", session.accessToken);
    const statsApi = StatsAPI(router.locale || "ka", session.accessToken);
    const entries = await Promise.all(
      list.map(async (q) => {
        let total = 0;
        try {
          const res = await api.userAnswerControllerGetResults(String(q.id));
          const data = res.data as any;
          total = typeof data?.totalVotes === "number" ? data.totalVotes : 0;
        } catch {
          total = 0;
        }

        try {
          const demoRes = await statsApi.statsControllerGetQuestionDemographics(String(q.id));
          const demoData = demoRes.data as any;
          const byGender = Array.isArray(demoData?.byGender) ? demoData.byGender : [];
          const female = byGender.find((g: any) => g.gender === "female")?.votes || 0;
          const male = byGender.find((g: any) => g.gender === "male")?.votes || 0;
          setGenderCounts((prev) => ({ ...prev, [q.id]: { female, male } }));
        } catch {
          // ბეიჯს ვაცილებთ, აქტივობის რაოდენობა ცალკე გამოთვლილია
        }

        return [q.id, total] as const;
      })
    );
    const map = Object.fromEntries(entries);
    setActivityCounts((prev) => ({ ...prev, ...map }));
    return map;
  };

  const fetchQuestions = async () => {
    if (!session?.accessToken) return;
    setLoadingQ(true);
    try {
      const api = QuestionAPI(router.locale || "ka", session.accessToken);
      const isClientMode = filterActivitySort === "activity" || debouncedSearch !== "";

      if (!isClientMode) {
        const res = await api.questionControllerFindAll(
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
        return;
      }

      // "აქტივობა"-ზე დალაგება ან ძიება სათაურით ბექენდში არ არსებობს, ამიტომ ვკრეფავთ
      // ყველა კითხვას (ფილტრებით), ვთვლით აქტივობას და ვლაგებთ/ვფილტრავთ/ვგვერდავთ კლიენტის მხარეს.
      let page = 1;
      let totalPages = 1;
      let all: Question[] = [];
      do {
        const res = await api.questionControllerFindAll(
          page,
          QUESTIONS_FETCH_PAGE_SIZE,
          filterSortBy || undefined,
          (filterOrder || undefined) as QuestionControllerFindAllOrderEnum | undefined,
          filterCategory !== "" ? Number(filterCategory) : undefined,
          filterStatus !== "" ? (filterStatus as QuestionControllerFindAllStatusEnum) : undefined,
          filterApprovalStatus !== "" ? (filterApprovalStatus as QuestionControllerFindAllApprovalStatusEnum) : undefined,
          filterCreatorType !== "" ? (filterCreatorType as QuestionControllerFindAllCreatorTypeEnum) : undefined
        );
        const data = res.data as any;
        const pageList: Question[] = Array.isArray(data?.data) ? data.data : [];
        all = all.concat(pageList);
        totalPages = data?.meta?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);

      if (debouncedSearch !== "") {
        const needle = debouncedSearch.toLowerCase();
        all = all.filter((q) => (q.text || "").toLowerCase().includes(needle));
      }

      const counts = await fetchActivityCounts(all);
      const getCount = (q: Question) => counts[q.id] ?? activityCounts[q.id] ?? 0;

      if (filterActivitySort === "activity") {
        all = [...all].sort((a, b) => getCount(b) - getCount(a));
      }

      const total = all.length;
      const totalPagesLocal = Math.max(1, Math.ceil(total / QUESTIONS_PAGE_SIZE));
      const currentPage = Math.min(questionsPage, totalPagesLocal);
      const startIdx = (currentPage - 1) * QUESTIONS_PAGE_SIZE;
      const pageSlice = all.slice(startIdx, startIdx + QUESTIONS_PAGE_SIZE);

      setQuestions(pageSlice);
      setQuestionsMeta({
        page: currentPage,
        limit: QUESTIONS_PAGE_SIZE,
        total,
        totalPages: totalPagesLocal,
        hasNext: currentPage < totalPagesLocal,
        hasPrevious: currentPage > 1,
      } as PaginationMetaDto);
      if (currentPage !== questionsPage) setQuestionsPage(currentPage);
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
  }, [session?.accessToken, questionsPage, filterCategory, filterStatus, filterApprovalStatus, filterCreatorType, filterSortBy, filterActivitySort, debouncedSearch]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchQuestionsStats();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

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
        categoryIds: data.categoryIds && data.categoryIds.length > 0 ? data.categoryIds : undefined,
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
      categoryIds: (q.categories || []).map((c) => c.id),
      endDate: "",
      answers: (q.answers || []).map((a) => ({ id: a.id, text: a.text })),
    });
    setDeletedAnswerIds([]);
    setDraggedAnswerIndex(null);
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
        {
          text: data.text.trim(),
          type: data.type as any,
          categoryIds: data.categoryIds && data.categoryIds.length > 0 ? data.categoryIds : undefined,
        }
      );

      for (const delId of deletedAnswerIds) {
        await aApi.answerControllerRemove(String(delId));
      }

      const originalAnswersMap = new Map((editingQuestion.answers || []).map((a) => [a.id, a.text]));
      // reorder-ისთვის საჭიროა თითოეული პასუხის რეალური (backend) ID, ფორმაში ნაჩვენები
      // თანმიმდევრობით — ახლად დამატებულებს ID-ს ვიღებთ create-response-იდან
      const orderedAnswerIds: number[] = [];
      let answersOrderChanged = false;
      for (const ans of validAnswers) {
        if (ans.id) {
          if (originalAnswersMap.get(ans.id) !== ans.text.trim()) {
            await aApi.answerControllerUpdate(String(ans.id), { text: ans.text.trim() });
          }
          orderedAnswerIds.push(ans.id);
        } else {
          const res = await aApi.answerControllerAddAnswer(String(editingQuestion.id), { text: ans.text.trim() });
          const created = res.data as any;
          if (created?.id) orderedAnswerIds.push(created.id);
          answersOrderChanged = true;
        }
      }

      // თუ არსებული პასუხების თანმიმდევრობა (drag&drop-ით) შეიცვალა, ვაცხადებთ
      // ბექენდში ახალ ორდერს. ახალი პასუხის დამატება/წაშლაც ითვლება ცვლილებად.
      const originalIdsOrder = (editingQuestion.answers || []).map((a) => a.id);
      const existingIdsOrder = orderedAnswerIds.filter((id) =>
        originalIdsOrder.includes(id)
      );
      if (
        deletedAnswerIds.length > 0 ||
        answersOrderChanged ||
        existingIdsOrder.some((id, idx) => id !== originalIdsOrder[idx])
      ) {
        await aApi.answerControllerReorder(String(editingQuestion.id), { answerIds: orderedAnswerIds });
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

  const handleTogglePin = async (q: Question) => {
    if (!q.isActive && !q.isPinned) {
      toast.error("არააქტიური კითხვის დაპინვა შეუძლებელია");
      return;
    }
    try {
      const qApi = QuestionAPI(router.locale || "ka", session?.accessToken || "");
      if (q.isPinned) {
        await qApi.questionControllerUnpin(String(q.id));
        toast.success("კითხვას მოეხსნა პინი!");
      } else {
        await qApi.questionControllerPin(String(q.id));
        toast.success("კითხვა დაპინულია!");
      }
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პინის სტატუსის შეცვლა ვერ მოხერხდა");
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
        <S.FilterBarHeader>
          <S.FilterBarTitle>
            <ClipboardIcon size={16} />
            ფილტრები
            {hasActiveFilters && <S.FilterCountBadge>აქტიური</S.FilterCountBadge>}
          </S.FilterBarTitle>
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
        </S.FilterBarHeader>

        <S.FilterGrid>
          <S.FilterGroup>
            <S.FilterLabel>ძიება</S.FilterLabel>
            <S.SearchInputWrapper>
              <SearchIcon size={16} />
              <S.Input
                type="text"
                placeholder="მოძებნეთ კითხვის სათაურით..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </S.SearchInputWrapper>
          </S.FilterGroup>

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
            <S.FilterLabel>აქტივობა</S.FilterLabel>
            <S.Select
              value={filterActivitySort}
              onChange={(e) => handleFilterChange(setFilterActivitySort)(e.target.value)}
            >
              <option value="">ჩვეულებრივი დალაგება</option>
              <option value="activity">აქტივობის მიხედვით (ხმების რაოდენობა)</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterGrid>
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
                    {q.isPinned && (
                      <S.Badge variant="pinned">
                        <PinIcon size={12} /> დაპინული
                      </S.Badge>
                    )}
                    {q.categories?.map((cat) => (
                      <S.Badge key={cat.id} variant="date"><TagIcon size={13} /> {cat.name}</S.Badge>
                    ))}
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
                    <S.Badge variant="date" title="ქალი / კაცი ამომრჩეველთა რაოდენობა">
                      ♀ {genderCounts[q.id]?.female ?? 0} · ♂ {genderCounts[q.id]?.male ?? 0}
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
                  {/* არააქტიური კითხვის დაპინვა არ შეიძლება, ამიტომ ღილაკიც არ ჩანს */}
                  {q.isActive && (
                    <S.ActionButton
                      variant={q.isPinned ? "secondary" : "outline"}
                      onClick={() => handleTogglePin(q)}
                    >
                      <PinIcon size={16} />
                      {q.isPinned ? "პინის მოხსნა" : "დაპინვა"}
                    </S.ActionButton>
                  )}
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
                <S.Label>კატეგორია (არასავალდებულო, შესაძლებელია რამდენიმეს არჩევა)</S.Label>
                <Controller
                  control={createForm.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <S.CategoryCheckboxGrid>
                      {categories.map((cat) => {
                        const checked = (field.value || []).includes(cat.id);
                        return (
                          <S.CategoryCheckboxItem key={cat.id} checked={checked}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const current = field.value || [];
                                field.onChange(
                                  checked ? current.filter((id) => id !== cat.id) : [...current, cat.id]
                                );
                              }}
                            />
                            {cat.name}
                          </S.CategoryCheckboxItem>
                        );
                      })}
                    </S.CategoryCheckboxGrid>
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
                <S.Label>კატეგორია (არასავალდებულო, შესაძლებელია რამდენიმეს არჩევა)</S.Label>
                <Controller
                  control={editForm.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <S.CategoryCheckboxGrid>
                      {categories.map((cat) => {
                        const checked = (field.value || []).includes(cat.id);
                        return (
                          <S.CategoryCheckboxItem key={cat.id} checked={checked}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const current = field.value || [];
                                field.onChange(
                                  checked ? current.filter((id) => id !== cat.id) : [...current, cat.id]
                                );
                              }}
                            />
                            {cat.name}
                          </S.CategoryCheckboxItem>
                        );
                      })}
                    </S.CategoryCheckboxGrid>
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
                <S.Label>სავარაუდო პასუხები (მინიმუმ 2) — გადაათრიეთ თანმიმდევრობის შესაცვლელად</S.Label>
                {editAnswersField.fields.map((field, index) => (
                  <S.AnswerInputRow
                    key={field.id}
                    dragging={draggedAnswerIndex === index}
                    draggable
                    onDragStart={handleAnswerDragStart(index)}
                    onDragOver={handleAnswerDragOver(index)}
                    onDragEnd={handleAnswerDragEnd}
                    onDrop={(e) => e.preventDefault()}
                  >
                    <S.DragHandle title="გადათრევით გადაალაგეთ">
                      <DragHandleIcon size={18} />
                    </S.DragHandle>
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
