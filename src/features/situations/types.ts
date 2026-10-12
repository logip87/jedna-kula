export interface SessionChallenge {
  kind: "boss" | "daily" | "ladder" | "pressure";
  id: string;
  version: 1;
}
export interface MatchEnd {
  scenarioId: string;
  choice: number;
  ownPoints: number;
  opponentPoints: number;
}
export interface MatchTraining {
  id: string;
  version: 1;
  startedAt: string;
  completedAt?: string;
  initialScore: [number, number];
  scenarios: string[];
  choice?: number;
  ends: MatchEnd[];
}
export interface SituationsState {
  matchDraft?: MatchTraining;
  matchHistory?: MatchTraining[];
  dailyResults?: { day: string; sessionId: string; hit: boolean }[];
}
