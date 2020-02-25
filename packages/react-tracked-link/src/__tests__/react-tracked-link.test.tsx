import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { TrackedLink } from "@adhawk/react-tracked-link";

function wait() {
  return new Promise(resolve => setTimeout(resolve, 10));
}

describe("TrackedLink", () => {
  beforeEach(() => {
    // @ts-ignore
    jsdom.reconfigure({
      url: "https://www.example.com/",
    });

    // @ts-ignore
    window.analytics = {
      track: jest
        .fn()
        .mockImplementation(
          (_eventName: string, _eventProperties: object, cb: Function) => {
            setTimeout(cb, 1);
          },
        ),
    };
  });

  it("is a React component", () => {
    expect(typeof TrackedLink.prototype.render).toBe("function");
  });

  it("triggers analytics.track", async () => {
    const comp = render(
      <TrackedLink
        href="#foobar"
        eventName="Test Name"
        eventProperties={{ foo: "bar" }}
      >
        Click Me
      </TrackedLink>,
    );

    fireEvent.click(comp.container.querySelector("a"));

    expect(window.analytics.track).toHaveBeenCalledWith(
      "Test Name",
      { foo: "bar" },
      expect.anything(),
    );
  });
  it("navigates in the callback", async () => {
    //@ts-ignore
    const comp = render(
      <TrackedLink
        href="#foobar"
        eventName="Test Name"
        eventProperties={{ foo: "bar" }}
      >
        Click Me
      </TrackedLink>,
    );

    fireEvent.click(comp.container.querySelector("a"));

    await wait();

    expect(window.location.href).toContain("#foobar");
  });

  it("warns when analytics is not found", async () => {
    delete window.analytics;
    const stub = jest.spyOn(console, "warn").mockReturnValue();

    const comp = render(
      <TrackedLink
        href="#foobar"
        eventName="Test Name"
        eventProperties={{ foo: "bar" }}
      >
        Click Me
      </TrackedLink>,
    );

    fireEvent.click(comp.container.querySelector("a"));
    expect(stub).toHaveBeenCalled();
    stub.mockRestore();
  });

  it("navigates normally when analytics is not found", async () => {
    delete window.analytics;
    const stub = jest.spyOn(console, "warn").mockReturnValue();

    const comp = render(
      <TrackedLink
        href="#foobar"
        eventName="Test Name"
        eventProperties={{ foo: "bar" }}
      >
        Click Me
      </TrackedLink>,
    );

    fireEvent.click(comp.container.querySelector("a"));
    expect(location.href).toContain("#foobar");
    stub.mockRestore();
  });

  it("shows the link text", async () => {
    const comp = render(
      <TrackedLink
        href="#foobar"
        eventName="Test Name"
        eventProperties={{ foo: "bar" }}
      >
        Click Me
      </TrackedLink>,
    );

    expect(comp.container).toMatchInlineSnapshot(`
      <div>
        <a
          href="#foobar"
        >
          Click Me
        </a>
      </div>
    `);
  });

  it("shows passes along props", async () => {
    const comp = render(
      <TrackedLink
        href="#foobar"
        rel="noopener"
        eventName="Test Name"
        eventProperties={{ foo: "bar" }}
      >
        Click Me
      </TrackedLink>,
    );

    expect(comp.container.innerHTML).toContain('rel="noopener"');
  });
});
