import * as types from "@babel/types";
import template from "@babel/template";

interface Options {
  dynamicImport?: boolean;
  customImportMappings?: typeof DEFAULT_MAPPING;
}

interface State {
  opts: Options;
  file: { opts: { filename?: string } };
}

type Mapping = Record<string, string[]>;

function kebabCase(s: string) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function fileExists(filename: string) {
  try {
    require.resolve(filename);

    return true;
  } catch (e) {
    return false;
  }
}

function inferReactstrapMappings(): Mapping {
  // eslint-disable-next-line
  const reactstrapExports = require("reactstrap");

  return Object.keys(reactstrapExports).reduce((memo, k) => {
    if (k === "__esModule") {
      return memo;
    }

    const normalizedImportName = k
      .replace("Uncontrolled", "")
      .replace(/^Card.*/, "Card")
      .replace(/^Dropdown.*/, "Dropdown")
      .replace(/^Form.*/, "Form")
      .replace(/^InputGroup.*/, "InputGroup")
      .replace(/^Carousel.*/, "Carousel")
      .replace(/^ListGroup.*/, "ListGroup")
      .replace(/Item$/, "")
      .replace(/Item$/, "")
      .replace(/Link$/, "")
      .replace(/Header$/, "")
      .replace(/Footer$/, "")
      .replace(/Body$/, "");

    const singularFile = `bootstrap/scss/_${kebabCase(
      normalizedImportName
    )}.scss`;
    const pluralFile = `bootstrap/scss/_${kebabCase(
      normalizedImportName
    )}s.scss`;

    memo[k] = fileExists(singularFile)
      ? [singularFile]
      : fileExists(pluralFile)
      ? [pluralFile]
      : [];

    return memo;
  }, {});
}

export const DEFAULT_MAPPING: Mapping = {
  ...inferReactstrapMappings(),
  Row: ["bootstrap/scss/_grid.scss"],
  Col: ["bootstrap/scss/_grid.scss"],
  Container: ["bootstrap/scss/_grid.scss"],
  Input: ["bootstrap/scss/_forms.scss"],
  TabPane: ["bootstrap/scss/_nav.scss"],
  TabContent: ["bootstrap/scss/_nav.scss"],
  ButtonToggle: ["bootstrap/scss/_buttons.scss"],
  ButtonDropdown: ["bootstrap/scss/_buttons.scss"],
  UncontrolledButtonDropdown: ["bootstrap/scss/_buttons.scss"],
  ButtonToolbar: ["bootstrap/scss/_buttons.scss"],
};

function alreadyImportedInFile(
  filename: string,
  path: string,
  cache?: Map<string, boolean>
) {
  return cache.has(`${filename}:${path}`);
}

function setImportedInFile(
  filename: string,
  path: string,
  cache?: Map<string, boolean>
) {
  return cache.set(`${filename}:${path}`, true);
}

function isImportSpecifier(specifier: {
  type: string;
}): specifier is types.ImportSpecifier {
  return specifier.type === "ImportSpecifier";
}

const buildRequire = template(`
  if (typeof window !== "undefined") {
    REQUIRE_METHOD(SOURCE);
  }
`);

// eslint-disable-next-line
export default function () {
  return {
    pre() {
      this.cache = new Map();
      this.toInsert = [] as string[];
    },
    visitor: {
      ImportDeclaration(
        path: {
          node: types.ImportDeclaration;
        },
        state: State
      ) {
        const currentFile = state.file.opts.filename || "__anonymous__";
        const customImportMappings = state.opts?.customImportMappings || {};
        const memberImports: types.ImportSpecifier[] = path.node.specifiers.filter(
          isImportSpecifier
        );

        memberImports.forEach((memberImport) => {
          const imported = memberImport.imported;
          const importName = imported["name"];
          const defaultCssFilesToImport = DEFAULT_MAPPING[importName] || [];
          const customCssFilesToImport = customImportMappings[importName] || [];

          const cssFilesToImport = [
            ...defaultCssFilesToImport,
            ...customCssFilesToImport,
          ];

          cssFilesToImport.forEach((filename) => {
            if (!alreadyImportedInFile(currentFile, filename, this.cache)) {
              setImportedInFile(currentFile, filename, this.cache);

              this.toInsert.push(filename);
            }
          });
        });
      },
      Program: {
        exit(
          path: {
            node: types.Node;
            unshiftContainer: (name: string, n: unknown) => void;
          },
          state: State
        ) {
          this.toInsert.reverse().forEach((s: string) => {
            const ast = buildRequire({
              SOURCE: types.stringLiteral(s),
              REQUIRE_METHOD: state.opts.dynamicImport ? "import" : "require",
            });

            path.unshiftContainer("body", ast);
          });
        },
      },
    },
  };
}
