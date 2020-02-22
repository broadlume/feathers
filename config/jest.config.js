const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  rootDir: "../",
  // projects: ["<rootDir>/packages/*"],
  testEnvironment: "jest-environment-jsdom-global",
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/config/tsconfig.base.json",
      isolatedModules: true,
    },
  },
  coverageDirectory: "./meta/coverage",
  moduleNameMapper: {
    "^@adhawk\\/([^/]+)": "<rootDir>/packages/$1/src",
  },
  testMatch: ["<rootDir>/packages/*/src/**/__tests__/**/*.test.ts?(x)"],
  testPathIgnorePatterns: ["/examples", "/lib"],
  transform: {
    ...tsjPreset.transform,
  },
};
