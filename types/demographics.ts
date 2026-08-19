// GET /stats/demographics და GET /stats/questions/:id/demographics
// endpoint-ების response ტიპები. ბექის OpenAPI სქემაში ეს response-ები
// ჯერჯერობით `void`-ადაა მონიშნული, ამიტომ ტიპები ხელით არის აღწერილი
// ბექის დოკუმენტაციის მიხედვით (იხ. task-ის აღწერა).

export type GenderKey = "male" | "female";

export type AgeGroupKey =
  | "under_18"
  | "18_24"
  | "25_34"
  | "35_44"
  | "45_54"
  | "55_64"
  | "65_plus";

export interface GenderStat {
  gender: GenderKey;
  votes: number;
}

export interface AgeGroupStat {
  ageGroup: AgeGroupKey;
  votes: number;
}

export interface DemographicsBreakdown {
  byGender: GenderStat[];
  byAge: AgeGroupStat[];
}

// GET /stats/demographics
export interface GlobalDemographics extends DemographicsBreakdown {
  totalVotes: number;
}

// GET /stats/questions/:id/demographics -> answers[]
export interface AnswerDemographics extends DemographicsBreakdown {
  id: number;
  text: string;
  votes: number;
}

// GET /stats/questions/:id/demographics
export interface QuestionDemographics extends DemographicsBreakdown {
  questionId: number;
  text: string;
  totalVotes: number;
  answers: AnswerDemographics[];
}
