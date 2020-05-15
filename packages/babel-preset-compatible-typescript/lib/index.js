const declare = require("@babel/helper-plugin-utils").declare;

module.exports = declare((api, _opts) => {
  api.assertVersion(7);

  return {
    presets: [
      [
        "@babel/preset-env",
        { useBuiltIns: false, targets: "cover 99.5% in US" },
      ],
      "@babel/preset-typescript",
    ],
    plugins: [
      [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-transform-runtime",
        { corejs: 3, useESModules: true },
      ],
    ],
  };
});
