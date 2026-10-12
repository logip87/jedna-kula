import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: [
      "tests/integration/**/*.test.ts",
      "tests/agent-security/**/*.test.ts",
      "tests/agentic/**/*.test.ts",
    ],
    environment: "node",
  },
});
