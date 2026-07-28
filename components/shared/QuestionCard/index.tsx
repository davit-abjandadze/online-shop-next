import React, { useEffect, useState } from "react";
import { Question } from "@/API_Client/client/models";
import { ParsedResult } from "@/utils/parseQuestionResults";
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
    return <S.Badge variant="expired">⏳ ვადა გასულია</S.Badge>;
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <S.Badge variant="countdown">
      ⏳ {days > 0 && `დარჩენილია ${days}დღე და `}{pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </S.Badge>
  );
};

export interface QuestionCardProps {
  question: Question;
  hasVoted: boolean;
  isShowingResults: boolean;
  results?: ParsedResult;
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
  chosenIds,
  submitting,
  isFavorite,
  favoriting,
  onSelectOption,
  onVote,
  onToggleResults,
  onToggleFavorite,
}) => {
  const isMultiple = q.type === "multiple";
  const maxPct = results ? Math.max(...Object.values(results.answerPercentages), 0) : 0;

  return (
    <S.QuestionCardWrapper id={`question-${q.id}`}>
      <S.CardTop>
        <div>
          <S.QuestionText>{q.text}</S.QuestionText>
          <S.Badge variant={isMultiple ? "multiple" : "single"}>
            {isMultiple ? "☑️ მრავალარჩევიანი" : "🔘 ერთარჩევიანი"}
          </S.Badge>
          {q.category && <S.Badge variant="category">🏷️ {q.category.name}</S.Badge>}
          {q.endDate && <CountdownBadge endDate={q.endDate} />}
          {hasVoted && (
            <S.Badge variant="single" style={{ marginTop: "8px", display: "inline-block" }}>
              ✅ თქვენ უკვე მიეცით ხმა
            </S.Badge>
          )}
        </div>

        <S.FavoriteButton
          type="button"
          active={isFavorite}
          disabled={favoriting}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "წაშლა ფავორიტებიდან" : "დამატება ფავორიტებში"}
          title={isFavorite ? "წაშლა ფავორიტებიდან" : "დამატება ფავორიტებში"}
        >
          {isFavorite ? "⭐" : "☆"}
        </S.FavoriteButton>
      </S.CardTop>

      {!isShowingResults ? (
        /* VOTING MODE */
        <>
          <S.OptionsList>
            {q.answers?.map((ans) => {
              const selected = chosenIds.includes(ans.id);
              return (
                <S.OptionItem key={ans.id} selected={selected} onClick={() => onSelectOption(ans.id, isMultiple)}>
                  <S.CheckIndicator selected={selected} type={isMultiple ? "multiple" : "single"} />
                  <S.OptionText>{ans.text}</S.OptionText>
                </S.OptionItem>
              );
            })}
          </S.OptionsList>

          <S.CardFooter>
            <S.ActionButton variant="primary" onClick={onVote} disabled={submitting}>
              {submitting ? "იგზავნება..." : "🗳️ ხმის მიცემა"}
            </S.ActionButton>

            <S.ActionButton variant="secondary" onClick={onToggleResults}>
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
            {hasVoted ? (
              <S.ActionButton variant="outline" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                🔒 ხმის შეცვლა შეუძლებელია
              </S.ActionButton>
            ) : (
              <S.ActionButton variant="outline" onClick={onToggleResults}>
                ↩️ ხმის მიცემის ფორმაზე დაბრუნება
              </S.ActionButton>
            )}
          </S.CardFooter>
        </>
      )}
    </S.QuestionCardWrapper>
  );
};

export default QuestionCard;
