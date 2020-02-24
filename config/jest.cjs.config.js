/* eslint-disable */
const config = require("./../jest.config");

config.moduleNameMapper = {
  "^@adhawk\\/([^/]+)": "<rootDir>/packages/$1/lib/$1.cjs.min.js",
};

module.exports = config;
