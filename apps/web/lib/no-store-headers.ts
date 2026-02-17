/** Use for grading and certificate endpoints so proxies never cache. */
export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, private",
  Pragma: "no-cache",
  Vary: "Authorization",
} as const;
