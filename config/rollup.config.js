/* eslint-disable */
import nodeResolve from "@rollup/plugin-node-resolve";
import invariantPlugin from "rollup-plugin-invariant";
import commonjs from "@rollup/plugin-commonjs";
import { terser as minify } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";

export function rollup({
  name,
  umdName,
  input = "./lib/es/index.js",
  skipFormats = [],
}) {
  function outputFile(postfix) {
    return `./lib/${name}.umd${postfix}.js`;
  }

  const minifyPlugin = minify({
    mangle: {
      toplevel: true,
    },
    output: {
      comments: false,
    },
    compress: {
      global_defs: {
        "@process.env.NODE_ENV": JSON.stringify("production"),
      },
    },
  });

  function fromSource(format, out = format, opts = { plugins: [] }) {
    if (skipFormats.includes(format)) {
      return false;
    }

    return {
      input,
      external: ["react"],
      output: {
        file: outputFile(out),
        format,
        sourcemap: true,
        name: umdName,
        globals: {
          react: "React",
        },
      },
      plugins: [
        nodeResolve({
          extensions: [".js"],
          mainFields: ["browser", "jsnext", "module", "main"],
        }),
        commonjs(),
        // typescriptPlugin({ tsconfig: "./tsconfig.es.json" }),
        invariantPlugin({
          // Instead of completely stripping InvariantError messages in
          // production, this option assigns a numeric code to the
          // production version of each error (unique to the call/throw
          // location), which makes it much easier to trace production
          // errors back to the unminified code where they were thrown,
          // where the full error string can be found. See #4519.
          errorCodes: true,
        }),
        babel({
          runtimeHelpers: true,
        }),
        ...opts.plugins,
      ],
    };
  }

  return [fromSource("umd", ".min", { plugins: [minifyPlugin] })].filter(
    Boolean,
  );
}
