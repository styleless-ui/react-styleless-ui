import classNames from "classnames";
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
import * as SpinButton from "./index";

describe("SpinButton", () => {
  afterEach(jest.clearAllMocks);

  const mockRequiredProps: SpinButton.RootProps = {
    label: { screenReaderLabel: "Label" },
    max: 100,
    min: 0,
    setValueText: v => String(v),
  };

  itShouldMount(SpinButton.Root, mockRequiredProps);
  itSupportsStyle(SpinButton.Root, mockRequiredProps);
  itSupportsRef(SpinButton.Root, mockRequiredProps, HTMLDivElement);
  itSupportsFocusEvents(
    SpinButton.Root,
    mockRequiredProps,
    "[role='spinbutton']",
  );
  itSupportsDataSetProps(SpinButton.Root, mockRequiredProps);

  it("should have the required classNames", () => {
    const { unmount } = render(
      <SpinButton.Root
        {...mockRequiredProps}
        disabled
        className={({ disabled, focusedVisible }) =>
          classNames("spinbutton", {
            "spinbutton--disabled": disabled,
            "spinbutton--focus-visible": focusedVisible,
          })
        }
      >
        <SpinButton.DecrementButton
          label={{ screenReaderLabel: "Decrement" }}
          className={({ disabled }) =>
            classNames("spinbutton__decrement", {
              "spinbutton__decrement--disabled": disabled,
            })
          }
        >
          -
        </SpinButton.DecrementButton>
        <SpinButton.IncrementButton
          label={{ screenReaderLabel: "Increment" }}
          className={({ disabled }) =>
            classNames("spinbutton__increment", {
              "spinbutton__increment--disabled": disabled,
            })
          }
        >
          +
        </SpinButton.IncrementButton>
      </SpinButton.Root>,
    );

    expect(screen.getByRole("spinbutton")).toHaveClass(
      "spinbutton",
      "spinbutton--disabled",
    );

    expect(screen.getByRole("button", { name: "Decrement" })).toHaveClass(
      "spinbutton__decrement",
      "spinbutton__decrement--disabled",
    );

    expect(screen.getByRole("button", { name: "Increment" })).toHaveClass(
      "spinbutton__increment",
      "spinbutton__increment--disabled",
    );

    unmount();
    render(
      <SpinButton.Root
        {...mockRequiredProps}
        autoFocus
        className={({ disabled, focusedVisible }) =>
          classNames("spinbutton", {
            "spinbutton--disabled": disabled,
            "spinbutton--focus-visible": focusedVisible,
          })
        }
      >
        <SpinButton.DecrementButton
          label={{ screenReaderLabel: "Decrement" }}
          className={({ disabled }) =>
            classNames("spinbutton__decrement", {
              "spinbutton__decrement--disabled": disabled,
            })
          }
        >
          -
        </SpinButton.DecrementButton>
        <SpinButton.IncrementButton
          label={{ screenReaderLabel: "Increment" }}
          className={({ disabled }) =>
            classNames("spinbutton__increment", {
              "spinbutton__increment--disabled": disabled,
            })
          }
        >
          +
        </SpinButton.IncrementButton>
      </SpinButton.Root>,
    );

    expect(screen.getByRole("spinbutton")).toHaveClass(
      "spinbutton",
      "spinbutton--focus-visible",
    );

    expect(screen.getByRole("button", { name: "Decrement" })).toHaveClass(
      "spinbutton__decrement",
    );

    expect(screen.getByRole("button", { name: "Increment" })).toHaveClass(
      "spinbutton__increment",
    );
  });

  it("should have the required aria and data attributes", () => {
    render(
      <SpinButton.Root {...mockRequiredProps}>
        <SpinButton.DecrementButton label={{ screenReaderLabel: "Decrement" }}>
          -
        </SpinButton.DecrementButton>
        <SpinButton.IncrementButton label={{ screenReaderLabel: "Increment" }}>
          +
        </SpinButton.IncrementButton>
      </SpinButton.Root>,
    );

    const root = screen.getByRole("spinbutton");

    expect(root).toHaveAttribute("aria-disabled", "false");
    expect(root).toHaveAttribute("tabindex", "0");
    expect(root).toHaveAttribute("aria-valuenow", "0");
    expect(root).toHaveAttribute("aria-valuemin", "0");
    expect(root).toHaveAttribute("aria-valuemax", "100");
    expect(root).toHaveAttribute("aria-valuetext", "0");
    expect(root).toHaveAttribute("aria-label", "Label");
    expect(root).not.toHaveAttribute("data-disabled");

    const dbtn = screen.getByRole("button", { name: "Decrement" });

    expect(dbtn).toBeDisabled();
    expect(dbtn).toHaveAttribute("tabindex", "-1");
    expect(dbtn).toHaveAttribute("aria-label", "Decrement");
    expect(dbtn).toHaveAttribute("data-disabled");

    const ibtn = screen.getByRole("button", { name: "Increment" });

    expect(ibtn).toBeEnabled();
    expect(ibtn).toHaveAttribute("tabindex", "-1");
    expect(ibtn).toHaveAttribute("aria-label", "Increment");
    expect(ibtn).not.toHaveAttribute("data-disabled");
  });

  it("should work properly with controlled value using keyboard and mouse", async () => {
    const handleValueChange = jest.fn<void, [number]>();

    render(
      <SpinButton.Root
        {...mockRequiredProps}
        autoFocus
        value={0}
        onValueChange={handleValueChange}
      >
        <SpinButton.DecrementButton label={{ screenReaderLabel: "Decrement" }}>
          -
        </SpinButton.DecrementButton>
        <SpinButton.IncrementButton label={{ screenReaderLabel: "Increment" }}>
          +
        </SpinButton.IncrementButton>
      </SpinButton.Root>,
    );

    const root = screen.getByRole("spinbutton");
    const dbtn = screen.getByRole("button", { name: "Decrement" });
    const ibtn = screen.getByRole("button", { name: "Increment" });

    expect(root).toHaveFocus();

    await userEvent.keyboard("[ArrowDown]");

    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.keyboard("[ArrowUp]");

    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toBe(1);

    await userEvent.keyboard("[PageUp]");

    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.[0]).toBe(5);

    await userEvent.keyboard("[PageDown]");

    expect(handleValueChange.mock.calls.length).toBe(2);

    await userEvent.keyboard("[End]");

    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.[0]).toBe(100);

    await userEvent.keyboard("[Home]");

    expect(handleValueChange.mock.calls.length).toBe(3);

    handleValueChange.mockReset();

    await userEvent.click(dbtn);

    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(ibtn);

    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toBe(1);
  });

  it("should work properly with uncontrolled value using keyboard and mouse", async () => {
    const handleValueChange = jest.fn<void, [number]>();

    render(
      <SpinButton.Root
        {...mockRequiredProps}
        autoFocus
        onValueChange={handleValueChange}
      >
        <SpinButton.DecrementButton label={{ screenReaderLabel: "Decrement" }}>
          -
        </SpinButton.DecrementButton>
        <SpinButton.IncrementButton label={{ screenReaderLabel: "Increment" }}>
          +
        </SpinButton.IncrementButton>
      </SpinButton.Root>,
    );

    const root = screen.getByRole("spinbutton");
    const dbtn = screen.getByRole("button", { name: "Decrement" });
    const ibtn = screen.getByRole("button", { name: "Increment" });

    expect(root).toHaveFocus();

    await userEvent.keyboard("[ArrowDown]");

    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.keyboard("[ArrowUp]");

    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toBe(1);

    await userEvent.keyboard("[PageUp]");

    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.[0]).toBe(6);

    await userEvent.keyboard("[PageDown]");

    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.[0]).toBe(1);

    await userEvent.keyboard("[PageDown]");

    expect(handleValueChange.mock.calls.length).toBe(4);
    expect(handleValueChange.mock.calls[3]?.[0]).toBe(0);

    await userEvent.keyboard("[End]");

    expect(handleValueChange.mock.calls.length).toBe(5);
    expect(handleValueChange.mock.calls[4]?.[0]).toBe(100);

    await userEvent.keyboard("[PageUp]");

    expect(handleValueChange.mock.calls.length).toBe(5);

    await userEvent.keyboard("[ArrowDown]");

    expect(handleValueChange.mock.calls.length).toBe(6);
    expect(handleValueChange.mock.calls[5]?.[0]).toBe(99);

    await userEvent.keyboard("[PageUp]");

    expect(handleValueChange.mock.calls.length).toBe(7);
    expect(handleValueChange.mock.calls[6]?.[0]).toBe(100);

    await userEvent.keyboard("[Home]");

    expect(handleValueChange.mock.calls.length).toBe(8);
    expect(handleValueChange.mock.calls[7]?.[0]).toBe(0);

    handleValueChange.mockReset();

    await userEvent.click(dbtn);

    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(ibtn);

    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toBe(1);

    await userEvent.click(dbtn);

    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.[0]).toBe(0);
  });
});
