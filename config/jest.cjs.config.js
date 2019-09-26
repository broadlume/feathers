const config = require('./jest.config');

config.moduleNameMapper = {
  '^@adhawk\\/([^/]+)': '<rootDir>/$1/lib/$1.cjs.js',
};

module.exports = config;
