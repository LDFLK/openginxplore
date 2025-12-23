export const STALE_TIME = 1000 * 60 * 5; // data becomes stale, but still cached
export const GC_TIME = 1000 * 60 * 10; // If no component uses the query, it gets garbage-collected after this