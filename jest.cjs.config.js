/* eslint-disable */
const config = require("./jest.config");

config.preset = "ts-jest";

config.moduleNameMapper = {
  "^@adhawk\\/([^/]+)": "<rootDir>/packages/$1/lib/cjs/index.js",
};

module.exports = config;
