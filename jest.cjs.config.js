/* eslint-disable */
const config = require("./jest.config");

config.preset = "ts-jest/presets/js-with-babel";

config.moduleNameMapper = {
  "^@adhawk\\/([^/]+)": "<rootDir>/packages/$1/lib/index.js",
};

module.exports = config;
