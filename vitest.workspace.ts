import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "unit",
      include: ["tests/unit/**/*"],
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      name: "integration",
      testTimeout: 10 * 1000, // 10 seconds, hapi is slow sometimes
      include: ["tests/integration/**/*"],
    },
  },
]);
