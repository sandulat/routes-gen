import { cli } from "@remix-run/dev";
import fs from "fs";
import * as path from "path";
import type { Driver, Route } from "routes-gen";

const remixConfigPath = "remix.config";

const remixConfigExts = ["js", "cjs", "mjs"] as const;

const fallbackRemixConfig = {
  appDirectory: "app",
};

const loadRemixConfig = (configPath: string) => {
  for (const ext of remixConfigExts) {
    const fullPath = `${configPath}.${ext}`;

    const file = path.resolve(process.cwd(), fullPath);

    if (!fs.existsSync(file)) {
      continue;
    }

    try {
      return require(file) as {
        appDirectory?: string;
      };
    } catch (e) {
      if (ext === "mjs") {
        console.warn(`The .mjs format is currently unsupported.`);
      } else {
        console.error(e);
      }

      console.warn(
        `Failed to load the Remix config at "${fullPath}". Falling back to the following defaults: ${JSON.stringify(
          fallbackRemixConfig
        )}.`
      );

      return fallbackRemixConfig;
    }
  }

  throw new Error("Error loading Remix config.");
};

const remixConfig = loadRemixConfig(remixConfigPath);

const appDirectory =
  remixConfig.appDirectory ?? fallbackRemixConfig.appDirectory;

export interface RemixRoute {
  path: string;
  index?: true;
  children: RemixRoute[];
}

export const defaultOutputPath: Driver["defaultOutputPath"] = `${appDirectory}/routes.d.ts`;

export const watchPaths: Driver["watchPaths"] = async () => [
  `${appDirectory}/routes/**/*.{ts,tsx,js,jsx}`,
  `${remixConfigPath}.{${remixConfigExts.join(",")}}`,
];

const parseRoutes = (
  routes: RemixRoute[],
  parentPath?: RemixRoute["path"]
): Route[] =>
  routes
    .map((item) => {
      const path = `${parentPath ?? ""}${item.path ?? ""}`;

      return [
        {
          path: (path.endsWith("/") && path !== "/"
            ? path.slice(0, -1)
            : path
          ).replace(/\/\/+/g, "/"),
        },
        ...(item.children ? parseRoutes(item.children, `${path}/`) : []),
      ];
    })
    .flat()
    .filter(
      (route, index, routes) =>
        routes.findIndex(
          (comparedRoute) => comparedRoute.path === route.path
        ) === index
    )
    .filter((item) => Boolean(item.path) && !item.path.includes("/*"));

export const routes: Driver["routes"] = async () => {
  // TODO: Get rid of this approach when Remix exposes routes publicly.
  const originalConsoleLog = console.log;

  const parsedRoutes = await new Promise<Route[]>(async (resolve) => {
    console.log = (stdout) => {
      try {
        const parsedRoutes = JSON.parse(stdout);

        if (
          Array.isArray(parsedRoutes) &&
          typeof parsedRoutes[0] === "object" &&
          parsedRoutes[0].id === "root"
        ) {
          resolve(parseRoutes(JSON.parse(stdout)));
        } else {
          resolve([]);
        }
      } catch (e) {
        resolve([]);
      }
    };

    await cli.run(["routes", "--json"]);
  });

  console.log = originalConsoleLog;

  if (parsedRoutes.length === 0) {
    throw new Error(
      'Couldn\'t parse routes. This may be due to breaking changes in "@remix-run/dev".'
    );
  }

  return parsedRoutes;
};
