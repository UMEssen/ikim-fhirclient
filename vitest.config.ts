import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
  test: {
    disableConsoleIntercept: true,
    reporters: ["verbose"],
    silent: false,
    watch: false,
  },
});
