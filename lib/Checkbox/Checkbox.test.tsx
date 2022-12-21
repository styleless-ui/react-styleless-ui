import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsFocusEvents,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent
} from "../../tests/utils";
import Checkbox, { type RootProps } from "./Checkbox";

const labelText = "Label";

const REQUIRED_PROPS: RootProps = {
  label: labelText,
  classes: {
    label: "label",
    root: "root",
    check: "check"
  }
};

describe("Checkbox", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Checkbox, REQUIRED_PROPS);
  itSupportsStyle(Checkbox, REQUIRED_PROPS);
  itSupportsRef(Checkbox, REQUIRED_PROPS, HTMLButtonElement);
  itSupportsFocusEvents(Checkbox, REQUIRED_PROPS, "button");
  itSupportsDataSetProps(Checkbox, REQUIRED_PROPS);

  it("should have the required classNames", () => {
    render(<Checkbox {...REQUIRED_PROPS} checked />);

    const checkbox = screen.getByRole("checkbox");
    const label = checkbox.nextElementSibling;
    const check = checkbox.firstElementChild;

    expect(checkbox).toHaveClass("root");
    expect(label).toHaveClass("label");
    expect(check).toHaveClass("check");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <Checkbox {...REQUIRED_PROPS} label={{ screenReaderLabel: labelText }} />
    );

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-label",
      labelText
    );
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <Checkbox {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />
    );

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-labelledby",
      "identifier"
    );
  });

  it("renders an unchecked checkbox when `checked={false}`", () => {
    render(<Checkbox {...REQUIRED_PROPS} />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders a checked checkbox when `checked={true}`", () => {
    render(<Checkbox {...REQUIRED_PROPS} checked />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("toggles `checked` state with mouse/keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [checkedState: boolean]>();

    userEvent.setup();
    render(<Checkbox {...REQUIRED_PROPS} onChange={handleChange} />);

    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.[0]).toBe(false);

    handleChange.mockClear();

    checkbox.focus();
    expect(checkbox).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(checkbox).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.keyboard("[Space]");

    expect(checkbox).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.[0]).toBe(false);
  });

  it("supports custom check component", () => {
    render(
      <Checkbox
        {...REQUIRED_PROPS}
        checked
        checkComponent={<div data-testid="t1"></div>}
      />
    );

    expect(screen.getByTestId("t1").tagName).toBe("DIV");

    const CheckComponent = ({ className }: { className?: string }) => (
      <div data-testid="t2" className={className}></div>
    );

    render(
      <Checkbox
        {...REQUIRED_PROPS}
        checked
        checkComponent={<CheckComponent />}
      />
    );

    expect(screen.getByTestId("t2").tagName).toBe("DIV");
  });
});
