export type Route = {
  path: string;
};

export type DefaultOutputPath = string;

export type RoutesParser = () => Promise<Route[]>;

export type Driver = {
  defaultOutputPath: DefaultOutputPath;
  routes: RoutesParser;
};
