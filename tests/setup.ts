// Global test setup — runs before each test file.
// Ensure a JWT signature exists so token generation/verification works without
// depending on a real .env during tests.
process.env.TOKEN_SIGNATURE = process.env.TOKEN_SIGNATURE || "test-secret-signature";
process.env.NODE_ENV = "test";

// globalErrorHandling logs every handled error via console.log, which is just
// noise for the (expected) error-path tests. Silence it so real failures stand
// out. Other console methods stay intact.
jest.spyOn(console, "log").mockImplementation(() => {});
