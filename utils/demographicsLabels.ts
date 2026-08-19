import { AgeGroupKey, GenderKey } from "@/types/demographics";

// დემოგრაფიული breakdown-ის (სქესი/ასაკი) ქართული ლეიბლები და
// chart-ებისთვის საჭირო ფიქსირებული, ერთმანეთისგან განსხვავებული ფერები.

export const GENDER_LABELS: Record<GenderKey, string> = {
  male: "კაცი",
  female: "ქალი",
};

export const GENDER_COLORS: Record<GenderKey, string> = {
  male: "#1877F2",
  female: "#F43E50",
};

export const AGE_GROUP_LABELS: Record<AgeGroupKey, string> = {
  under_18: "18-მდე",
  "18_24": "18-24",
  "25_34": "25-34",
  "35_44": "35-44",
  "45_54": "45-54",
  "55_64": "55-64",
  "65_plus": "65+",
};
