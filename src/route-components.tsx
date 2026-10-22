import { lazy } from "react";

export const LessonList = lazy(() =>
  import("./features/mental/Lessons").then((module) => ({
    default: module.LessonList,
  })),
);
export const Feedback = lazy(() =>
  import("./features/feedback/Feedback").then((module) => ({
    default: module.Feedback,
  })),
);
export const MatchMode = lazy(() =>
  import("./features/situations/Situations").then((module) => ({
    default: module.MatchMode,
  })),
);
export const BossTests = lazy(() =>
  import("./features/situations/Situations").then((module) => ({
    default: module.BossTests,
  })),
);
export const ExtraChallenges = lazy(() =>
  import("./features/situations/Situations").then((module) => ({
    default: module.ExtraChallenges,
  })),
);
export const Development = lazy(() =>
  import("./features/development/Development").then((module) => ({
    default: module.Development,
  })),
);
export const Week = lazy(() =>
  import("./features/development/Development").then((module) => ({
    default: module.Week,
  })),
);
export const Goals = lazy(() =>
  import("./features/development/Development").then((module) => ({
    default: module.Goals,
  })),
);
export const Mastery = lazy(() =>
  import("./features/development/Development").then((module) => ({
    default: module.Mastery,
  })),
);
export const PracticeLibrary = lazy(() =>
  import("./features/development/Development").then((module) => ({
    default: module.PracticeLibrary,
  })),
);
export const PracticeActive = lazy(() =>
  import("./features/development/Development").then((module) => ({
    default: module.PracticeActive,
  })),
);
export const Competition = lazy(() =>
  import("./features/development/Development").then((module) => ({
    default: module.Competition,
  })),
);
export const RulesHome = lazy(() =>
  import("./features/rules/Rules").then((module) => ({
    default: module.RulesHome,
  })),
);
export const RulesCategory = lazy(() =>
  import("./features/rules/Rules").then((module) => ({
    default: module.RulesCategory,
  })),
);
export const RuleDetail = lazy(() =>
  import("./features/rules/Rules").then((module) => ({
    default: module.RuleDetail,
  })),
);
export const QuickHelp = lazy(() =>
  import("./features/rules/Rules").then((module) => ({
    default: module.QuickHelp,
  })),
);
export const RulesQuiz = lazy(() =>
  import("./features/rules/Rules").then((module) => ({
    default: module.RulesQuiz,
  })),
);
export const AdventureHome = lazy(() =>
  import("./features/adventure/Adventure").then((module) => ({
    default: module.AdventureHome,
  })),
);
export const MissionPath = lazy(() =>
  import("./features/adventure/Adventure").then((module) => ({
    default: module.MissionPath,
  })),
);
export const MissionDetail = lazy(() =>
  import("./features/adventure/Adventure").then((module) => ({
    default: module.MissionDetail,
  })),
);
export const NextTraining = lazy(() =>
  import("./features/adventure/Adventure").then((module) => ({
    default: module.NextTraining,
  })),
);
export const ErrorMap = lazy(() =>
  import("./features/adventure/Adventure").then((module) => ({
    default: module.ErrorMap,
  })),
);
export const Tactics = lazy(() =>
  import("./features/adventure/Adventure").then((module) => ({
    default: module.Tactics,
  })),
);
export const PrecisionTraining = lazy(() =>
  import("./features/adventure/Precision").then((module) => ({
    default: module.PrecisionTraining,
  })),
);
export const DuelTraining = lazy(() =>
  import("./features/adventure/Duel").then((module) => ({
    default: module.DuelTraining,
  })),
);
export const Generator = lazy(() =>
  import("./features/coaching/Coaching").then((module) => ({
    default: module.Generator,
  })),
);
export const Weaknesses = lazy(() =>
  import("./features/coaching/Coaching").then((module) => ({
    default: module.Weaknesses,
  })),
);
export const SelfChallenge = lazy(() =>
  import("./features/coaching/Coaching").then((module) => ({
    default: module.SelfChallenge,
  })),
);
export const Start = lazy(() =>
  import("./screens").then((module) => ({ default: module.Start })),
);
export const Library = lazy(() =>
  import("./screens").then((module) => ({ default: module.Library })),
);
export const Detail = lazy(() =>
  import("./screens").then((module) => ({ default: module.Detail })),
);
export const Active = lazy(() =>
  import("./screens").then((module) => ({ default: module.Active })),
);
export const Summary = lazy(() =>
  import("./screens").then((module) => ({ default: module.Summary })),
);
export const HistoryPage = lazy(() =>
  import("./screens").then((module) => ({ default: module.HistoryPage })),
);
export const HistoryDetail = lazy(() =>
  import("./screens").then((module) => ({ default: module.HistoryDetail })),
);
export const LessonDetail = lazy(() =>
  import("./screens").then((module) => ({ default: module.LessonDetail })),
);
export const ProgressPage = lazy(() =>
  import("./screens").then((module) => ({ default: module.ProgressPage })),
);
export const Profile = lazy(() =>
  import("./screens").then((module) => ({ default: module.Profile })),
);
export const More = lazy(() =>
  import("./screens").then((module) => ({ default: module.More })),
);
export const SettingsPage = lazy(() =>
  import("./screens").then((module) => ({ default: module.SettingsPage })),
);
export const Missing = lazy(() =>
  import("./screens").then((module) => ({ default: module.Missing })),
);
