export interface Source {
  name: string;
  date: string;
  file: string;
  url: string;
}
export interface Rule {
  id: string;
  title: string;
  shortAnswer: string;
  explanation: string;
  action: string;
  category: string;
  sourceId: string;
  sourceDocument: string;
  sourceArticle: string;
  sourceDate: string;
  competitionSpecific: boolean;
  tags: string[];
  badge?: "Najczęstszy błąd" | "Warto wiedzieć" | "Na turnieju";
  related?: string[];
  additionalSources?: { sourceId: string; article: string }[];
  verification?: "REQUIRES_RULE_VERIFICATION";
}
export interface QuizQuestion {
  id: string;
  situation: string;
  options: string[];
  correct: number;
  ruleId: string;
  explanation: string;
}
export interface RulesQuizProgress {
  version: string;
  ids: string[];
  answers: Record<string, number>;
  startedAt: string;
  currentIndex: number;
}
export const verifiedOn = "2026-10-07";
export const contentVersion = "2026-10-07.1";
export const normalize = (text: string) =>
  text
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l");
export function jackOutResult(remaining: "both" | "one" | "none", count = 0) {
  return remaining === "one"
    ? {
        points: count,
        message: `Drużyna z kulami zdobywa ${count} pkt — po jednym za każdą niewyrzuconą kulę.`,
      }
    : { points: 0, message: "Rozgrywka anulowana. Nikt nie zdobywa punktów." };
}
