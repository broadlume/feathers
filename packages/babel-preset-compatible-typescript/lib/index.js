const declare = require("@babel/helper-plugin-utils").declare;

module.exports = declare((api, _opts) => {
  api.assertVersion(7);

  return {
    presets: [
      [
        "@babel/preset-en@babel/preset-envv",
        {
          useBuiltIns: false,
        },
      ],
    ],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      ["@babel/plugin-transform-runtime", { corejs: 3, useESModules: true }],
    ],
  };
});
