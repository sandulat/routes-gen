import { exec } from "child_process";
import type { Driver, Route } from "routes-gen";
import * as path from "path";

const remixConfigPath = "remix.config.js";

const remixConfig = require(path.resolve(process.cwd(), remixConfigPath)) as {
  appDirectory?: string;
};

const appDirectory = remixConfig.appDirectory ?? "./app";

export interface RemixRoute {
  path: string;
  index?: true;
  children: RemixRoute[];
}

export const defaultOutputPath: Driver["defaultOutputPath"] = `${appDirectory}/routes.d.ts`;

export const watchPaths: Driver["watchPaths"] = async () => [
  `${appDirectory}/routes/**/*.{ts,tsx,js,jsx}`,
  remixConfigPath,
];

export const routes: Driver["routes"] = async () =>
  new Promise<Route[]>((resolve) => {
    exec("remix routes --json", async (error, output) => {
      if (error) {
        throw error;
      }

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
                ).replace(/\/\/+/g, '/'),
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

      resolve(parseRoutes(JSON.parse(output)));
    });
  });
