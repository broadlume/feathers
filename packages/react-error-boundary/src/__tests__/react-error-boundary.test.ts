import { ErrorBoundary } from "./../";

describe("ErrorBoundary", () => {
  it("is a React component", () => {
    expect(typeof ErrorBoundary.prototype.render).toBe("function");
  });
});
