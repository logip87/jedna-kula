import type { Difficulty, Mode } from "../../domain";
import type { Surface } from "../adventure/model";
export type Audience = "junior" | "beginner" | "athlete";
export type SkillId =
  "point" | "shoot" | "lob" | "tactics" | "mental" | "regularity";
export interface SkillScore {
  id: SkillId;
  name: string;
  level: number | null;
  evidence: string;
  rate: number | null;
  samples: number;
}
export interface XPEvent {
  id: string;
  kind:
    | "session"
    | "mental"
    | "physical"
    | "lesson"
    | "quiz"
    | "week"
    | "challenge";
  points: number;
  earnedAt: string;
}
export interface WeeklyChallenge {
  week: string;
  kind: "point-hits" | "shoot-attempts" | "distances" | "routine";
  target: number;
  distance?: number;
}
export interface TrainingGoal {
  sourceSessionId?: string;
  id: string;
  kind: "accuracy" | "routine";
  createdAt: string;
  target: number;
  baseline: number;
  mode?: Mode;
  distance?: number;
  conditionKey?: string;
  drillId?: string;
  difficulty?: Difficulty;
  targetSize?: number;
  boundary?: number;
  surface?: Surface;
}
export interface MentalCheckin {
  before: number;
  after?: number;
}
export interface PracticeSession {
  id: string;
  moduleId: string;
  kind: "mental" | "physical";
  audience: "junior" | "adult";
  minutes: 2 | 5 | 10;
  startedAt: string;
  completedAt?: string;
  step: number;
  checkin?: MentalCheckin;
}
export interface CompetitionPlan {
  date: string;
}
export interface CoachingState {
  weeklyGoals: { week: string; sessions: number }[];
  weeklyChallenges?: WeeklyChallenge[];
  goals?: TrainingGoal[];
  xpEvents?: XPEvent[];
  practiceDraft?: PracticeSession;
  practiceHistory?: PracticeSession[];
  competition?: CompetitionPlan;
}
