import type { State } from "../../domain";

/** The only analytics boundary used by UI code. Its allow-list prevents
 * names, scores, drill history, user-agent or URLs entering analytics. */
export const eventNames = [
  "app_open", "today_view", "training_picker_view", "training_start",
  "training_complete", "training_abandon", "recommendation_view",
  "recommendation_click", "weakness_view", "adventure_view",
  "adventure_start", "mental_view", "mental_start", "physical_view",
  "physical_start", "rules_view", "tactics_view", "history_view",
  "feedback_open", "feedback_submit",
  "summary_view", "weekly_challenge_view", "personal_best_view",
  "recommended_training_start", "recommended_training_complete",
  "manual_training_start", "match_mode_start", "mental_module_start",
  "physical_module_start", "precision_shooting_start",
] as const;
export type ProductEvent = (typeof eventNames)[number];
export type AnalyticsContext = {
  module?: "training" | "adventure" | "mental" | "physical" | "rules" | "tactics" | "feedback";
  source?: "recommendation" | "manual" | "adventure";
};
export type AnalyticsEvent = {
  eventName: ProductEvent; timestamp: string; clientId: string; appVersion: string;
  currentScreen: string; deviceType: "mobile" | "tablet" | "desktop";
  optionalContext?: AnalyticsContext;
};

const countersKey = "jedna-kula-product-counters";
const consentKey = "jedna-kula-analytics-consent";
const clientKey = "jedna-kula-analytics-client-id";
const queueKey = "jedna-kula-analytics-queue";
const maxQueue = 100;
const appVersion = "1.0.0";
let sink: ((event: AnalyticsEvent) => void) | undefined;
const storage = () => typeof localStorage === "undefined" ? undefined : localStorage;
const safeGet = (key: string) => { try { return storage()?.getItem(key) ?? null; } catch { return null; } };
const safeSet = (key: string, value: string) => { try { storage()?.setItem(key, value); return true; } catch { return false; } };

export function measurementEnabled() { return safeGet(consentKey) === "on"; }
export function measurementChoiceMade() { return ["on", "off"].includes(safeGet(consentKey) ?? ""); }
export function enableMeasurement(value: boolean) {
  safeSet(consentKey, value ? "on" : "off");
  if (!value) try { storage()?.removeItem(countersKey); storage()?.removeItem(queueKey); } catch { /* fail-safe */ }
}
export function getClientId() {
  const existing = safeGet(clientKey);
  if (existing && /^[a-f0-9-]{36}$/i.test(existing)) return existing;
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  safeSet(clientKey, id);
  return id;
}
export function deviceType(): AnalyticsEvent["deviceType"] {
  const width = typeof window === "undefined" ? 1024 : window.innerWidth;
  return width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
}
export function productCounters(): Record<string, Partial<Record<ProductEvent, number>>> {
  try { return JSON.parse(safeGet(countersKey) ?? "{}"); } catch { return {}; }
}
function queue(): AnalyticsEvent[] { try { const value = JSON.parse(safeGet(queueKey) ?? "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }
function saveQueue(events: AnalyticsEvent[]) { safeSet(queueKey, JSON.stringify(events.slice(-maxQueue))); }
export function queuedEvents() { return queue(); }
function addCounter(name: ProductEvent) {
  const day = new Date().toLocaleDateString("sv-SE"), counts = productCounters();
  counts[day] = { ...counts[day], [name]: Math.min(10000, (counts[day]?.[name] ?? 0) + 1) };
  const retained = Object.fromEntries(Object.entries(counts).filter(([date]) => Date.parse(date) >= Date.now() - 90 * 86400000).slice(-90));
  safeSet(countersKey, JSON.stringify(retained));
}
export async function flushAnalytics() {
  if (!measurementEnabled() || (typeof navigator !== "undefined" && navigator.onLine === false)) return;
  const events = queue(); if (!events.length || typeof fetch === "undefined") return;
  try {
    const response = await fetch("/api/analytics.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ events }) });
    // Do not erase events added while this request was in flight.
    if (response.ok) saveQueue(queue().slice(events.length));
  } catch { /* Keep local queue; analytics never interrupts the product. */ }
}
export function setEventSink(next: typeof sink) { sink = next; }
export function trackEvent(name: ProductEvent, context?: AnalyticsContext) {
  if (!eventNames.includes(name) || !measurementEnabled()) return;
  try {
    addCounter(name);
    const event: AnalyticsEvent = { eventName: name, timestamp: new Date().toISOString(), clientId: getClientId(), appVersion, currentScreen: typeof location === "undefined" ? "/" : location.pathname, deviceType: deviceType(), ...(context ? { optionalContext: context } : {}) };
    saveQueue([...queue(), event]); sink?.(event); void flushAnalytics();
  } catch { /* fail-safe */ }
}
/** Backwards-compatible name for existing product components. */
export const recordEvent = trackEvent;

export function transitionEvents(previous: State, next: State) {
  if (next.draft && next.draft.plan.length >= 6 && next.draft.id !== previous.draft?.id) {
    const recommended = ["recommended", "adaptive"].includes(next.draft.coach?.source ?? "");
    trackEvent("training_start", { module: "training", source: recommended ? "recommendation" : "manual" });
    trackEvent(recommended ? "recommended_training_start" : "manual_training_start");
  }
  const completed = next.sessions.filter((s) => s.completedAt && !previous.sessions.some((p) => p.id === s.id && p.completedAt) && s.results.length === s.plan.length && s.plan.length >= 6);
  completed.forEach((s) => { trackEvent("training_complete", { module: "training" }); if (["recommended", "adaptive"].includes(s.coach?.source ?? "")) trackEvent("recommended_training_complete"); });
  if (previous.draft && previous.draft.plan.length >= 6 && !next.draft && !next.sessions.some((s) => s.id === previous.draft!.id && s.completedAt)) trackEvent("training_abandon", { module: "training" });
  if (next.situations?.matchDraft && next.situations.matchDraft.id !== previous.situations?.matchDraft?.id) trackEvent("match_mode_start");
  if (next.coaching?.practiceDraft && next.coaching.practiceDraft.id !== previous.coaching?.practiceDraft?.id) {
    const mental = next.coaching.practiceDraft.kind === "mental";
    trackEvent(mental ? "mental_start" : "physical_start", { module: mental ? "mental" : "physical" });
    trackEvent(mental ? "mental_module_start" : "physical_module_start");
  }
  if (next.adventure?.precisionDraft && next.adventure.precisionDraft.id !== previous.adventure?.precisionDraft?.id) trackEvent("adventure_start", { module: "adventure", source: "adventure" });
}
