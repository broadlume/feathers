import { ErrorBoundary } from "@adhawk/react-error-boundary";

describe("ErrorBoundary", () => {
  it("is a React component", () => {
    expect(typeof ErrorBoundary.prototype.render).toBe("function");
  });
});
