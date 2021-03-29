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
        import { Card, Button } from 'reactstrap';
        `,
        {
          customImportMappings: {
            Card: "@franchises/bootstrap-theme/scss/_card.scss",
            Button: "@franchises/bootstrap-theme/scss/_buttons.scss",
            Navbar: "@franchises/bootstrap-theme/scss/_navbar.scss",
            Input: "@franchises/bootstrap-theme/scss/_forms.scss",
            Form: "@franchises/bootstrap-theme/scss/_forms.scss",
          },
        }
      );

      expect(code).toMatchInlineSnapshot(`
        "if (typeof window !== \\"undefined\\") {
          require(\\"bootstrap/scss/_card.scss\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"@\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"f\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"r\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"a\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"n\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"c\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"h\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"i\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"s\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"e\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"/\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"b\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"o\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"t\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"p\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"-\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"m\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"_\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"d\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\".\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"bootstrap/scss/_buttons.scss\\");
        }

        if (typeof window !== \\"undefined\\") {
          require(\\"u\\");
        }

        import { Card, Button } from 'reactstrap';"
      `);
    });
  });
});
