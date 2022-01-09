import { cli } from "./cli";
import { exportRoutes } from "./export-routes";
import { Driver } from "./types";
import { logError } from "./utils";

export * from "./types";

const markAsFailed = (message: string) => {
  process.exitCode = 1;

  logError(message);
};

const bootstrap = async () => {
  let driver: Driver | undefined = undefined;

  try {
    driver = await import(`${process.cwd()}/node_modules/${cli.flags.driver}`);
  } catch {}

  if (!driver) {
    try {
      driver = await import(`${process.cwd()}/${cli.flags.driver}`);
    } catch {}
  }

  if (!driver) {
    return markAsFailed("Invalid driver package name or file path.");
  }

  if (!driver.defaultOutputPath) {
    return markAsFailed(
      `The "defaultOutputPath" option is not exported by the driver.`
    );
  }

  if (typeof driver.defaultOutputPath !== "string") {
    return markAsFailed(
      `The "defaultOutputPath" exported by the driver must be a string.`
    );
  }

  if (!driver.routes) {
    return markAsFailed(`The "routes" option is not exported by the driver.`);
  }

  if (typeof driver.routes !== "function") {
    return markAsFailed(
      `The "routes" option exported by the driver is not a function.`
    );
  }

  const routes = await driver.routes();

  if (
    !Array.isArray(routes) ||
    routes.some((route) => !route.path || typeof route.path !== "string")
  ) {
    return markAsFailed(
      `The routes returned by the "routes" option are invalid.`
    );
  }

  exportRoutes({ routes, path: cli.flags.output ?? driver.defaultOutputPath });
};

bootstrap();
