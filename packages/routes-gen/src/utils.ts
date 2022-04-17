import chalk from "chalk";

export const logError = (message: string) =>
  console.error(chalk.bold(`${chalk.red("[ERROR]")} ${message}`));

export const logSuccess = (message: string) =>
  console.error(chalk.bold(`${chalk.green("[SUCCESS]")} ${message}`));

export const logInfo = (message: string) =>
  console.error(chalk.bold(`${chalk.blue("[INFO]")} ${message}`));
