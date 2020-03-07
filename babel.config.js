// eslint-disable-next-line no-undef
module.exports = {
  presets: [["@babel/preset-env", { useBuiltIns: false }]],
  plugins: [
    ["@babel/plugin-transform-runtime", { corejs: 3, useESModules: true }],
  ],
};
