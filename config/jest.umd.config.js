const config = require("./jest.config");

config.moduleNameMapper = {
  "^@adhawk\\/([^/]+)": "<rootDir>/$1/lib/$1.umd.js",
};

module.exports = config;
