const rollupConfig = require("config/rollup")({ input: "src/index.ts" });
const esbuild = require("rollup-plugin-esbuild").default;

module.exports = [
  ...rollupConfig,
  {
    input: "src/cli.ts",
    plugins: [esbuild()],
    output: [
      {
        file: `dist/cli.js`,
        format: "cjs",
        sourcemap: true,
        banner: `#!/usr/bin/env node`,
      },
    ],
    preserveEntrySignatures: true,
    external: (id) => !/^[./]/.test(id),
  },
];
