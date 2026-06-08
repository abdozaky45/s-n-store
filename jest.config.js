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
  // First run of mongodb-memory-server downloads a mongod binary, which can be
  // slow — give it room.
  testTimeout: 60000,
};
