export function route<T extends string>(
  path: T,
  params?: Record<string, any>
): T {
  if (params) {
    const segments = path.split(/\/+/).map((segment) => {
      if (segment.startsWith(":")) {
        const key = segment.replace(":", "").replace("?", "");

        if (key in params) {
          return params[key];
        }

        // If the segment is optional and it doesn't exist in params, return null to omit it from the resulting path
        if (segment.endsWith("?")) {
          return null;
        }
      }

      return segment;
    });

    // Filter out any null/undefined segments and join remaining segments
    return segments.filter((value) => value != null).join("/") as T;
  }

  return path;
}
