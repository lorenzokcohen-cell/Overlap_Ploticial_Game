// Overlap Political Typology
// Original questions and categories. Two axes, 8 forced-choice questions each:
//   econ:   negative = wants a larger role for government, positive = smaller role
//   social: negative = open to change,                    positive = favors tradition
// Each option carries its own score, and the "left" option is not always listed first.

export type TQ = {
  id: string;
  axis: "econ" | "social";
  a: { text: string; score: -1 | 1 };
  b: { text: string; score: -1 | 1 };
};

export const QUESTIONS: TQ[] = [
  { id: "e1", axis: "econ",
    a: { text: "When the country faces a big problem, government should step in and fix it.", score: -1 },
    b: { text: "Most problems are better solved by businesses, charities and individuals than by government.", score: 1 } },
  { id: "s1", axis: "social",
    a: { text: "Society works best when it holds on to long-standing traditions.", score: 1 },
    b: { text: "Society works best when it stays open to new ways of living.", score: -1 } },
  { id: "e2", axis: "econ",
    a: { text: "Rules on business usually do more harm than good.", score: 1 },
    b: { text: "Rules on business are usually needed to protect the public.", score: -1 } },
  { id: "s2", axis: "social",
    a: { text: "Newcomers from around the world mostly strengthen the country.", score: -1 },
    b: { text: "The country should bring in fewer immigrants than it does now.", score: 1 } },
  { id: "e3", axis: "econ",
    a: { text: "Government should make sure everyone has health coverage.", score: -1 },
    b: { text: "Health coverage is mainly each person's own responsibility.", score: 1 } },
  { id: "s3", axis: "social",
    a: { text: "Religious values should have a stronger voice in public life.", score: 1 },
    b: { text: "Religion should be kept separate from government decisions.", score: -1 } },
  { id: "e4", axis: "econ",
    a: { text: "Lower taxes for everyone are the best way to grow the economy.", score: 1 },
    b: { text: "The wealthy and large corporations should pay a larger share of taxes.", score: -1 } },
  { id: "s4", axis: "social",
    a: { text: "The justice system needs major changes to treat people fairly.", score: -1 },
    b: { text: "We should back the police and enforce the law more strictly.", score: 1 } },
  { id: "e5", axis: "econ",
    a: { text: "Most people who work hard can get ahead.", score: 1 },
    b: { text: "Hard work is no guarantee of success for most people.", score: -1 } },
  { id: "s5", axis: "social",
    a: { text: "Society is better off when people make marriage and children a priority.", score: 1 },
    b: { text: "Society is just as well off when people have other priorities.", score: -1 } },
  { id: "e6", axis: "econ",
    a: { text: "Strong labor unions help workers get a fair deal.", score: -1 },
    b: { text: "Labor unions often hold back both businesses and workers.", score: 1 } },
  { id: "s6", axis: "social",
    a: { text: "Gun rights should be protected, not further restricted.", score: 1 },
    b: { text: "Stricter gun laws would make the country safer.", score: -1 } },
  { id: "e7", axis: "econ",
    a: { text: "I'd rather have a smaller government that provides fewer services.", score: 1 },
    b: { text: "I'd rather have a bigger government that provides more services.", score: -1 } },
  { id: "s7", axis: "social",
    a: { text: "The country still has work to do to give people of all races equal rights.", score: -1 },
    b: { text: "The country has mostly achieved equal rights, and focusing on race now divides us.", score: 1 } },
  { id: "e8", axis: "econ",
    a: { text: "Government should push companies toward cleaner energy, even if it costs more.", score: -1 },
    b: { text: "Markets, not mandates, should set the pace of any energy transition.", score: 1 } },
  { id: "s8", axis: "social",
    a: { text: "Parents should have the final say over how schools teach sensitive topics.", score: 1 },
    b: { text: "Schools should teach hard parts of history even when some families object.", score: -1 } },
];

export type Category = {
  id: string;
  name: string;
  summary: string;
  values: string;
  sharesWith: string;   // where this group tends to overlap with people across the aisle
};

// 3 × 3 grid: econ (more gov / mixed / less gov) × social (change / mixed / tradition)
export const CATEGORIES: Record<string, Category> = {
  "L-C": { id: "L-C", name: "Progressive Reformers",
    summary: "You want an active government and a society that keeps changing.",
    values: "Expanding the safety net, reforming institutions, and widening who gets a fair shot.",
    sharesWith: "77% of Republicans also want to bar members of Congress from trading individual stocks (Economist/YouGov, 2026)." },
  "L-M": { id: "L-M", name: "Kitchen-Table Liberals",
    summary: "You favor government help on economic issues and take social questions case by case.",
    values: "Affordable health care, fair wages, and practical solutions over ideology.",
    sharesWith: "68% of Republicans also want more government regulation of prescription drug prices (KFF, 2026)." },
  "L-T": { id: "L-T", name: "Working-Class Traditionalists",
    summary: "You want government on the side of working people, and you value faith, family and community.",
    values: "Good jobs, strong families, and a fair deal from the economy.",
    sharesWith: "You sit between the parties: your economic views often line up with Democrats and your social views with Republicans." },
  "C-C": { id: "C-C", name: "Socially Liberal Pragmatists",
    summary: "You are open to social change and judge economic policy on whether it works.",
    values: "Personal freedom, evidence over slogans, and a government that's effective rather than big or small.",
    sharesWith: "Democrats and Republicans call free speech vital to democracy at nearly identical rates, 87% and 86% (AP-NORC, 2025)." },
  "C-M": { id: "C-M", name: "Center Bridge-Builders",
    summary: "Your views don't sort neatly into either party's package.",
    values: "Compromise, stability, and taking each issue on its merits.",
    sharesWith: "On ideas like congressional term limits, both parties agree by wide margins: 86% of Democrats and 90% of Republicans (Pew, 2023)." },
  "C-T": { id: "C-T", name: "Main Street Traditionalists",
    summary: "You value tradition and community and take a middle path on economics.",
    values: "Order, local institutions, and steady rather than sweeping change.",
    sharesWith: "83% of Democrats and 77% of Republicans say Social Security benefits should not be cut (Pew, 2024)." },
  "R-C": { id: "R-C", name: "Libertarian Independents",
    summary: "You want less government in both the economy and personal life.",
    values: "Individual liberty, free markets, and skepticism of concentrated power.",
    sharesWith: "80% of Democrats also want to bar members of Congress from trading individual stocks (Economist/YouGov, 2026)." },
  "R-M": { id: "R-M", name: "Market Conservatives",
    summary: "You favor free markets and limited government, with moderate social views.",
    values: "Economic growth, fiscal responsibility, and opportunity through enterprise.",
    sharesWith: "86% of Democrats also support term limits for members of Congress (Pew, 2023)." },
  "R-T": { id: "R-T", name: "Heritage Conservatives",
    summary: "You favor limited government and strongly value tradition, faith and national identity.",
    values: "Family, faith, patriotism, and a government that stays within its limits.",
    sharesWith: "83% of Democrats also want social media companies to require parental consent for minors (Pew, 2026)." },
};

export function scoreTypology(answers: Record<string, "a" | "b">) {
  let econ = 0, social = 0;
  for (const q of QUESTIONS) {
    const pick = answers[q.id];
    if (!pick) continue;
    const s = q[pick].score;
    if (q.axis === "econ") econ += s; else social += s;
  }
  const band = (v: number, lo: string, mid: string, hi: string) => (v <= -3 ? lo : v >= 3 ? hi : mid);
  const key = band(econ, "L", "C", "R") + "-" + band(social, "C", "M", "T");
  return { econ, social, category: CATEGORIES[key] };
}
