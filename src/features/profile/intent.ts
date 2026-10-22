import type { Player } from "../../domain";

export const playingStyles = {
  starting: "Dopiero zaczynam",
  recreational: "Gram rekreacyjnie",
  club: "Gram regularnie w klubie",
  tournament: "Startuję w turniejach",
  focused: "Trenuję świadomie i chcę poprawić konkretne elementy",
} as const;
export const trainingGoals = {
  basics: "Nauczyć się podstaw",
  regularity: "Zacząć regularnie trenować",
  point: "Poprawić puentę",
  shoot: "Poprawić strzał",
  decisions: "Poprawić decyzje meczowe",
  pressure: "Lepiej radzić sobie z presją",
  competition: "Przygotować się do turniejów",
  next: "Wejść poziom wyżej",
} as const;
export type PlayingStyle = keyof typeof playingStyles;
export type TrainingGoal = keyof typeof trainingGoals;
export const productMessage =
  "Jedna Kula pomaga graczom pétanque wejść poziom wyżej: uporządkować trening, zauważyć słabe strony i wybrać kolejny krok.";

export function goalStep(goal?: TrainingGoal) {
  switch (goal) {
    case "basics":
      return {
        to: "/adventure/missions",
        title: "Poznaj podstawy krok po kroku",
        reason: "Misje pomagają przejść od prostych prób do pełnej serii.",
      };
    case "point":
      return {
        to: "/training/point-basic",
        title: "Popracuj nad puentą",
        reason:
          "Powtarzaj jeden wariant i porównuj końcową odległość od świnki.",
      };
    case "shoot":
      return {
        to: "/training/shoot-basic",
        title: "Popracuj nad strzałem",
        reason:
          "Zapisuj trafienia na jednym dystansie, aby sprawdzić powtarzalność.",
      };
    case "decisions":
      return {
        to: "/adventure/tactics",
        title: "Przećwicz decyzję meczową",
        reason:
          "Policz kule, uwzględnij wynik i porównaj korzyść, ryzyko oraz alternatywę.",
      };
    case "pressure":
      return {
        to: "/lessons/routine",
        title: "Wypróbuj rutynę przed rzutem",
        reason: "Krótki, stały plan pomaga wrócić do zadania po błędzie.",
      };
    case "competition":
      return {
        to: "/coach/competition",
        title: "Zaplanuj przygotowanie do turnieju",
        reason:
          "Wybierz datę startu i ułóż spokojną pracę nad techniką i rutyną.",
      };
    case "regularity":
      return {
        to: "/coach/week",
        title: "Ustal rytm tygodnia",
        reason: "Wybierz liczbę treningów, którą możesz utrzymać.",
      };
    default:
      return {
        to: "/coach/weaknesses",
        title: "Znajdź element do poprawy",
        reason:
          "Po dwóch porównywalnych sesjach łatwiej wybrać zadanie na podstawie wyników.",
      };
  }
}
export function initialLevel(style: PlayingStyle): Player["level"] {
  return style === "starting" || style === "recreational"
    ? "beginner"
    : style === "tournament"
      ? "tournament"
      : "intermediate";
}
