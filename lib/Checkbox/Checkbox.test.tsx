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
import Checkbox, { type Props } from "./Checkbox";

const labelText = "Label";

const mockRequiredProps: Props = {
  label: { screenReaderLabel: labelText },
};

describe("Checkbox", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Checkbox, mockRequiredProps);
  itSupportsStyle(Checkbox, mockRequiredProps);
  itSupportsRef(Checkbox, mockRequiredProps, HTMLButtonElement);
  itSupportsFocusEvents(Checkbox, mockRequiredProps, "button");
  itSupportsDataSetProps(Checkbox, mockRequiredProps);

  it("should have the required classNames", () => {
    const { rerender } = render(
      <Checkbox
        {...mockRequiredProps}
        checked
        autoFocus
        className={({ checked, disabled, focusedVisible, indeterminated }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--checked": checked,
            "root--focus-visible": focusedVisible,
            "root--indeterminated": indeterminated,
          })
        }
      />,
    );

    const root = screen.getByRole("checkbox");

    expect(root).toHaveClass("root", "root--checked", "root--focus-visible");

    rerender(
      <Checkbox
        {...mockRequiredProps}
        checked
        autoFocus
        disabled
        className={({ checked, disabled, focusedVisible, indeterminated }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--checked": checked,
            "root--focus-visible": focusedVisible,
            "root--indeterminated": indeterminated,
          })
        }
      />,
    );

    expect(root).toHaveClass("root", "root--checked", "root--disabled");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(<Checkbox {...mockRequiredProps} />);

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-label",
      labelText,
    );
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <Checkbox
        {...mockRequiredProps}
        label={{ labelledBy: "identifier" }}
      />,
    );

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("renders a mixed checkbox with correct behavior", async () => {
    userEvent.setup();
    render(
      <Checkbox
        {...mockRequiredProps}
        indeterminated
        aria-controls="id1 id2"
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();
    // eslint-disable-next-line jest-dom/prefer-checked
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("renders an unchecked checkbox when `checked={false}`", () => {
    render(<Checkbox {...mockRequiredProps} />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders a checked checkbox when `checked={true}`", () => {
    render(
      <Checkbox
        {...mockRequiredProps}
        checked
      />,
    );

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("toggles `checked` state with mouse/keyboard interactions and calls `onCheckedChange` callback", async () => {
    const handleCheckedChange = jest.fn<void, [checkedState: boolean]>();

    userEvent.setup();
    render(
      <Checkbox
        {...mockRequiredProps}
        onCheckedChange={handleCheckedChange}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(2);
    expect(handleCheckedChange.mock.calls[1]?.[0]).toBe(false);

    handleCheckedChange.mockClear();

    checkbox.focus();
    expect(checkbox).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(checkbox).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.keyboard("[Space]");

    expect(checkbox).not.toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(2);
    expect(handleCheckedChange.mock.calls[1]?.[0]).toBe(false);
  });
});
