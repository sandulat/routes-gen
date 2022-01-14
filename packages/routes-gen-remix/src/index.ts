import { exec } from "child_process";
import type { Driver, Route } from "routes-gen";

export interface RemixRoute {
  path: string;
  index?: true;
  children: RemixRoute[];
}

export const defaultOutputPath: Driver["defaultOutputPath"] = "app/routes.d.ts";

export const routes: Driver["routes"] = async () =>
  new Promise<Route[]>((resolve) => {
    exec("remix routes --json", (error, output) => {
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
                ).replace(/\/\//g, "/"),
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
