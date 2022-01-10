import chalk from "chalk";
import fs from "fs-extra";
import { Route } from "./types";
import { logSuccess } from "./utils";

export const exportRoutes = ({
  routes,
  path,
}: {
  routes: Route[];
  path: string;
}) => {
  const routeGenericTemplate = routes
    .map((route) => {
      const params = route.path.includes("/:")
        ? route.path
            .split("/")
            .filter((item) => item.includes(":"))
            .map((item) => `${item.split(".")[0].substring(1)}: string`)
        : undefined;

      return `      | ["${route.path}"${
        params ? `, { ${params.join(",")} }` : ""
      }]`;
    })
    .join("\n");

  const output = `declare module "routes-gen" {
  export function route<
    T extends
${routeGenericTemplate}
  >(...args: T): typeof args[0];
}
`;

  fs.outputFileSync(`${process.cwd()}/${path}`, output);

  logSuccess(`Exported ${routes.length} routes to "${chalk.underline(path)}".`);
};
