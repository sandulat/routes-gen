export function route<T extends string>(
  path: T,
  params?: Record<string, any>
): T {
  if (params) {
    return Object.entries(params)
      .reduce(
        (result, [key, value]) =>
          result.replace(new RegExp(`:${key}\\??`), value),
        path as string
      )
      .replace(new RegExp("\\/:.+\\?", "g"), "") as T;
  }

  return path;
}
