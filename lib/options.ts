export type Opt = { value: string; label: string };

export const PARTY: Opt[] = [
  { value: "democrat", label: "Democrat" },
  { value: "lean_democrat", label: "Independent, lean Democrat" },
  { value: "independent", label: "Independent, no lean" },
  { value: "lean_republican", label: "Independent, lean Republican" },
  { value: "republican", label: "Republican" },
  { value: "other", label: "Something else" },
  { value: "prefer_not", label: "Prefer not to say" },
];

export const AGE: Opt[] = [
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45-54", label: "45–54" },
  { value: "55-64", label: "55–64" },
  { value: "65+", label: "65 or older" },
  { value: "prefer_not", label: "Prefer not to say" },
];

export const GENDER: Opt[] = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "nonbinary", label: "Nonbinary" },
  { value: "self_describe", label: "Another identity" },
  { value: "prefer_not", label: "Prefer not to say" },
];

// Multi-select, categories follow the U.S. Census 2024 combined question.
export const RACE: Opt[] = [
  { value: "american_indian_alaska_native", label: "American Indian or Alaska Native" },
  { value: "asian", label: "Asian" },
  { value: "black", label: "Black or African American" },
  { value: "hispanic_latino", label: "Hispanic or Latino" },
  { value: "middle_eastern_north_african", label: "Middle Eastern or North African" },
  { value: "native_hawaiian_pacific_islander", label: "Native Hawaiian or Pacific Islander" },
  { value: "white", label: "White" },
  { value: "other", label: "Another race or ethnicity" },
  { value: "prefer_not", label: "Prefer not to say" },
];

export const ECON: Opt[] = [
  { value: "low", label: "Lower class" },
  { value: "middle_low", label: "Lower-middle class" },
  { value: "middle_upper", label: "Upper-middle class" },
  { value: "upper", label: "Upper class" },
  { value: "prefer_not", label: "Prefer not to say" },
];

export const EDUCATION: Opt[] = [
  { value: "less_than_hs", label: "Less than high school" },
  { value: "hs", label: "High school diploma or GED" },
  { value: "some_college", label: "Some college, no degree" },
  { value: "associates", label: "Associate degree" },
  { value: "bachelors", label: "Bachelor's degree" },
  { value: "graduate", label: "Graduate or professional degree" },
  { value: "prefer_not", label: "Prefer not to say" },
];

export const LIKERT: Opt[] = [
  { value: "1", label: "Strongly disagree" },
  { value: "2", label: "Somewhat disagree" },
  { value: "3", label: "Neither" },
  { value: "4", label: "Somewhat agree" },
  { value: "5", label: "Strongly agree" },
];
