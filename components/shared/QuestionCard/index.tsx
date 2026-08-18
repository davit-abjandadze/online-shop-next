import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Question } from "@/API_Client/client/models";
import { ParsedResult } from "@/utils/parseQuestionResults";
import { QuestionDemographics } from "@/types/demographics";
import { DemographicsBreakdown } from "./DemographicsBreakdown";
import {
  BallotIcon,
  ChartIcon,
  CheckCircleIcon,
  CheckSquareIcon,
  CloseIcon,
  FacebookIcon,
  HourglassIcon,
  LinkIcon,
  PeopleIcon,
  RadioIcon,
  StarIcon,
  TagIcon,
  UndoIcon,
} from "@/components/ui/RefIcons";
import * as S from "./style";

const pad = (n: number) => String(n).padStart(2, "0");

export const CountdownBadge: React.FC<{ endDate: Date | string }> = ({ endDate }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diffMs = new Date(endDate).getTime() - now;

  if (diffMs <= 0) {
    return (
      <S.Badge variant="expired">
        <HourglassIcon size={14} /> ვადა გასულია
      </S.Badge>
    );
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <S.Badge variant="countdown">
      {/* <HourglassIcon size={14} /> {days > 0 && `დარჩენილია ${days}დღე და `}{pad(hours)}:{pad(minutes)}:{pad(seconds)} */}
      <HourglassIcon size={14} /> {days > 0 && `${days} დღე და `}{pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </S.Badge>
  );
};

export interface QuestionCardProps {
  question: Question;
  hasVoted: boolean;
  isShowingResults: boolean;
  results?: ParsedResult;
  demographics?: QuestionDemographics;
  chosenIds: number[];
  submitting: boolean;
  isFavorite: boolean;
  favoriting: boolean;
  onSelectOption: (answerId: number, isMultiple: boolean) => void;
  onVote: () => void;
  onToggleResults: () => void;
  onToggleFavorite: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question: q,
  hasVoted,
  isShowingResults,
  results,
  demographics,
  chosenIds,
  submitting,
  isFavorite,
  favoriting,
  onSelectOption,
  onVote,
  onToggleResults,
  onToggleFavorite,
}) => {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isMultiple = q.type === "multiple";
  const maxPct = results ? Math.max(...Object.values(results.answerPercentages), 0) : 0;

  const getShareUrl = () => {
    const localePrefix = router.locale && router.locale !== "default" ? `/${router.locale}` : "";
    return `${window.location.origin}${localePrefix}/questions/${q.id}`;
  };

  const handleShareToFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(fbShareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("ბმული დაკოპირებულია");
    } catch {
      toast.error("ბმულის დაკოპირება ვერ მოხერხდა");
    }
  };

  // `showDemographics=false` ბარათზე ჩვეულებრივი შედეგებისთვის (მხოლოდ ხმების/პროცენტების ჩვენება),
  // `showDemographics=true` კი "დეტალები" მოდალისთვის, სადაც დემოგრაფიული ჩაშლაც ემატება
  const renderResultsDetails = (showDemographics: boolean) => {
    const answerRows = q.answers?.map((ans) => {
      const count = results?.answerCounts[ans.id] || 0;
      const pct = results?.answerPercentages[ans.id] || 0;
      const isTop = pct > 0 && pct === maxPct;
      const answerDemographics = demographics?.answers.find((a) => a.id === ans.id);

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

          {showDemographics && answerDemographics && answerDemographics.votes > 0 && (
            <DemographicsBreakdown
              data={answerDemographics}
              totalVotes={answerDemographics.votes}
              compact
              title="დემოგრაფიული ჩაშლა"
            />
          )}
        </S.ResultRow>
      );
    });

    return (
      <>
        <S.ResultsHeader>
          <S.TotalVotesText>
            <PeopleIcon size={16} /> სულ მიღებულია {results?.totalUsers || 0} ხმა
          </S.TotalVotesText>
        </S.ResultsHeader>

        {showDemographics && demographics && demographics.totalVotes > 0 && (
          <DemographicsBreakdown
            data={demographics}
            totalVotes={demographics.totalVotes}
            title="დემოგრაფია მთელი კითხვისთვის"
          />
        )}

        {/* მოდალში (showDemographics=true) პასუხები ცალკე გამორჩეულ სექციად გამოიყოფა
            გამყოფებით, რომ დემოგრაფიულ ჩაშლასა და კითხვებს შორის არ იჭყლიტებოდეს */}
        {showDemographics ? <S.DetailsResultsList>{answerRows}</S.DetailsResultsList> : answerRows}
      </>
    );
  };

  return (
    <S.QuestionCardWrapper id={`question-${q.id}`}>
      <S.CardTop>
        <S.CardTopContent>
          <S.QuestionText>{q.text}</S.QuestionText>
          {/* <S.Badge variant={isMultiple ? "multiple" : "single"}>
            {isMultiple ? <CheckSquareIcon size={14} /> : <RadioIcon size={14} />}
            {isMultiple ? "მრავალარჩევიანი" : "ერთარჩევიანი"}
          </S.Badge> */}
          {q.categories?.map((cat) => (
            <S.Badge key={cat.id} variant="category">
              <TagIcon size={14} /> {cat.name}
            </S.Badge>
          ))}
          {q.endDate && <CountdownBadge endDate={q.endDate} />}
          {hasVoted && (
            <S.Badge variant="single" style={{ marginTop: "8px", display: "inline-flex" }}>
              <CheckCircleIcon size={14} />  ხმა მიცემულია
            </S.Badge>
          )}
        </S.CardTopContent>
      </S.CardTop>

      {!isShowingResults ? (
        /* VOTING MODE */
        <>
          <S.OptionsList>
            {q.answers?.map((ans) => {
              const selected = chosenIds.includes(ans.id);
              return (
                <S.OptionItem key={ans.id} selected={selected} onClick={() => onSelectOption(ans.id, isMultiple)}>
                  {isMultiple ? (
                    <CheckSquareIcon
                      size={20}
                      style={{ marginRight: 14, opacity: selected ? 1 : 0.35 }}
                    />
                  ) : (
                    <RadioIcon
                      size={20}
                      style={{ marginRight: 14, opacity: selected ? 1 : 0.35 }}
                    />
                  )}
                  <S.OptionText>{ans.text}</S.OptionText>
                </S.OptionItem>
              );
            })}
          </S.OptionsList>

          <S.CardFooter>
            <S.CardFooterActions>
              <S.ShareButton
                type="button"
                onClick={handleShareToFacebook}
                aria-label="გაზიარება Facebook-ზე"
                title="გაზიარება Facebook-ზე"
              >
                <FacebookIcon size={22} />
              </S.ShareButton>

              <S.ShareButton
                type="button"
                onClick={handleCopyLink}
                aria-label="ბმულის კოპირება"
                title="ბმულის კოპირება"
              >
                <LinkIcon size={20} />
              </S.ShareButton>

              <S.FavoriteButton
                type="button"
                active={isFavorite}
                disabled={favoriting}
                onClick={onToggleFavorite}
                aria-label={isFavorite ? "წაშლა ფავორიტებიდან" : "დამატება ფავორიტებში"}
                title={isFavorite ? "წაშლა ფავორიტებიდან" : "დამატება ფავორიტებში"}
              >
                <StarIcon size={22} filled={isFavorite} />
              </S.FavoriteButton>
            </S.CardFooterActions>

            <S.ActionButton variant="primary" onClick={onVote} disabled={submitting}>
              <BallotIcon size={16} /> {submitting ? "იგზავნება..." : "ხმის მიცემა"}
            </S.ActionButton>
          </S.CardFooter>
        </>
      ) : (
        /* RESULTS MODE */
        <>
          <S.ResultsContainer>{renderResultsDetails(false)}</S.ResultsContainer>

          <S.CardFooter>
            {hasVoted ? (
              <>
                <S.CardFooterActions>
                  <S.ShareButton
                    type="button"
                    onClick={handleShareToFacebook}
                    aria-label="გაზიარება Facebook-ზე"
                    title="გაზიარება Facebook-ზე"
                  >
                    <FacebookIcon size={22} />
                  </S.ShareButton>

                  <S.ShareButton
                    type="button"
                    onClick={handleCopyLink}
                    aria-label="ბმულის კოპირება"
                    title="ბმულის კოპირება"
                  >
                    <LinkIcon size={20} />
                  </S.ShareButton>

                  <S.FavoriteButton
                    type="button"
                    active={isFavorite}
                    disabled={favoriting}
                    onClick={onToggleFavorite}
                    aria-label={isFavorite ? "წაშლა ფავორიტებიდან" : "დამატება ფავორიტებში"}
                    title={isFavorite ? "წაშლა ფავორიტებიდან" : "დამატება ფავორიტებში"}
                  >
                    <StarIcon size={22} filled={isFavorite} />
                  </S.FavoriteButton>
                </S.CardFooterActions>

                <S.ActionButton variant="outline" onClick={() => setDetailsOpen(true)}>
                  <ChartIcon size={16} /> დეტალები
                </S.ActionButton>
              </>
            ) : (
              <S.ActionButton variant="outline" onClick={onToggleResults}>
                <UndoIcon size={16} /> ხმის მიცემის ფორმაზე დაბრუნება
              </S.ActionButton>
            )}
          </S.CardFooter>
        </>
      )}

      {detailsOpen && (
        <S.DetailsOverlay onClick={() => setDetailsOpen(false)}>
          <S.DetailsModal onClick={(e) => e.stopPropagation()}>
            <S.DetailsModalHeader>
              <S.DetailsModalTitle>დეტალები</S.DetailsModalTitle>
              <S.DetailsCloseButton onClick={() => setDetailsOpen(false)} aria-label="დახურვა">
                <CloseIcon size={16} />
              </S.DetailsCloseButton>
            </S.DetailsModalHeader>

            <S.DetailsBody>{renderResultsDetails(true)}</S.DetailsBody>
          </S.DetailsModal>
        </S.DetailsOverlay>
      )}
    </S.QuestionCardWrapper>
  );
};

export default QuestionCard;
