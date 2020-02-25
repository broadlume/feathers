import DOMDataset from "@adhawk/dom-dataset";

describe("DOMDataset", () => {
  it("pulls data from a meta tag", () => {
    document.body.innerHTML = `<meta itemprop=user data-name="Jane">`;
    const domDataset = new DOMDataset("user");

    expect(domDataset.dataset.name).toBe("Jane");
  });

  it("throws a error if meta element is not found", () => {
    document.body.innerHTML = `<meta itemprop=unknown data-name="Jane">`;

    expect(() => new DOMDataset("user")).toThrowError();
  });
});
