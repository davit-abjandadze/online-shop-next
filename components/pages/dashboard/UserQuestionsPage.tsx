import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { QuestionAPI } from "@/API_Client";
import { PaginationMetaDto, Question } from "@/API_Client/client/models";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import {
  CalendarIcon,
  CheckCircleIcon,
  CheckSquareIcon,
  ClipboardIcon,
  CloseIcon,
  RadioIcon,
  TagIcon,
  TrashIcon,
} from "@/components/ui/RefIcons";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import * as S from "./style";

const PAGE_SIZE = 10;

type ApprovalFilter = "approved" | "rejected";

export const UserQuestionsPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();

  const [filter, setFilter] = useState<ApprovalFilter>("approved");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<PaginationMetaDto | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const [approvedCount, setApprovedCount] = useState<number | null>(null);
  const [rejectedCount, setRejectedCount] = useState<number | null>(null);

  const fetchCounts = async () => {
    if (!session?.accessToken) return;
    try {
      const [approvedRes, rejectedRes] = await Promise.all([
        QuestionAPI(router.locale || "ka", session.accessToken).questionControllerFindAll(
          1,
          1,
          undefined,
          undefined,
          undefined,
          undefined,
          "approved",
          "user"
        ),
        QuestionAPI(router.locale || "ka", session.accessToken).questionControllerFindAll(
          1,
          1,
          undefined,
          undefined,
          undefined,
          undefined,
          "rejected",
          "user"
        ),
      ]);
      setApprovedCount(((approvedRes.data as any)?.meta?.total) ?? 0);
      setRejectedCount(((rejectedRes.data as any)?.meta?.total) ?? 0);
    } catch {
      // silently ignore — counts are supplementary
    }
  };

  const fetchQuestions = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await QuestionAPI(router.locale || "ka", session.accessToken).questionControllerFindAll(
        page,
        PAGE_SIZE,
        undefined,
        undefined,
        undefined,
        undefined,
        filter,
        "user"
      );
      const data = res.data as any;
      setQuestions(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta || null);
    } catch {
      toast.error("კითხვების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, page, filter]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleTabChange = (next: ApprovalFilter) => {
    if (next === filter) return;
    setFilter(next);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await QuestionAPI(router.locale || "ka", session.accessToken).questionControllerRemove(String(deleteTarget.id));
      toast.success("კითხვა წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchQuestions();
      fetchCounts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="მომხმარებლების კითხვები"
      subtitle="თქვენ მიერ დამტკიცებული და უარყოფილი, მომხმარებლების მიერ დამატებული კითხვები"
    >
      <S.TabBar>
        <S.Tab active={filter === "approved"} onClick={() => handleTabChange("approved")}>
          <CheckCircleIcon size={15} /> დამტკიცებული
          {approvedCount !== null && <S.TabCount active={filter === "approved"}>{approvedCount}</S.TabCount>}
        </S.Tab>
        <S.Tab active={filter === "rejected"} onClick={() => handleTabChange("rejected")}>
          <CloseIcon size={15} /> უარყოფილი
          {rejectedCount !== null && <S.TabCount active={filter === "rejected"}>{rejectedCount}</S.TabCount>}
        </S.Tab>
      </S.TabBar>

      {loading ? (
        <ListSkeleton count={3} />
      ) : questions.length === 0 ? (
        <S.EmptyState>
          <ClipboardIcon size={48} />
          <S.EmptyTitle>
            {filter === "approved" ? "დამტკიცებული კითხვები არ არის" : "უარყოფილი კითხვები არ არის"}
          </S.EmptyTitle>
          <S.EmptyText>
            {filter === "approved"
              ? "თქვენ ჯერ არცერთი მომხმარებლის კითხვა არ დაგიდასტურებიათ."
              : "თქვენ ჯერ არცერთი მომხმარებლის კითხვა არ უარგიყვიათ."}
          </S.EmptyText>
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
                    <S.Badge variant={filter === "approved" ? "approved" : "rejected"}>
                      {filter === "approved" ? <CheckCircleIcon size={13} /> : <CloseIcon size={13} />}
                      {filter === "approved" ? "დამტკიცებული" : "უარყოფილი"}
                    </S.Badge>
                    {q.categories?.map((cat) => (
                      <S.Badge key={cat.id} variant="date"><TagIcon size={13} /> {cat.name}</S.Badge>
                    ))}
                    {q.createdBy && (
                      <S.Badge variant="date">
                        {q.createdBy.firstName || q.createdBy.email} მიერ
                      </S.Badge>
                    )}
                    {q.creatorType === "user" && q.createdById && (
                      <S.Badge variant="date">User ID: {q.createdById}</S.Badge>
                    )}
                    {q.createdAt && (
                      <S.Badge variant="date"><CalendarIcon size={13} /> {new Date(q.createdAt).toLocaleDateString("ka-GE")}</S.Badge>
                    )}
                  </S.BadgeGroup>
                  {filter === "rejected" && q.rejectionReason && (
                    <S.RejectionReasonBox>
                      <strong>უარყოფის მიზეზი:</strong> {q.rejectionReason}
                    </S.RejectionReasonBox>
                  )}
                </div>
                <S.CardActions>
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

      {meta && meta.totalPages > 1 && (
        <S.PaginationBar>
          <S.PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta.hasPrevious}>
            ←
          </S.PageButton>

          <S.PageNumbers>
            {getPaginationRange(meta.page, meta.totalPages).map((item, idx) =>
              item === "..." ? (
                <S.PageEllipsis key={`ellipsis-${idx}`}>...</S.PageEllipsis>
              ) : (
                <S.PageNumberButton key={item} active={item === meta.page} onClick={() => setPage(item)}>
                  {item}
                </S.PageNumberButton>
              )
            )}
          </S.PageNumbers>

          <S.PageButton onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}>
            →
          </S.PageButton>
        </S.PaginationBar>
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

export default UserQuestionsPage;
