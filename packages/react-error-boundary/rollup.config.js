import { rollup } from "./../../config/rollup.config";

export default rollup({
  name: "react-error-boundary",
  umdName: "ErrorBoundary",
  input: "./src/index.tsx",
});
