/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  moduleNameMapper: {
    // nanoid v5 is ESM-only; swap it for a CJS stub in tests.
    "^nanoid$": "<rootDir>/tests/mocks/nanoid.ts",
  },
  clearMocks: true,
  // Run suites serially: each DB suite spins up its own in-memory mongod /
  // replica set, and starting many at once starves resources and causes
  // connection timeouts. Serial is both reliable and (here) faster.
  maxWorkers: 1,
  // First run of mongodb-memory-server downloads a mongod binary, which can be
  // slow — give it room.
  testTimeout: 60000,
};
