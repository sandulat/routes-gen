import chalk from "chalk";

export const logError = (message: string) =>
  console.error(chalk.bold(`\n${chalk.red("[ERROR]")} ${message}\n`));

export const logSuccess = (message: string) =>
  console.error(chalk.bold(`\n${chalk.green("[SUCCESS]")} ${message}\n`));
