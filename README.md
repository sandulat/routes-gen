# Routes Generator

Routes Generator is a CLI tool that parses and exports your routes into a Typescript helper file, to help keep your code in sync with your routes and provide you typings. Think of it as [Prisma](https://github.com/prisma/prisma), but for routes.

## Installation

First, you have to install the routes generator itself:
```
yarn add routes-gen
```

> Note that it should not be a dev dependency, since you'll be importing the `route` method from here.

The generator works with "drivers", which are route parsers for different frameworks.

## Official Drivers

| Driver                                      | Installation                    | Default export path        |
|---------------------------------------------|---------------------------------|----------------------------|
| [Remix](https://github.com/remix-run/remix) | `yarn add -D @routes-gen/remix` | `/app/routes.d.ts` |

## Usage Example

You can simply run:
```
yarn routes-gen -d @routes-gen/remix
```

It will parse and export the routes, based on the driver that you've provided.

For example, the `@routes-gen/remix` driver will export the routes by default to `/app/routes.d.ts`.

> Note that you can change the output path via the `--output` or `-o` flag.

Now you can import the generated `route` helper anywhere and enjoy the typings:
```ts
import { route } from "routes-gen";

// Compiles to /products
route("/products");

// Compiles to /products/1337
route("/products/:productId", {
    productId: "1337",
});
```

## CLI Options

| Option    | Alias | Description                           |
|-----------|-------|---------------------------------------|
| --help    |       | Print the help message and exit       |
| --version | -v    | Print the CLI version and exit        |
| --output  | -o    | The path for routes export            |
| --driver  | -d    | The driver of handling routes parsing |

## Writing Your Driver

If there is no driver for your preferred framework, you can write your own. For example, create a simple `driver.js` file in your project, with the following content:

```js
module.exports = {
    // Where to export the file if the "output" flag was not provided
    defaultOutputPath: "src/routes.d.ts",
    
    // The routes parser. Must export and array of routes matching the interface: { path: string }
    routes: async () => {
        return [
            {
                path: "/products",
            },
            {
                path: "/products/:productId", // Note that the dynamic segments must match the pattern :myVar
            },
        ];
    },
}
```

Now you can easily use it:

```
routes-gen -d driver.js
```

You can also publish it to npm, and use it as a package:

```
routes-gen -d my-driver-package
```

> **Please consider submitting your drivers to this repository.**