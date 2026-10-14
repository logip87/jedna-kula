import type { State } from "../../domain";
import { drills } from "../../data";
import { mentalLessons } from "./catalog";

export function mentalCueText(lessonId?: string) {
  return mentalLessons.find((lesson) => lesson.id === lessonId)?.phrase;
}

// Included in the same transaction as the new draft: a failed write cannot
// consume the pending cue, and resuming a draft never changes its focus.
export function attachPendingMentalCue(previous: State, next: State): State {
  const draft = next.draft;
  if (!draft || previous.draft?.id === draft.id) return next;
  const lessonId = previous.coaching?.pendingMentalCueLessonId;
  const eligible =
    draft.kind !== "test" &&
    !draft.mastery &&
    !draft.challenge &&
    !drills.find((d) => d.id === draft.drillId)?.test;
  const useCue = eligible && !!mentalCueText(lessonId);
  return {
    ...next,
    draft: { ...draft, mentalCueLessonId: useCue ? lessonId : undefined },
    ...(useCue
      ? {
          coaching: {
            weeklyGoals: [],
            ...next.coaching,
            pendingMentalCueLessonId: undefined,
          },
        }
      : {}),
  };
}
