import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary, LoadFailed } from "./ErrorBoundary";

const Boom = () => {
  throw new Error("боом");
};

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

describe("ErrorBoundary", () => {
  it("показва децата, когато няма грешка", () => {
    render(<ErrorBoundary fallback="грешка">ок</ErrorBoundary>);
    expect(screen.getByText("ок")).toBeInTheDocument();
  });

  it("показва fallback и вика onError", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary fallback={<p>fallback</p>} onError={onError}>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText("fallback")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "боом" }));
  });

  it("fallback може да е функция с възможност за нов опит", async () => {
    let shouldThrow = true;
    const Maybe = () => (shouldThrow ? <Boom /> : <p>вече работи</p>);
    render(
      <ErrorBoundary fallback={(err, reset) => <button onClick={reset}>опитай пак ({err.message})</button>}>
        <Maybe />
      </ErrorBoundary>
    );
    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: /опитай пак \(боом\)/ }));
    expect(screen.getByText("вече работи")).toBeInTheDocument();
  });

  it("без fallback не показва нищо", () => {
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("LoadFailed", () => {
  it("показва съобщение (role=alert) и бутон за презареждане", async () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    render(<LoadFailed message="Не успяхме" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Не успяхме");
    await userEvent.click(screen.getByRole("button", { name: "Презареди" }));
    expect(reload).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
