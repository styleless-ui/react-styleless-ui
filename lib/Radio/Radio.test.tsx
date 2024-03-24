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
import Radio, { type Props } from "./Radio";

const labelText = "Label";

const mockRequiredProps: Props = {
  label: { screenReaderLabel: labelText },
};

describe("Radio", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Radio, mockRequiredProps);
  itSupportsStyle(Radio, mockRequiredProps);
  itSupportsRef(Radio, mockRequiredProps, HTMLButtonElement);
  itSupportsFocusEvents(Radio, mockRequiredProps, "button");
  itSupportsDataSetProps(Radio, mockRequiredProps);

  it("should have the required classNames", () => {
    const { unmount } = render(
      <Radio
        {...mockRequiredProps}
        checked
        autoFocus
        disabled
        readOnly
        className={({ checked, disabled, readOnly, focusedVisible }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--readonly": readOnly,
            "root--checked": checked,
            "root--focus-visible": focusedVisible,
          })
        }
      />,
    );

    expect(screen.getByRole("radio")).toHaveClass(
      "root",
      "root--checked",
      "root--disabled",
      "root--readonly",
    );

    unmount();
    render(
      <Radio
        {...mockRequiredProps}
        checked
        autoFocus
        readOnly
        className={({ checked, disabled, readOnly, focusedVisible }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--readonly": readOnly,
            "root--checked": checked,
            "root--focus-visible": focusedVisible,
          })
        }
      />,
    );

    expect(screen.getByRole("radio")).toHaveClass(
      "root",
      "root--checked",
      "root--focus-visible",
      "root--readonly",
    );
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(<Radio {...mockRequiredProps} />);

    expect(screen.getByRole("radio")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <Radio
        {...mockRequiredProps}
        label={{ labelledBy: "identifier" }}
      />,
    );

    expect(screen.getByRole("radio")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("renders an unchecked radio when `checked={false}`", () => {
    render(<Radio {...mockRequiredProps} />);

    expect(screen.getByRole("radio")).not.toBeChecked();
  });

  it("renders a checked radio when `checked={true}`", () => {
    render(
      <Radio
        {...mockRequiredProps}
        checked
      />,
    );

    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("toggles `checked` state from off to on with mouse/keyboard interactions and calls `onCheckedChange` callback", async () => {
    userEvent.setup();

    const handleCheckedChange = jest.fn<void, [checkedState: boolean]>();
    const getRadio = () => screen.getByRole("radio");

    const { unmount: unmount1 } = render(
      <Radio
        {...mockRequiredProps}
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.click(getRadio());

    expect(getRadio()).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    handleCheckedChange.mockClear();
    unmount1();
    const { unmount: unmount2 } = render(
      <Radio
        {...mockRequiredProps}
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.tab();

    expect(getRadio()).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(getRadio()).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    handleCheckedChange.mockReset();
    unmount2();
    const { unmount: unmount3 } = render(
      <Radio
        {...mockRequiredProps}
        readOnly
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.tab();

    expect(getRadio()).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(handleCheckedChange.mock.calls.length).toBe(0);

    await userEvent.keyboard("[Enter]");

    expect(handleCheckedChange.mock.calls.length).toBe(0);

    await userEvent.click(getRadio());

    expect(handleCheckedChange.mock.calls.length).toBe(0);

    handleCheckedChange.mockReset();
    unmount3();
    render(
      <Radio
        {...mockRequiredProps}
        disabled
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.tab();

    expect(getRadio()).not.toHaveFocus();

    await userEvent.click(getRadio());

    expect(handleCheckedChange.mock.calls.length).toBe(0);
  });
});
