import React, { useState } from "react";
import { DemographicsBreakdown as DemographicsBreakdownData } from "@/types/demographics";
import { AGE_GROUP_LABELS, GENDER_COLORS, GENDER_LABELS } from "@/utils/demographicsLabels";
import { ChevronDownIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

export interface DemographicsBreakdownProps {
  data: DemographicsBreakdownData;
  totalVotes: number;
  /** კომპაქტური ვარიანტი — თითო პასუხის ქვეშ საჩვენებლად */
  compact?: boolean;
  title?: string;
}

// სქესისა და ასაკის მიხედვით ხმების განაწილება — სქესი ერთი stacked ზოლის
// სახით (male/female), ასაკობრივი ჯგუფები კი ჩამონათვალის სახით,
// ორივე თითო-ხმის რაოდენობებით და პროცენტებით.
export const DemographicsBreakdown: React.FC<DemographicsBreakdownProps> = ({
  data,
  totalVotes,
  compact,
  title,
}) => {
  const [expanded, setExpanded] = useState(!compact);
  // ბექიდან ისტორიულად შემორჩენილი "unknown" ჩანაწერები (ძველი, ასაკის/სქესის
  // გარეშე ხმები) აქ ვფილტრავთ — ახალი მომხმარებლები ვერ ხმას მისცემენ ამის
  // შევსების გარეშე, ამიტომ ასეთი ბაკეტი აღარ უნდა გამოჩნდეს დეტალებში.
  const byGender = data.byGender.filter((g) => (g.gender as string) !== "unknown");
  const byAge = data.byAge.filter((a) => (a.ageGroup as string) !== "unknown");
  const genderTotal = byGender.reduce((sum, g) => sum + g.votes, 0);
  const ageTotal = byAge.reduce((sum, a) => sum + a.votes, 0);
  const maxAgeVotes = Math.max(...byAge.map((a) => a.votes), 0);

  if (totalVotes === 0) {
    return null;
  }

  return (
    <S.DemographicsWrapper compact={compact}>
      {compact ? (
        <S.DemographicsToggle type="button" onClick={() => setExpanded((v) => !v)}>
          <span>{title || "დემოგრაფიული ჩაშლა"}</span>
          <ChevronDownIcon size={14} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
        </S.DemographicsToggle>
      ) : (
        title && <S.DemographicsTitle>{title}</S.DemographicsTitle>
      )}

      {expanded && (
        <>
          <S.GenderStackTrack title="სქესის მიხედვით განაწილება">
            {genderTotal === 0 ? (
              <S.GenderStackSegment style={{ width: "100%" }} color="var(--ref-border-soft)" />
            ) : (
              byGender
                .filter((g) => g.votes > 0)
                .map((g) => (
                  <S.GenderStackSegment
                    key={g.gender}
                    style={{ width: `${(g.votes / genderTotal) * 100}%` }}
                    color={GENDER_COLORS[g.gender]}
                    title={`${GENDER_LABELS[g.gender]}: ${g.votes} ხმა`}
                  />
                ))
            )}
          </S.GenderStackTrack>

          <S.GenderLegend>
            {byGender.map((g) => (
              <S.GenderLegendItem key={g.gender}>
                <S.GenderLegendDot color={GENDER_COLORS[g.gender]} />
                {GENDER_LABELS[g.gender]}: {g.votes}
                {genderTotal > 0 ? ` (${Math.round((g.votes / genderTotal) * 100)}%)` : ""}
              </S.GenderLegendItem>
            ))}
          </S.GenderLegend>

          <S.AgeGroupList>
            {byAge.map((a) => (
              <S.AgeGroupRow key={a.ageGroup}>
                <S.AgeGroupLabel>{AGE_GROUP_LABELS[a.ageGroup]}</S.AgeGroupLabel>
                <S.AgeGroupBarTrack>
                  <S.AgeGroupBarFill
                    style={{ width: maxAgeVotes > 0 ? `${(a.votes / maxAgeVotes) * 100}%` : "0%" }}
                  />
                </S.AgeGroupBarTrack>
                <S.AgeGroupCount>{a.votes}</S.AgeGroupCount>
              </S.AgeGroupRow>
            ))}
          </S.AgeGroupList>
          {ageTotal === 0 && <S.DemographicsEmptyText>ასაკის მონაცემები არ არის</S.DemographicsEmptyText>}
        </>
      )}
    </S.DemographicsWrapper>
  );
};

export default DemographicsBreakdown;
