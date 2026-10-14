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
