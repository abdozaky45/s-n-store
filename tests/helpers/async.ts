/**
 * Poll until a condition becomes true or the timeout elapses. Useful for
 * asyncHandler-wrapped functions that don't return their promise, so the test
 * waits for the side effect (next() called, response sent, DB write landed).
 */
export const waitFor = async (
  cond: () => boolean | Promise<boolean>,
  timeout = 3000
): Promise<void> => {
  const start = Date.now();
  while (!(await cond()) && Date.now() - start < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};
