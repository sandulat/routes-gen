const { execSync } = require("child_process");
const fs = require("fs-extra");

execSync("yarn build");

execSync("cp README.md packages/routes-gen");

const routesGenJsonPath = "packages/routes-gen/package.json";
const routesGenJson = fs.readJSONSync(routesGenJsonPath);

const remixDriverJsonPath = "packages/routes-gen-remix/package.json";
const remixDriverJson = fs.readJSONSync(remixDriverJsonPath);

// const solidStartDriverJsonPath = "packages/routes-gen-solid-start/package.json";
// const solidStartDriverJson = fs.readJSONSync(solidStartDriverJsonPath);

const configJson = fs.readJSONSync("packages/config/package.json");

const removeDependencies = (sourceDependencies, removeDependencies) =>
  Object.keys(sourceDependencies).reduce((result, dependency) => {
    if (!removeDependencies.includes(dependency)) {
      result[dependency] = sourceDependencies[dependency];
    }

    return result;
  }, {});

fs.writeJSONSync(
  routesGenJsonPath,
  {
    ...routesGenJson,
    devDependencies: removeDependencies(routesGenJson.devDependencies, [
      configJson.name,
    ]),
  },
  { spaces: 2 }
);

fs.writeJSONSync(
  remixDriverJsonPath,
  {
    ...remixDriverJson,
    devDependencies: removeDependencies(remixDriverJson.devDependencies, [
      configJson.name,
      "@remix-run/dev",
    ]),
    dependencies: {
      ...remixDriverJson.dependencies,
      "routes-gen": `^${routesGenJson.version}`,
    },
  },
  { spaces: 2 }
);

// fs.writeJSONSync(
//   solidStartDriverJsonPath,
//   {
//     ...solidStartDriverJson,
//     devDependencies: removeDependencies(solidStartDriverJson.devDependencies, [
//       configJson.name,
//       "solid-start",
//     ]),
//     dependencies: {
//       ...solidStartDriverJson.dependencies,
//       "routes-gen": `^${routesGenJson.version}`,
//     },
//   },
//   { spaces: 2 }
// );

execSync("yarn changeset publish");

fs.writeJSONSync(routesGenJsonPath, routesGenJson, { spaces: 2 });

fs.writeJSONSync(remixDriverJsonPath, remixDriverJson, { spaces: 2 });

// fs.writeJSONSync(solidStartDriverJsonPath, remixDriverJson, { spaces: 2 });

execSync("rimraf packages/routes-gen/README.MD");
