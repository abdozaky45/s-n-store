// nanoid v5 is ESM-only, which Jest (CommonJS) can't parse from node_modules.
// Tests don't need real nanoid — return an all-digit string so callers like
// generateSixDigitCode (which strips non-digits) always make progress.
export const nanoid = (size = 21): string =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 10)).join("");
