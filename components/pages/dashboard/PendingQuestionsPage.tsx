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
  CloseIcon,
  HourglassIcon,
  RadioIcon,
  TagIcon,
  WarningIcon,
} from "@/components/ui/RefIcons";
import DashboardLayout from "./DashboardLayout";
import { ListSkeleton } from "./Skeletons";
import * as S from "./style";

const PAGE_SIZE = 10;

export const PendingQuestionsPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<PaginationMetaDto | null>(null);

  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Question | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectSubmitting, setRejectSubmitting] = useState<boolean>(false);

  const fetchPending = async () => {
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
        "pending",
        "user"
      );
      const data = res.data as any;
      setQuestions(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta || null);
    } catch {
      toast.error("დასადასტურებელი კითხვების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchPending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, page]);

  const handleApprove = async (q: Question) => {
    if (!session?.accessToken) return;
    setApprovingId(q.id);
    try {
      await QuestionAPI(router.locale || "ka", session.accessToken).questionControllerApprove(String(q.id));
      toast.success("კითხვა დამტკიცებულია!");
      fetchPending();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის დამტკიცება ვერ მოხერხდა");
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenReject = (q: Question) => {
    setRejectTarget(q);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget || !session?.accessToken) return;
    if (!rejectReason.trim()) {
      toast.warning("გთხოვთ მიუთითოთ უარყოფის მიზეზი");
      return;
    }
    setRejectSubmitting(true);
    try {
      await QuestionAPI(router.locale || "ka", session.accessToken).questionControllerReject(
        { reason: rejectReason.trim() },
        String(rejectTarget.id)
      );
      toast.success("კითხვა უარყოფილია!");
      setRejectTarget(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კითხვის უარყოფა ვერ მოხერხდა");
    } finally {
      setRejectSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="დასადასტურებელი კითხვები"
      subtitle="მომხმარებლების მიერ დამატებული კითხვები, რომლებიც ელოდება თქვენს გადაწყვეტილებას"
    >
      {loading ? (
        <ListSkeleton count={3} />
      ) : questions.length === 0 ? (
        <S.EmptyState>
          <HourglassIcon size={48} />
          <S.EmptyTitle>დასადასტურებელი კითხვები არ არის</S.EmptyTitle>
          <S.EmptyText>ამ ეტაპზე მომხმარებლების მიერ დამატებული ახალი კითხვები არ არის.</S.EmptyText>
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
                    <S.Badge variant="pending">
                      <HourglassIcon size={13} /> მოლოდინში
                    </S.Badge>
                    {q.category && (
                      <S.Badge variant="date"><TagIcon size={13} /> {q.category.name}</S.Badge>
                    )}
                    {q.createdBy && (
                      <S.Badge variant="date">
                        {q.createdBy.firstName || q.createdBy.email} მიერ
                      </S.Badge>
                    )}
                    {q.createdAt && (
                      <S.Badge variant="date"><CalendarIcon size={13} /> {new Date(q.createdAt).toLocaleDateString("ka-GE")}</S.Badge>
                    )}
                  </S.BadgeGroup>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="success" onClick={() => handleApprove(q)} disabled={approvingId === q.id}>
                    <CheckCircleIcon size={16} /> {approvingId === q.id ? "მუშავდება..." : "დადასტურება"}
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => handleOpenReject(q)}>
                    <CloseIcon size={16} /> უკუგდება
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
            ← წინა
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
            შემდეგი →
          </S.PageButton>
        </S.PaginationBar>
      )}

      {/* ═══ REJECT MODAL ═══════════════════════════════════════════════════════ */}
      {rejectTarget && (
        <S.ModalOverlay onClick={() => setRejectTarget(null)}>
          <S.ModalContent style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ref-danger)" }}>
                <WarningIcon size={18} /> კითხვის უკუგდება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setRejectTarget(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <S.FormGroup>
              <S.Label>უარყოფის მიზეზი</S.Label>
              <S.Textarea
                placeholder="მაგ: კითხვის ტექსტი არ არის ნათელი"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              {!rejectReason.trim() && <S.FieldError>მიზეზის მითითება სავალდებულოა</S.FieldError>}
            </S.FormGroup>
            <S.ModalFooter>
              <S.ActionButton type="button" variant="secondary" onClick={() => setRejectTarget(null)} disabled={rejectSubmitting}>
                გაუქმება
              </S.ActionButton>
              <S.ActionButton
                type="button"
                variant="danger"
                onClick={handleConfirmReject}
                disabled={rejectSubmitting || !rejectReason.trim()}
              >
                {rejectSubmitting ? "მუშავდება..." : "უკუგდება"}
              </S.ActionButton>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </DashboardLayout>
  );
};

export default PendingQuestionsPage;
