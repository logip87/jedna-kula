import { afterEach, describe, expect, it, vi } from "vitest";
import {
  enableMeasurement,
  getClientId,
  queuedEvents,
  trackEvent,
  flushAnalytics,
} from "../../src/features/product/analytics";

function storage() {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  return values;
}
afterEach(() => vi.unstubAllGlobals());

describe("anonymous beta analytics", () => {
  it("creates and retains one random client id", () => {
    storage();
    const first = getClientId();
    expect(first).toMatch(/^[a-f0-9-]{36}$/i);
    expect(getClientId()).toBe(first);
  });
  it("sends only the minimal approved payload", async () => {
    storage(); enableMeasurement(true);
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
    trackEvent("training_start", { module: "training", source: "manual" });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(Object.keys(body.events[0]).sort()).toEqual(["appVersion", "clientId", "currentScreen", "deviceType", "eventName", "optionalContext", "timestamp"]);
    expect(Object.keys(body.events[0])).not.toEqual(
      expect.arrayContaining(["name", "email", "score", "results", "history", "location"]),
    );
  });
  it("buffers offline events and retries them when a later send succeeds", async () => {
    storage(); enableMeasurement(true);
    vi.stubGlobal("navigator", { onLine: false });
    trackEvent("today_view");
    expect(queuedEvents()).toHaveLength(1);
    vi.stubGlobal("navigator", { onLine: true });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    await flushAnalytics();
    expect(queuedEvents()).toEqual([]);
  });
  it("contains analytics failures so the training flow can continue", () => {
    storage(); enableMeasurement(true);
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => { throw new Error("offline"); }));
    expect(() => trackEvent("training_complete", { module: "training" })).not.toThrow();
  });
});
