/* eslint-disable */
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser as minify } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import path from "path";

export function rollup({
  name,
  umdName,
  input = "./lib/es/index.js",
  skipFormats = [],
}) {
  function outputFile(postfix) {
    return `./lib/${name}.umd${postfix}.js`;
  }

  const minifyPlugin = minify();

  function fromSource(format, out = format, opts = { plugins: [] }) {
    if (skipFormats.includes(format)) {
      return false;
    }

    return {
      input,
      output: {
        file: outputFile(out),
        format,
        sourcemap: true,
        name: umdName,
      },
      plugins: [
        nodeResolve({
          extensions: [".js"],
          mainFields: ["browser", "jsnext", "module", "main"],
        }),
        commonjs(),
        babel({
          babelHelpers: "bundled",
          presets: [["@babel/preset-env", { targets: "cover 99.5% in US" }]],
        }),
        ...opts.plugins,
      ],
    };
  }

  return [fromSource("umd", ".min", { plugins: [minifyPlugin] })].filter(
    Boolean,
  );
}
