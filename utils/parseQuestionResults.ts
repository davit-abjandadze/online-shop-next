import { Question } from "@/API_Client/client/models";

export interface ParsedResult {
  totalUsers: number;
  answerCounts: Record<number, number>;
  answerPercentages: Record<number, number>;
}

// Parse backend results into total votes and percentage breakdown
export const parseResultsData = (data: any, question: Question): ParsedResult => {
  const answerCounts: Record<number, number> = {};
  const answerPercentages: Record<number, number> = {};
  (question.answers || []).forEach((ans) => {
    answerCounts[ans.id] = 0;
    answerPercentages[ans.id] = 0;
  });

  let totalUsers = 0;

  if (!data) {
    return { totalUsers: 0, answerCounts, answerPercentages };
  }

  if (Array.isArray(data)) {
    // Count unique users (a user may have multiple UserAnswer rows for multiple-choice)
    const uniqueUserIds = new Set<number | string>();
    data.forEach((item: any) => {
      // Count answer occurrences
      const aId = item.answer?.id ?? item.answerId;
      if (aId != null && answerCounts[aId] !== undefined) {
        answerCounts[aId] += 1;
      }
      // Track unique users
      const uId = item.user?.id ?? item.userId;
      if (uId != null) uniqueUserIds.add(uId);
    });
    // totalUsers = unique voters; fallback to array length
    totalUsers = uniqueUserIds.size > 0 ? uniqueUserIds.size : data.length;
  } else if (typeof data === "object") {
    totalUsers = data.totalUsers || data.totalVotes || data.total || 0;
    if (Array.isArray(data.answers)) {
      data.answers.forEach((ans: any) => {
        const aId = ans.id || ans.answerId;
        if (aId != null) {
          answerCounts[aId] = ans.count ?? ans.votes ?? 0;
        }
      });
    } else if (data.answerCounts && typeof data.answerCounts === "object") {
      Object.entries(data.answerCounts).forEach(([aIdStr, count]) => {
        const aId = Number(aIdStr);
        if (answerCounts[aId] !== undefined) {
          answerCounts[aId] = Number(count);
        }
      });
    } else if (data.results && Array.isArray(data.results)) {
      data.results.forEach((r: any) => {
        const aId = r.answerId ?? r.answer?.id ?? r.id;
        if (aId != null) {
          answerCounts[aId] = r.count ?? r.votes ?? 0;
        }
      });
    }
  }

  // Calculate percentages based on total answer submissions (sum of counts)
  let totalVotesCount = 0;
  Object.values(answerCounts).forEach((c) => (totalVotesCount += c));

  // Use unique users if available, else sum of votes as base for %
  const percentageBase = totalUsers > 0 ? totalUsers : totalVotesCount;
  const divisor = percentageBase > 0 ? percentageBase : 1;

  (question.answers || []).forEach((ans) => {
    const cnt = answerCounts[ans.id] || 0;
    answerPercentages[ans.id] = percentageBase > 0 ? Math.min(100, Math.round((cnt / divisor) * 100)) : 0;
  });

  return {
    totalUsers: totalUsers > 0 ? totalUsers : totalVotesCount,
    answerCounts,
    answerPercentages,
  };
};
