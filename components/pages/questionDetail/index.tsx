import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import ReferendumFooter from "@/components/shared/ReferendumFooter";
import AuthModal from "@/components/shared/AuthModal";
import CompleteProfileModal from "@/components/shared/CompleteProfileModal";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { FavoritesAPI, UserAnswerAPI, UserAPI } from "@/API_Client";
import { Question } from "@/API_Client/client/models";
import { ParsedResult, parseResultsData } from "@/utils/parseQuestionResults";
import * as S from "@/components/pages/home/style";

export interface QuestionDetailProps {
  question: Question;
}

export const QuestionDetailComponent: React.FC<QuestionDetailProps> = ({ question: q }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [hasVoted, setHasVoted] = useState(false);
  const [isShowingResults, setIsShowingResults] = useState(false);
  const [results, setResults] = useState<ParsedResult | undefined>();
  const [chosenIds, setChosenIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await UserAnswerAPI(
        router.locale || "ka",
        session?.accessToken || ""
      ).userAnswerControllerGetResults(String(q.id));
      setResults(parseResultsData(res.data, q));
    } catch (err) {
      console.log(`Could not fetch results for question ${q.id}:`, err);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    fetchResults();

    if (status === "authenticated" && session?.accessToken) {
      UserAnswerAPI(router.locale || "ka", session.accessToken)
        .userAnswerControllerGetMyVotedQuestions()
        .then((res) => {
          const votedIds: number[] = Array.isArray(res.data) ? res.data : [];
          if (votedIds.includes(q.id)) {
            setHasVoted(true);
            setIsShowingResults(true);
          }
        })
        .catch((err) => console.log("Could not fetch voted questions:", err));

      FavoritesAPI(router.locale || "ka", session.accessToken)
        .favoriteControllerFindMyFavorites(1, 100)
        .then((res) => {
          const data = res.data as any;
          const ids: number[] = Array.isArray(data?.data)
            ? data.data.map((item: any) => item.id).filter((id: any) => id != null)
            : [];
          setIsFavorite(ids.includes(q.id));
        })
        .catch((err) => console.log("Could not fetch favorite questions:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.accessToken]);

  const handleSelectOption = (answerId: number, isMultiple: boolean) => {
    setChosenIds((current) => {
      if (isMultiple) {
        return current.includes(answerId)
          ? current.filter((id) => id !== answerId)
          : [...current, answerId];
      }
      return [answerId];
    });
  };

  // მოწმდება, პროფილში შევსებულია თუ არა ასაკი და სქესი (საჭირო ხმის მისაცემად)
  const checkProfileComplete = async (): Promise<boolean> => {
    if (!session?.accessToken || !session?.user?.id) return false;
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerFindOne(
        session.user.id
      );
      const u = res.data;
      return u.age != null && !!u.gender;
    } catch {
      // თუ პროფილის შემოწმება ვერ მოხერხდა, ხმის მიცემას არ ვბლოკავთ
      return true;
    }
  };

  const handleVote = async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      toast.info("ხმის მისაცემად გთხოვთ გაიაროთ ავტორიზაცია");
      setAuthModalOpen(true);
      return;
    }

    if (!(await checkProfileComplete())) {
      setCompleteProfileOpen(true);
      return;
    }

    if (chosenIds.length === 0) {
      toast.warning("გთხოვთ აირჩიოთ მინიმუმ ერთი პასუხი");
      return;
    }

    setSubmitting(true);
    try {
      await UserAnswerAPI(
        router.locale || "ka",
        session.accessToken
      ).userAnswerControllerSubmitAnswer({ answerIds: chosenIds }, String(q.id));

      toast.success("თქვენი ხმა წარმატებით დარეგისტრირდა!");
      setHasVoted(true);
      setIsShowingResults(true);
      await fetchResults();
    } catch (err: any) {
      console.error("Error submitting vote:", err);
      toast.error(err?.response?.data?.message || "ხმის მიცემა ვერ მოხერხდა");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      toast.info("ფავორიტებში დასამატებლად გთხოვთ გაიაროთ ავტორიზაცია");
      setAuthModalOpen(true);
      return;
    }

    setFavoriting(true);
    try {
      if (isFavorite) {
        await FavoritesAPI(router.locale || "ka", session.accessToken).favoriteControllerRemoveFavorite(
          String(q.id)
        );
        setIsFavorite(false);
      } else {
        await FavoritesAPI(router.locale || "ka", session.accessToken).favoriteControllerAddFavorite(
          String(q.id)
        );
        setIsFavorite(true);
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setIsFavorite(true);
      } else if (err?.response?.status === 404 && isFavorite) {
        setIsFavorite(false);
      } else {
        console.error("Error toggling favorite:", err);
        toast.error(err?.response?.data?.message || "ფავორიტების განახლება ვერ მოხერხდა");
      }
    } finally {
      setFavoriting(false);
    }
  };

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <div style={{ margin: "20px 0" }}>
          <Link href="/" style={{ color: "var(--ref-primary)", fontWeight: 600, textDecoration: "none" }}>
            ← ყველა კითხვის ნახვა
          </Link>
        </div>

        <QuestionCard
          question={q}
          hasVoted={hasVoted}
          isShowingResults={isShowingResults}
          results={results}
          chosenIds={chosenIds}
          submitting={submitting}
          isFavorite={isFavorite}
          favoriting={favoriting}
          onSelectOption={handleSelectOption}
          onVote={handleVote}
          onToggleResults={() => setIsShowingResults((prev) => !prev)}
          onToggleFavorite={handleToggleFavorite}
        />
      </S.Container>

      <ReferendumFooter />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />

      <CompleteProfileModal
        isOpen={completeProfileOpen}
        onClose={() => setCompleteProfileOpen(false)}
        onCompleted={() => {
          setCompleteProfileOpen(false);
          handleVote();
        }}
      />
    </S.PageBackground>
  );
};

export default QuestionDetailComponent;
