import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const jestConfig = {
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testRegex: ".*\\.test\\.tsx?$",
  testEnvironment: "jest-environment-jsdom"
};

export default createJestConfig(jestConfig);
