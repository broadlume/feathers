import * as babel from "@babel/core";
import { DEFAULT_MAPPING } from "./../";

function transform(code: string, opts?: Record<string, unknown>) {
  return babel.transform(code, {
    presets: [["@babel/preset-env", { modules: false }]],
    plugins: [[require.resolve("./../index.ts"), opts]],
  }).code;
}

describe("babel-plugin-reactstrap", () => {
  describe("importing components", () => {
    Object.keys(DEFAULT_MAPPING).forEach((componentName) => {
      it(`generates correct CSS imports for "${componentName}"`, () => {
        const code = transform(
          `import { ${componentName} } from 'reactstrap';`
        );

        expect(code).toMatchSnapshot();
      });
    });
  });

  describe("duplicating components", () => {
    it("does not duplicate imports in the same declaration", () => {
      const code = transform(`
        import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
        `);

      expect(code.match(/breadcrumb\.scss/g).length).toEqual(1);
    });

    it("does not duplicate imports in the different declarations", () => {
      const code = transform(`
        import { Breadcrumb } from 'reactstrap';
        import { BreadcrumbItem } from 'reactstrap';
        `);

      expect(code.match(/breadcrumb\.scss/g).length).toEqual(1);
    });
  });

  describe("aliasing components", () => {
    it("imports the CSS for the canonical name", () => {
      const code = transform(`
        import { Breadcrumb as Foo } from 'reactstrap';
        `);

      expect(code.match(/breadcrumb\.scss/g).length).toEqual(1);
    });
  });

  describe("import multiple components", () => {
    it("can include multiple imports", () => {
      const code = transform(`
        import { Breadcrumb, Popover } from 'reactstrap';
        `);

      expect(code).toContain("scss/_popover.scss");
      expect(code).toContain("scss/_breadcrumb.scss");
    });

    it("respects the ordering", () => {
      const code = transform(`
        import { Breadcrumb, Popover } from 'reactstrap';
        `);

      expect(code.indexOf("breadcrumb.scss")).toBeLessThan(
        code.indexOf("popover.scss")
      );
    });
  });

  describe("using dynamic import", () => {
    it("can use dynamic imports", () => {
      const code = transform(
        `
        import { Popover } from 'reactstrap';
        `,
        { dynamicImport: true }
      );

      expect(code).toContain('import("bootstrap/scss/_popover.scss")');
    });
  });

  describe("adding custom imports", () => {
    it("can add custom import mappings", () => {
      const code = transform(
        `
        import { Popover } from 'reactstrap';
        `,
        {
          customImportMappings: {
            Popover: ["test.scss"],
          },
        }
      );

      expect(code).toContain('require("test.scss")');
    });
  });
});
