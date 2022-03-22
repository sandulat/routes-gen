import meow from "meow";
import { logError } from "./utils";
import { exportRoutes } from "./export-routes";
import { Driver } from "./types";

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
  process.exitCode = 1;

  logError(message);
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
