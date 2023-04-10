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
        active
        disabled
        className={({ active, disabled, focusedVisible }) =>
          cls("toggle", {
            "toggle--active": active,
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
    expect(toggle).toHaveClass("toggle", "toggle--active", "toggle--disabled");

    rerender(
      <Toggle
        active
        className={({ active, disabled, focusedVisible }) =>
          cls("toggle", {
            "toggle--active": active,
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
      "toggle--active",
      "toggle--focus-visible",
    );
  });

  it("renders an unpressed toggle when `active={false}`", () => {
    const { unmount: u1 } = render(<Toggle>Toggle</Toggle>);

    expect(screen.getByRole("button")).not.toHaveAttribute("data-active");

    u1();
    const { unmount: u2 } = render(
      <Toggle defaultActive={false}>Toggle</Toggle>,
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("data-active");

    u2();
    render(<Toggle active={false}>Toggle</Toggle>);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-active");
  });

  it("renders a pressed toggle when `active={true}`", () => {
    const { unmount: u1 } = render(<Toggle active={true}>Toggle</Toggle>);

    expect(screen.getByRole("button")).toHaveAttribute("data-active");

    u1();
    render(<Toggle defaultActive={true}>Toggle</Toggle>);
    expect(screen.getByRole("button")).toHaveAttribute("data-active");
  });

  it("toggles `active` state with mouse/keyboard interactions and calls `onActiveChange` callback", async () => {
    const handleActiveChange = jest.fn<void, [activeState: boolean]>();

    userEvent.setup();
    render(<Toggle onActiveChange={handleActiveChange}>Toggle</Toggle>);

    const toggle = screen.getByRole("button");

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("data-active");
    expect(handleActiveChange.mock.calls.length).toBe(1);
    expect(handleActiveChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.click(toggle);

    expect(toggle).not.toHaveAttribute("data-active");
    expect(handleActiveChange.mock.calls.length).toBe(2);
    expect(handleActiveChange.mock.calls[1]?.[0]).toBe(false);

    handleActiveChange.mockClear();

    toggle.focus();
    expect(toggle).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggle).toHaveAttribute("data-active");
    expect(handleActiveChange.mock.calls.length).toBe(1);
    expect(handleActiveChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.keyboard("[Enter]");

    expect(toggle).not.toHaveAttribute("data-active");
    expect(handleActiveChange.mock.calls.length).toBe(2);
    expect(handleActiveChange.mock.calls[1]?.[0]).toBe(false);
  });
});
