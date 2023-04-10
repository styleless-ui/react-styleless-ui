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
import Radio, { type RootProps } from "./Radio";

const labelText = "Label";

const REQUIRED_PROPS: RootProps = {
  label: labelText,
  classes: {
    label: "label",
    root: "root",
    check: "check",
  },
};

describe("Radio", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Radio, REQUIRED_PROPS);
  itSupportsStyle(Radio, REQUIRED_PROPS);
  itSupportsRef(Radio, REQUIRED_PROPS, HTMLButtonElement);
  itSupportsFocusEvents(Radio, REQUIRED_PROPS, "button");
  itSupportsDataSetProps(Radio, REQUIRED_PROPS);

  it("should have the required classNames", () => {
    render(<Radio {...REQUIRED_PROPS} checked />);

    const radio = screen.getByRole("radio");
    const label = radio.nextElementSibling;
    const check = radio.firstElementChild;

    expect(radio).toHaveClass("root");
    expect(label).toHaveClass("label");
    expect(check).toHaveClass("check");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <Radio {...REQUIRED_PROPS} label={{ screenReaderLabel: labelText }} />,
    );

    expect(screen.getByRole("radio")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(<Radio {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />);

    expect(screen.getByRole("radio")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("renders an unchecked radio when `checked={false}`", () => {
    render(<Radio {...REQUIRED_PROPS} />);

    expect(screen.getByRole("radio")).not.toBeChecked();
  });

  it("renders a checked radio when `checked={true}`", () => {
    render(<Radio {...REQUIRED_PROPS} checked />);

    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("toggles `checked` state from off to on with mouse/keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [checkedState: boolean]>();

    userEvent.setup();
    const { unmount } = render(
      <Radio {...REQUIRED_PROPS} onChange={handleChange} />,
    );

    let radio = screen.getByRole("radio");

    await userEvent.click(radio);

    expect(radio).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.[0]).toBe(true);

    handleChange.mockClear();
    unmount();
    render(<Radio {...REQUIRED_PROPS} onChange={handleChange} />);

    radio = screen.getByRole("radio");

    radio.focus();
    expect(radio).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(radio).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.[0]).toBe(true);
  });

  it("supports custom check component", () => {
    render(
      <Radio
        {...REQUIRED_PROPS}
        checked
        checkComponent={<div data-testid="t1"></div>}
      />,
    );

    expect(screen.getByTestId("t1").tagName).toBe("DIV");

    const CheckComponent = ({ className }: { className?: string }) => (
      <div data-testid="t2" className={className}></div>
    );

    render(
      <Radio {...REQUIRED_PROPS} checked checkComponent={<CheckComponent />} />,
    );

    expect(screen.getByTestId("t2").tagName).toBe("DIV");
  });
});
