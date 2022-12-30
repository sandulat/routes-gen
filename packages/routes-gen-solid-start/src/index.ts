import path from "path";
import {exec} from "child_process"
import {Driver} from "routes-gen/src";

const appDirectory = "./src";
export const defaultOutputPath: Driver["defaultOutputPath"] = `${appDirectory}/routes.d.ts`;
export const watchPaths: Driver["watchPaths"] = async () => [
  `${appDirectory}/routes/**/*.{ts,tsx,js,jsx}`,
];

type SolidStartRouteData = {
  id: string,
  path: string,
  componentPath: string,
  dataPath: string
};
export const routes: Driver["routes"] = async () => {
  const scriptPath = path.join(__dirname, 'node_modules', '@nirtamir2/solid-start', 'bin.cjs');
  const parsedRoutes = await new Promise<Array<SolidStartRouteData>>(async (resolve) => {
    exec(`node ${scriptPath} routes`, (error, stdout, stderr) => {
      if (error != null) {
        console.error("error", error);
        return;
      }
      const routes = JSON.parse(stdout) as Array<SolidStartRouteData>;
      resolve(routes);
    });
  });
  if (parsedRoutes.length === 0) {
    throw new Error('Couldn\'t parse routes. This may be due to breaking changes in "solid-start".');
  }
  return parsedRoutes;
};


module.exports = {
  defaultOutputPath,
  watchPaths,
  routes
}