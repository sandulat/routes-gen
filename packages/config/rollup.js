const dts = require("rollup-plugin-dts").default;
const esbuild = require("rollup-plugin-esbuild").default;
const defineConfig = require("rollup").defineConfig;

module.exports = function (options) {
  return defineConfig([
    {
      ...options,
      plugins: [esbuild()],
      output: [
        {
          file: `dist/index.js`,
          format: "cjs",
          sourcemap: true,
        },
      ],
      preserveEntrySignatures: true,
      external: (id) => !/^[./]/.test(id),
    },
    {
      ...options,
      plugins: [dts()],
      output: {
        file: `dist/index.d.ts`,
        format: "es",
      },
      preserveEntrySignatures: true,
      external: (id) => !/^[./]/.test(id),
    },
  ]);
};
