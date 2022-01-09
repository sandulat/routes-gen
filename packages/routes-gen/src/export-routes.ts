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
  const routesMapTemplate = `export const routes = {
  ${routes.map((route) => `"${route.path}": "${route.path}",`).join("\n  ")}
} as const;`;

  const routeGenericTemplate = routes
    .map((route) => {
      const params = route.path.includes("/:")
        ? route.path
            .split("/")
            .filter((item) => item.includes(":"))
            .map((item) => `${item.split(".")[0].substring(1)}: string`)
        : undefined;

      return `    | { path: typeof routes["${route.path}"]${
        params ? `, params: { ${params.join(",")} }` : ""
      } }`;
    })
    .join("\n");

  const output = `${routesMapTemplate}

export function route<
  T extends
${routeGenericTemplate}
>(options: T): T["path"] {
  if ("params" in options) {
    return Object.entries(options.params).reduce(
      (result, [key, value]) =>
        result.replace(new RegExp(\`:\${key}\`, "g"), value),
      options.path as string
    ) as T["path"];
  }

  return options.path;
}
`;

  fs.outputFileSync(`${process.cwd()}/${path}`, output);

  logSuccess(`Exported ${routes.length} routes to "${chalk.underline(path)}".`);
};
