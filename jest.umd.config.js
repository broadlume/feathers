/* eslint-disable */
const config = require("./jest.config");
const glob = require("glob");

config.preset = "ts-jest";

config.moduleNameMapper = {
  "^@adhawk\\/([^/]+)": "<rootDir>/packages/$1/lib/$1.umd.min.js",
};

config.testPathIgnorePatterns = glob
  .sync("packages/*/package.json")
  .map((path) => {
    if (!require("./" + path).unpkg) {
      return path.replace("package.json", "");
    }
  })
  .filter(Boolean);

module.exports = config;
