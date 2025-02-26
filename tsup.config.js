import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  outDir: "dist",
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
  sourcemap: true,
  treeshake: true,
  splitting: false,
  bundle: true,
  minify: true,
  esbuildOptions(options) {
    options.platform = "neutral";
    options.bundle = true;
    options.resolveExtensions = [".ts", ".js"];
    options.mainFields = ["module", "main"];
    options.loader = {
      ".js": "jsx",
    };
  },
});