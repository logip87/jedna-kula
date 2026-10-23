// Minimum hit rate in each of the three comparable sessions.
export function progressionThreshold(distance: number) {
  if (distance <= 6) return 80;
  if (distance === 7) return 75;
  if (distance === 8) return 70;
  return 65;
}

export const progressionSessions = 3;
export const progressionAttempts = 10;
export const progressionWindowDays = 30;
import { drills } from "../../data";
import type { State } from "../../domain";

export function maximumPracticeDistance(state: State, drillId?: string) {
  const audienceMaximum =
    (state.player?.audience ?? state.adventure?.config?.audience) === "junior"
      ? 7
      : 10;
  const distances = drills.find((d) => d.id === drillId)?.distances;
  return Math.min(
    audienceMaximum,
    distances?.length ? Math.max(...distances) : audienceMaximum,
  );
}
