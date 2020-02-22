module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  rootDir: "../packages",
  projects: ["<rootDir>"],
  testEnvironment: "jest-environment-jsdom-global",
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/../config/tsconfig.base.json",
      isolatedModules: true,
    },
  },
  coverageDirectory: "./meta/coverage",
  moduleNameMapper: {
    "^@adhawk\\/([^/]+)": "<rootDir>/$1/src",
  },
  testMatch: ["<rootDir>/*/src/**/__tests__/**/*.test.ts?(x)"],
  testPathIgnorePatterns: ["/examples", "/lib"],
};
