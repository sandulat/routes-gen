const { execSync } = require("child_process");
const fs = require("fs-extra");

execSync("yarn build");

execSync("cp README.md packages/routes-gen");

const routesGenJsonPath = "packages/routes-gen/package.json";
const routesGenJson = fs.readJSONSync(routesGenJsonPath);

const remixDriverJsonPath = "packages/routes-gen-remix/package.json";
const remixDriverJson = fs.readJSONSync(remixDriverJsonPath);

const configJson = fs.readJSONSync("packages/config/package.json");

const localDevDependencies = [configJson.name];

const filterLocalDevDependencies = (devDependencies) =>
  Object.keys(devDependencies).reduce((result, dependency) => {
    if (!localDevDependencies.includes(dependency)) {
      result[dependency] = devDependencies[dependency];
    }

    return result;
  }, {});

fs.writeJSONSync(
  routesGenJsonPath,
  {
    ...routesGenJson,
    devDependencies: filterLocalDevDependencies(routesGenJson.devDependencies),
  },
  { spaces: 2 }
);

fs.writeJSONSync(
  remixDriverJsonPath,
  {
    ...remixDriverJson,
    devDependencies: filterLocalDevDependencies(
      remixDriverJson.devDependencies
    ),
    dependencies: {
      ...remixDriverJson.dependencies,
      "routes-gen": `^${routesGenJson.version}`,
    },
  },
  { spaces: 2 }
);

execSync("yarn changeset publish");

fs.writeJSONSync(routesGenJsonPath, routesGenJson, { spaces: 2 });

fs.writeJSONSync(remixDriverJsonPath, remixDriverJson, { spaces: 2 });

execSync("rimraf packages/routes-gen/README.MD");
