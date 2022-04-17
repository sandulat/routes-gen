import chokidar from "chokidar";
import meow from "meow";
import * as path from "path";
import { exportRoutes } from "./export-routes";
import { Driver } from "./types";
import { logError, logInfo } from "./utils";

const drivers = ["@routes-gen/remix"];

const driversHelpText = drivers.map(
  (driver) => `${driver}      Installation: yarn add ${driver}\n`
);

const helpText = `
Usage
  $ routes-gen build

Options
  --help                 Print this help message and exit
  --version, -v          Print the CLI version and exit
  --output, -o           The path for routes export
  --driver, -d           The driver of handling routes parsing
  --watch, -w            Watch for changes

Official Drivers
  ${driversHelpText}
`;

const cli = meow(helpText, {
  autoHelp: true,
  autoVersion: false,
  flags: {
    version: {
      type: "boolean",
      alias: "v",
    },
    output: {
      type: "string",
      alias: "o",
    },
    driver: {
      type: "string",
      alias: "d",
    },
    watch: {
      type: "boolean",
      alias: "w",
    },
  },
});

if (cli.flags.version) {
  cli.showVersion();
}

if (!cli.flags.driver) {
  logError("Please specify a driver.");

  process.exit(1);
}

const markAsFailed = (message: string) => {
  logError(message);

  process.exit(1);
};

const getRoutes = async (driver: Driver) => {
  const routes = await driver.routes();

  if (
    !Array.isArray(routes) ||
    routes.some((route) => !route.path || typeof route.path !== "string")
  ) {
    return markAsFailed(
      `The routes returned by the "routes" option are invalid.`
    );
  }

  return routes;
};

const bootstrap = async () => {
  let driver: Driver | undefined = undefined;

  try {
    driver = await import(require.resolve(cli.flags.driver!));
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

  const outputPath = cli.flags.output ?? driver.defaultOutputPath;

  exportRoutes({
    routes: await getRoutes(driver),
    outputPath,
  });

  if (cli.flags.watch) {
    if (!driver.watchPaths) {
      return markAsFailed(
        `The "watchPaths" option is not exported by the driver.`
      );
    }

    if (typeof driver.watchPaths !== "function") {
      return markAsFailed(
        `The "watchPaths" option exported by the driver is not a function.`
      );
    }

    const pathsToBeWatched = await driver.watchPaths();

    if (
      !Array.isArray(pathsToBeWatched) ||
      pathsToBeWatched.some((item) => typeof item !== "string")
    ) {
      return markAsFailed(
        `The "watchPaths" option must return an array of strings.`
      );
    }

    logInfo("Watching for routes changes.");

    chokidar
      .watch(
        pathsToBeWatched.map((item) => path.resolve(process.cwd(), item)),
        {
          ignoreInitial: true,
        }
      )
      .on("all", async () =>
        exportRoutes({
          routes: await getRoutes(driver!),
          outputPath,
        })
      );
  }
};

bootstrap();
