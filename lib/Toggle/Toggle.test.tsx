import cls from "classnames";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsFocusEvents,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
} from "../../tests/utils";
import Toggle from "./Toggle";

describe("Toggle", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Toggle, { children: "Toggle" });
  itSupportsStyle(Toggle, { children: "Toggle" });
  itSupportsRef(Toggle, { children: "Toggle" }, HTMLButtonElement);
  itSupportsFocusEvents(Toggle, { children: "Toggle" }, "button");
  itSupportsDataSetProps(Toggle, { children: "Toggle" });

  it("should have the required classNames", async () => {
    const { rerender } = render(
      <Toggle
        pressed
        disabled
        className={({ pressed, disabled, focusedVisible }) =>
          cls("toggle", {
            "toggle--pressed": pressed,
            "toggle--disabled": disabled,
            "toggle--focus-visible": focusedVisible,
          })
        }
      >
        Toggle
      </Toggle>,
    );

    const toggle = screen.getByRole("button");

    await userEvent.tab();

    expect(toggle).not.toHaveFocus();
    expect(toggle).toHaveClass("toggle", "toggle--pressed", "toggle--disabled");

    rerender(
      <Toggle
        pressed
        className={({ pressed, disabled, focusedVisible }) =>
          cls("toggle", {
            "toggle--pressed": pressed,
            "toggle--disabled": disabled,
            "toggle--focus-visible": focusedVisible,
          })
        }
      >
        Toggle
      </Toggle>,
    );

    await userEvent.tab();
    expect(toggle).toHaveClass(
      "toggle",
      "toggle--pressed",
      "toggle--focus-visible",
    );
  });

  it("renders an unpressed toggle when `pressed={false}`", () => {
    const { unmount: u1 } = render(<Toggle>Toggle</Toggle>);

    expect(screen.getByRole("button")).not.toHaveAttribute("data-pressed");

    u1();
    const { unmount: u2 } = render(
      <Toggle defaultPressed={false}>Toggle</Toggle>,
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("data-pressed");

    u2();
    render(<Toggle pressed={false}>Toggle</Toggle>);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-pressed");
  });

  it("renders a pressed toggle when `pressed={true}`", () => {
    const { unmount: u1 } = render(<Toggle pressed={true}>Toggle</Toggle>);

    expect(screen.getByRole("button")).toHaveAttribute("data-pressed");

    u1();
    render(<Toggle defaultPressed={true}>Toggle</Toggle>);
    expect(screen.getByRole("button")).toHaveAttribute("data-pressed");
  });

  it("toggles `pressed` state with mouse/keyboard interactions and calls `onActiveChange` callback", async () => {
    const handlePressedChange = jest.fn<void, [pressed: boolean]>();

    userEvent.setup();
    render(<Toggle onPressedChange={handlePressedChange}>Toggle</Toggle>);

    const toggle = screen.getByRole("button");

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("data-pressed");
    expect(handlePressedChange.mock.calls.length).toBe(1);
    expect(handlePressedChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.click(toggle);

    expect(toggle).not.toHaveAttribute("data-pressed");
    expect(handlePressedChange.mock.calls.length).toBe(2);
    expect(handlePressedChange.mock.calls[1]?.[0]).toBe(false);

    handlePressedChange.mockClear();

    toggle.focus();
    expect(toggle).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggle).toHaveAttribute("data-pressed");
    expect(handlePressedChange.mock.calls.length).toBe(1);
    expect(handlePressedChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.keyboard("[Enter]");

    expect(toggle).not.toHaveAttribute("data-pressed");
    expect(handlePressedChange.mock.calls.length).toBe(2);
    expect(handlePressedChange.mock.calls[1]?.[0]).toBe(false);
  });
});
