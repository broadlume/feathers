import { captureException } from "./../";

describe("ErrorTracking", () => {
  describe("captureException", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("logs the error if not in production", () => {
      const error = new Error("Oh no!");
      const logStub = jest.spyOn(console, "error").mockReturnValueOnce();

      captureException(error);

      expect(logStub).toHaveBeenCalledWith(error);
    });

    it("logs the error if not in production", () => {
      const error = new Error("Oh no!");
      const logStub = jest.spyOn(console, "error").mockReturnValueOnce();

      process.env.NODE_ENV = "production";
      captureException(error);
      process.env.NODE_ENV = "test";

      expect(logStub).not.toHaveBeenCalled();
    });
  });
});
