<p align="center">
    <a href="https://github.com/sandulat/routes-gen" target="_blank">
        <img src="https://raw.githubusercontent.com/sandulat/routes-gen/main/assets/routes-gen.png" width="250px" />
    </a>
</p>
<p align="center">
<a href="https://www.npmjs.com/package/routes-gen"><img src="https://img.shields.io/npm/v/routes-gen?color=%23AD1CB0&label=routes-gen" alt="routes-gen"></a>
<a href="https://www.npmjs.com/package/@routes-gen/remix"><img src="https://img.shields.io/npm/v/@routes-gen/remix?color=%23AD1CB0&label=@routes-gen/remix" alt="@routes-gen/remix"></a>
<a href="https://github.com/sandulat/routes-gen/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/sandulat/routes-gen?color=%23AD1CB0" alt="License"></a>
<a href="https://twitter.com/sandulat"><img src="https://img.shields.io/twitter/follow/sandulat?label=Twitter" alt="Twitter"></a>
</p>

## About

`routes-gen` is a framework agnostic CLI tool for routes parsing and generation of a type-safe helper for safe route usage. Think of it as [Prisma](https://github.com/prisma/prisma), but for routes.

## Installation

First, you have to install the routes generator itself:
```
yarn add routes-gen
```

## Official Drivers

The generator works with "drivers", which are route parsers for different frameworks.

| Driver                                      | Installation                    |
|---------------------------------------------|---------------------------------|
| [Remix](https://github.com/remix-run/remix) | `yarn add @routes-gen/remix` |

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

## Params Types Usage
You can use the `RouteParams` type to add typings to your dynamic route parameters/segments. Example:

```ts
import { RouteParams } from "routes-gen";

const { productId } = params as RouteParams["/products/:productId"];
```

**Remix** example:
```ts
import { LoaderFunction, useParams } from "remix";
import { RouteParams } from "routes-gen";

export const loader: LoaderFunction = async ({ params }) => {
  const { productId } = params as RouteParams["/products/:productId"];
};

export default function Product() {
  const { productId } = useParams<RouteParams["/products/:productId"]>();

  return <div />;
}
```

## CLI Options

| Option    | Alias | Description                           |
|-----------|-------|---------------------------------------|
| --help    |       | Print the help message and exit       |
| --version | -v    | Print the CLI version and exit        |
| --output  | -o    | The path for routes export            |
| --driver  | -d    | The driver of handling routes parsing |
| --watch   | -w    | Watch for changes                     |

## Writing Your Driver

If there is no driver for your preferred framework, you can write your own. For example, create a simple `driver.js` file in your project, with the following content:

```js
module.exports = {
    // Where to export the typings if the "output" flag was not provided.
    defaultOutputPath: "src/routes.d.ts",
    
    // The routes parser. Must export and array of routes matching the { path: string } interface.
    routes: async () => {
        return [
            {
                path: "/products",
            },
            {
                path: "/products/:productId", // Note that the dynamic segments must match the :myVar pattern.
            },
        ];
    },

    // The paths to be watched for changes. Must return and array of relative paths.
    watchPaths: async () => {
        return ["/my-routes"];
    },
}
```

Now you can easily use it:

```
routes-gen -d driver.js
```

You can also publish it to npm, install it, and use it as a package:

```
routes-gen -d my-driver-package
```

> **Please consider submitting your drivers to this repository.**