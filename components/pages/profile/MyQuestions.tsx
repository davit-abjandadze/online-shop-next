import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import { QuestionAPI } from "@/API_Client";
import { PaginationMetaDto, Question } from "@/API_Client/client/models";
import { getPaginationRange } from "@/utils/getPaginationRange";
import {
  CalendarIcon,
  CheckSquareIcon,
  ClipboardIcon,
  HourglassIcon,
  LockIcon,
  PlusIcon,
  RadioIcon,
} from "@/components/ui/RefIcons";
import { ProfileLayout } from "./ProfileLayout";
import * as S from "./style";

const PAGE_SIZE = 10;

const APPROVAL_LABEL: Record<string, string> = {
  pending: "მოლოდინში",
  approved: "დამტკიცებული",
  rejected: "უარყოფილი",
};

export const MyQuestionsComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<PaginationMetaDto | null>(null);

  const fetchMyQuestions = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await QuestionAPI(router.locale || "ka", session.accessToken).questionControllerFindMyQuestions(page, PAGE_SIZE);
      const data = res.data as any;
      setQuestions(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta || null);
    } catch {
      toast.error("თქვენი კითხვების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchMyQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, page]);

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

  return (
    <ProfileLayout
      activeTab="myQuestions"
      title="ჩემი დასმული კითხვები"
      subtitle="თვალი ადევნეთ თქვენ მიერ დამატებული კითხვების განხილვის სტატუსს"
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <S.ActionButton variant="primary" onClick={() => router.push("/questions/ask")}>
          <PlusIcon size={16} /> ახალი კითხვის დამატება
        </S.ActionButton>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
        </div>
      ) : questions.length === 0 ? (
        <S.EmptyState>
          <ClipboardIcon size={48} />
          <S.EmptyTitle>თქვენ ჯერ არ დაგისვამთ არცერთი კითხვა</S.EmptyTitle>
          <S.EmptyText>დააჭირეთ &quot;ახალი კითხვის დამატება&quot; ღილაკს პირველი კითხვის შესაქმნელად.</S.EmptyText>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {questions.map((q) => (
            <S.QuestionCard key={q.id}>
              <S.QuestionCardHeader>
                <div>
                  <S.QuestionText>{q.text}</S.QuestionText>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {/* <S.Badge>
                      {q.type === "multiple" ? <CheckSquareIcon size={13} /> : <RadioIcon size={13} />}
                      {q.type === "multiple" ? "მრავალარჩევიანი" : "ერთარჩევიანი"}
                    </S.Badge> */}
                    <S.Badge
                      variant={
                        q.approvalStatus === "approved"
                          ? "approved"
                          : q.approvalStatus === "rejected"
                          ? "rejected"
                          : "pending"
                      }
                    >
                      <HourglassIcon size={13} /> {APPROVAL_LABEL[q.approvalStatus] || q.approvalStatus}
                    </S.Badge>
                    {q.createdAt && (
                      <S.Badge variant="date">
                        <CalendarIcon size={13} /> {new Date(q.createdAt).toLocaleDateString("ka-GE")}
                      </S.Badge>
                    )}
                  </div>
                  {q.approvalStatus === "rejected" && q.rejectionReason && (
                    <S.RejectionReasonBox>
                      <strong>უარყოფის მიზეზი:</strong> {q.rejectionReason}
                    </S.RejectionReasonBox>
                  )}
                </div>
              </S.QuestionCardHeader>
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
    </ProfileLayout>
  );
};

export default MyQuestionsComponent;
