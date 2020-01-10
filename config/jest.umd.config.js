const config = require("./jest.config");

config.moduleNameMapper = {
  "^@adhawk\\/([^/]+)": "<rootDir>/$1/lib/$1.umd.min.js",
};

module.exports = config;
