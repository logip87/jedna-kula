import type { Session } from "../../domain";

export function canUndoLastThrow(session: Session): boolean {
  const trainingPlan = session.trainingPlan;
  const blocks = trainingPlan?.blocks;
  const currentBlock = trainingPlan?.blocks[trainingPlan.index];
  const lastThrowIndex = session.results.length - 1;
  const lastThrowBlock = blocks?.find(
    (block) =>
      block.kind === "throws" &&
      lastThrowIndex >= block.start &&
      lastThrowIndex < block.end,
  );
  return (
    session.results.length > 0 &&
    !session.completedAt &&
    session.kind !== "test" &&
    !session.mastery &&
    !session.challenge &&
    !session.coach?.oneChance &&
    currentBlock?.title !== "Krótki test końcowy" &&
    lastThrowBlock?.title !== "Krótki test końcowy"
  );
}

export function undoLastThrow(session: Session): Session {
  if (!canUndoLastThrow(session)) return session;
  const results = session.results.slice(0, -1);
  const index = session.trainingPlan?.blocks.findIndex(
    (block) =>
      block.kind === "throws" &&
      results.length >= block.start &&
      results.length < block.end,
  );
  return {
    ...session,
    situationChoice: undefined,
    results,
    score: results.reduce((sum, attempt) => sum + attempt.points, 0),
    ...(session.trainingPlan && index !== undefined && index >= 0
      ? { trainingPlan: { ...session.trainingPlan, index } }
      : {}),
  };
}
