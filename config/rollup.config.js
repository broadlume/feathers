import nodeResolve from "rollup-plugin-node-resolve";
import typescript from "typescript";
import typescriptPlugin from "rollup-plugin-typescript2";
import invariantPlugin from "rollup-plugin-invariant";
import { terser as minify } from "rollup-plugin-terser";

export function rollup({ name, umdName, input = "./src/index.ts" }) {
  const tsconfig = "./config/tsconfig.json";

  function outputFile(format) {
    return `./lib/${name}.${format}.js`;
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
    return {
      input,
      external: ["tslib", "react"],
      output: {
        file: outputFile(out),
        format,
        sourcemap: true,
        name: umdName,
      },
      plugins: [
        nodeResolve({
          extensions: [".ts", ".tsx", ".js"],
          mainFields: ["browser", "jsnext", "module", "main"],
        }),
        typescriptPlugin({ typescript, tsconfig }),
        invariantPlugin({
          // Instead of completely stripping InvariantError messages in
          // production, this option assigns a numeric code to the
          // production version of each error (unique to the call/throw
          // location), which makes it much easier to trace production
          // errors back to the unminified code where they were thrown,
          // where the full error string can be found. See #4519.
          errorCodes: true,
        }),
        ...opts.plugins,
      ],
    };
  }

  return [
    fromSource("esm"),
    fromSource("cjs"),
    fromSource("cjs", "cjs.min", { plugins: [minifyPlugin] }),
    fromSource("umd"),
    fromSource("umd", "umd.min", { plugins: [minifyPlugin] }),
  ];
}
