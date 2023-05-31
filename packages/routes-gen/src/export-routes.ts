import chalk from "chalk";
import fs from "fs-extra";
import * as path from "path";
import { Route } from "./types";
import { logSuccess } from "./utils";

const extractPathParams = (path: Route["path"]) =>
  path.includes("/:")
    ? path
        .split("/")
        .filter((item) => item.includes(":"))
        .map((item) => item.split(".")[0].split("-")[0].substring(1))
    : [];

const sortRoutes = (a: Route, b: Route) => a.path.localeCompare(b.path);

export const exportRoutes = ({
  routes,
  outputPath,
}: {
  routes: Route[];
  outputPath: string;
}) => {
  const routeGenericTemplate = routes
    .sort(sortRoutes)
    .map((route) => {
      const params = extractPathParams(route.path);

      const onlyOptionalParams =
        params.length > 0 && params.every((param) => param.endsWith("?"));

      return `      | ["${route.path}"${
        params.length > 0 ? `, RouteParams["${route.path}"]` : ""
      }]${
        onlyOptionalParams
          ? `
      | ["${route.path}"]`
          : ""
      }`;
    })
    .join("\n");

  const routeParamsTypeTemplate = routes
    .sort(sortRoutes)
    .map((route) => {
      const params = extractPathParams(route.path);

      return `    "${route.path}": ${
        params.length > 0
          ? `{ ${params
              .map((param) =>
                param.endsWith("?")
                  ? `"${param.slice(0, -1)}"?: string`
                  : `"${param}": string`
              )
              .join(", ")} }`
          : "Record<string, never>"
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

  fs.outputFileSync(path.resolve(process.cwd(), outputPath), output);

  logSuccess(
    `Exported ${routes.length} routes to "${chalk.underline(outputPath)}".`
  );
};
