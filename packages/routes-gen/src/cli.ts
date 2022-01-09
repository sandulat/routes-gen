import meow from "meow";
import { logError } from "./utils";

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

export const cli = meow(helpText, {
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
