// web-test-runner.config.js
import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: ["**/*.test.js"],
  plugins: [esbuildPlugin({ ts: false })],
  reporters: ["minimal"],
  nodeResolve: true,
  coverageConfig: {
    report: true,
    reportDir: "coverage",
    exclude: ["**/*.test.js"],
  },
  browsers: ["chrome"],
  coverageHtml: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
