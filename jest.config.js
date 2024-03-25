import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/**
 * @type {import("jest").Config}
 */
const jestConfig = {
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testRegex: ".*\\.test\\.tsx?$",
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest",
};

export default createJestConfig(jestConfig);
