import chalk from "chalk";
import fs from "fs-extra";
import { Route } from "./types";
import { logSuccess } from "./utils";

const extractPathParams = (path: Route["path"]) =>
  path.includes("/:")
    ? path
        .split("/")
        .filter((item) => item.includes(":"))
        .map((item) => item.split(".")[0].split("-")[0].substring(1))
    : [];

export const exportRoutes = ({
  routes,
  path,
}: {
  routes: Route[];
  path: string;
}) => {
  const routeGenericTemplate = routes
    .map((route) => {
      const params = extractPathParams(route.path);

      return `      | ["${route.path}"${
        params.length > 0 ? `, RouteParams["${route.path}"]` : ""
      }]`;
    })
    .join("\n");

  const routeParamsTypeTemplate = routes
    .map((route) => {
      const params = extractPathParams(route.path);

      return `    "${route.path}": ${
        params.length > 0
          ? `{ ${params.map((path) => `"${path}": string`).join(", ")} }`
          : "{}"
      };`;
    })
    .join("\n");

  const output = `declare module "routes-gen" {
  export type RouteParams = {
${routeParamsTypeTemplate}
  };

  export function route<
    T extends
${routeGenericTemplate}
  >(...args: T): typeof args[0];
}
`;

  fs.outputFileSync(`${process.cwd()}/${path}`, output);

  logSuccess(`Exported ${routes.length} routes to "${chalk.underline(path)}".`);
};
