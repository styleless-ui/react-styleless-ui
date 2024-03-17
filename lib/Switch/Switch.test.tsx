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
import Switch, { type Props } from "./Switch";

const labelText = "Label";

const mockRequiredProps: Props = {
  label: { screenReaderLabel: labelText },
};

describe("Switch", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Switch, mockRequiredProps);
  itSupportsStyle(Switch, mockRequiredProps, "[role='switch']");
  itSupportsRef(Switch, mockRequiredProps, HTMLButtonElement);
  itSupportsFocusEvents(Switch, mockRequiredProps, "button");
  itSupportsDataSetProps(Switch, mockRequiredProps, "[role='switch']");

  it("should have the required classNames", () => {
    const { rerender } = render(
      <Switch
        {...mockRequiredProps}
        checked
        autoFocus
        className={({ checked, disabled, focusedVisible }) =>
          classNames("root", {
            "root--checked": checked,
            "root--disabled": disabled,
            "root--focus-visible": focusedVisible,
          })
        }
      />,
    );

    expect(screen.getByRole("switch")).toHaveClass(
      "root",
      "root--checked",
      "root--focus-visible",
    );

    rerender(
      <Switch
        {...mockRequiredProps}
        checked
        disabled
        className={({ checked, disabled, focusedVisible }) =>
          classNames("root", {
            "root--checked": checked,
            "root--disabled": disabled,
            "root--focus-visible": focusedVisible,
          })
        }
      />,
    );

    expect(screen.getByRole("switch")).toHaveClass(
      "root",
      "root--checked",
      "root--disabled",
    );
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(<Switch {...mockRequiredProps} />);

    expect(screen.getByRole("switch")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <Switch
        {...mockRequiredProps}
        label={{ labelledBy: "identifier" }}
      />,
    );

    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("renders an unchecked switch when `checked={false}`", () => {
    render(<Switch {...mockRequiredProps} />);

    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("renders a checked switch when `checked={true}`", () => {
    render(
      <Switch
        {...mockRequiredProps}
        checked
      />,
    );

    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles `checked` state with mouse/keyboard interactions and calls `onCheckedChange` callback", async () => {
    const handleCheckedChange = jest.fn<void, [checkedState: boolean]>();

    userEvent.setup();
    render(
      <Switch
        {...mockRequiredProps}
        onCheckedChange={handleCheckedChange}
      />,
    );

    const sw = screen.getByRole("switch");

    await userEvent.click(sw);

    expect(sw).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.click(sw);

    expect(sw).not.toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(2);
    expect(handleCheckedChange.mock.calls[1]?.[0]).toBe(false);

    handleCheckedChange.mockClear();

    sw.focus();
    expect(sw).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(sw).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.keyboard("[Space]");

    expect(sw).not.toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(2);
    expect(handleCheckedChange.mock.calls[1]?.[0]).toBe(false);
  });
});
