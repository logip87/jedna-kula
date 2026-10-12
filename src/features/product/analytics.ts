export const eventNames = [
  "app_open",
  "today_view",
  "recommended_training_start",
  "recommended_training_complete",
  "manual_training_start",
  "training_complete",
  "training_abandon",
  "summary_view",
  "weakness_view",
  "personal_best_view",
  "match_mode_start",
  "mental_module_start",
  "physical_module_start",
  "precision_shooting_start",
  "weekly_challenge_view",
] as const;
export type ProductEvent = (typeof eventNames)[number];
const key = "jedna-kula-product-counters",
  consent = "jedna-kula-local-measurement";
let sink: ((event: { name: ProductEvent }) => void) | undefined;
export function setEventSink(next: typeof sink) {
  sink = next;
}
export function measurementEnabled() {
  try {
    return localStorage.getItem(consent) === "on";
  } catch {
    return false;
  }
}
export function enableMeasurement(value: boolean) {
  try {
    localStorage.setItem(consent, value ? "on" : "off");
    if (!value) localStorage.removeItem(key);
  } catch {
    /* Measurement never blocks training. */
  }
}
export function productCounters(): Record<
  string,
  Partial<Record<ProductEvent, number>>
> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}");
  } catch {
    return {};
  }
}
export function recordEvent(name: ProductEvent) {
  if (!eventNames.includes(name) || !measurementEnabled()) return;
  // Only allow-listed names; no profile, scores, identifiers or arbitrary payload.
  try {
    const day = new Date().toLocaleDateString("sv-SE"),
      counts = productCounters();
    counts[day] = {
      ...counts[day],
      [name]: Math.min(10000, (counts[day]?.[name] ?? 0) + 1),
    };
    const retained = Object.fromEntries(
      Object.entries(counts)
        .filter(([date]) => Date.parse(date) >= Date.now() - 90 * 86400000)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 90),
    );
    localStorage.setItem(key, JSON.stringify(retained));
    sink?.({ name });
  } catch {
    /* No network or retry queue; storage/sink failures never affect training. */
  }
}
export function transitionEvents(
  previous: import("../../domain").State,
  next: import("../../domain").State,
) {
  if (
    next.draft &&
    next.draft.plan.length >= 6 &&
    next.draft.id !== previous.draft?.id
  )
    recordEvent(
      ["recommended", "adaptive"].includes(next.draft.coach?.source ?? "")
        ? "recommended_training_start"
        : "manual_training_start",
    );
  const completed = next.sessions.filter(
    (s) =>
      s.completedAt &&
      !previous.sessions.some((p) => p.id === s.id && p.completedAt) &&
      s.results.length === s.plan.length &&
      s.plan.length >= 6,
  );
  completed.forEach((s) => {
    recordEvent("training_complete");
    if (["recommended", "adaptive"].includes(s.coach?.source ?? ""))
      recordEvent("recommended_training_complete");
  });
  if (
    previous.draft &&
    previous.draft.plan.length >= 6 &&
    !next.draft &&
    !next.sessions.some((s) => s.id === previous.draft!.id && s.completedAt)
  )
    recordEvent("training_abandon");
  if (
    next.situations?.matchDraft &&
    next.situations.matchDraft.id !== previous.situations?.matchDraft?.id
  )
    recordEvent("match_mode_start");
  if (
    next.coaching?.practiceDraft &&
    next.coaching.practiceDraft.id !== previous.coaching?.practiceDraft?.id
  )
    recordEvent(
      next.coaching.practiceDraft.kind === "mental"
        ? "mental_module_start"
        : "physical_module_start",
    );
  if (
    next.adventure?.precisionDraft &&
    next.adventure.precisionDraft.id !== previous.adventure?.precisionDraft?.id
  )
    recordEvent("precision_shooting_start");
}
