import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export const config = defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
  test: {
    disableConsoleIntercept: true,
    reporters: ["verbose"],
    silent: false,
  },
});
