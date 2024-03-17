import classNames from "classnames";
import {
  act,
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
    const { rerender } = render(
      <Radio
        {...mockRequiredProps}
        checked
        autoFocus
        className={({ checked, disabled, focusedVisible }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--checked": checked,
            "root--focus-visible": focusedVisible,
          })
        }
      />,
    );

    const root = screen.getByRole("radio");

    expect(root).toHaveClass("root", "root--checked", "root--focus-visible");

    rerender(
      <Radio
        {...mockRequiredProps}
        checked
        disabled
        autoFocus
        className={({ checked, disabled, focusedVisible }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--checked": checked,
            "root--focus-visible": focusedVisible,
          })
        }
      />,
    );

    expect(root).toHaveClass("root", "root--checked", "root--disabled");
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

  it("toggles `checked` state from off to on with mouse/keyboard interactions and calls `onChange` callback", async () => {
    const handleCheckedChange = jest.fn<void, [checkedState: boolean]>();

    userEvent.setup();
    const { unmount } = render(
      <Radio
        {...mockRequiredProps}
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.click(screen.getByRole("radio"));

    expect(screen.getByRole("radio")).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    handleCheckedChange.mockClear();
    unmount();
    render(
      <Radio
        {...mockRequiredProps}
        onCheckedChange={handleCheckedChange}
      />,
    );

    act(() => void screen.getByRole("radio").focus());

    expect(screen.getByRole("radio")).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(screen.getByRole("radio")).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);
  });
});
