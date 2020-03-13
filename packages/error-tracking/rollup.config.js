import { rollup } from "./../../config/rollup.config";

export default [
  ...rollup({
    name: "error-tracking",
    umdName: "ErrorTracking",
  }),
  ...rollup({
    name: "mini-error-tracking",
    umdName: "MiniErrorTracking",
    input: "./lib/es/mini.js",
  }),
];
