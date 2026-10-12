import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const fixtureIds = [
  "page",
  "repository",
  "user-data",
  "unsafe-command",
] as const;
export type FixtureId = (typeof fixtureIds)[number];
export interface Proposal {
  tool: string;
  argument: string;
}
export type BrokerResult =
  | { status: "data"; trust: "untrusted"; text: string }
  | { status: "denied"; reason: string };
// Capability envelope is trusted configuration, never taken from model output or fixture content.
export function createAgentBroker(
  allowed: readonly FixtureId[],
  read = (id: FixtureId) =>
    readFile(resolve("tests/fixtures/agent", `${id}.txt`), "utf8"),
) {
  const granted = new Set(allowed);
  const audit: { tool: string; status: string }[] = [];
  return {
    audit,
    async execute(proposal: Proposal): Promise<BrokerResult> {
      if (
        proposal.tool !== "readFixture" ||
        !fixtureIds.includes(proposal.argument as FixtureId) ||
        !granted.has(proposal.argument as FixtureId)
      ) {
        audit.push({ tool: proposal.tool, status: "denied" });
        return { status: "denied", reason: "Capability was not granted." };
      }
      // Exact IDs, no caller-selected paths, URLs or executable commands.
      const text = await read(proposal.argument as FixtureId);
      audit.push({ tool: "readFixture", status: "data" });
      return { status: "data", trust: "untrusted", text };
    },
  };
}
