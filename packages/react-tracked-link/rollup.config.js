import { rollup } from "../../config/rollup.config";

export default rollup({
  name: "react-tracked-link",
  umdName: "TrackedLink",
  input: "./src/index.tsx",
});
