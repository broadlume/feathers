const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    modules: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "./../../node_modules"),
    ],
  },
  module: {
    rules: [
      {
        test: /\.yml$/,
        // exclude: /(node_modules|bower_components)/,
        use: {
          loader: require.resolve("./../../lib"),
        },
      },
    ],
  },
  mode: "production",
  plugins: [new HtmlWebpackPlugin()],
};
