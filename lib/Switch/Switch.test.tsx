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
import Switch, { SwitchProps } from "./Switch";

const labelText = "Label";

const REQUIRED_PROPS: SwitchProps = {
  label: labelText,
  thumbComponent: <div />,
  trackComponent: <div />,
  classes: {
    label: "label",
    root: "root",
    thumb: "thumb",
    track: "track"
  }
};

describe("@styleless-ui/react/Switch", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Switch, REQUIRED_PROPS);
  itSupportsStyle(Switch, REQUIRED_PROPS, "[role='switch']");
  itSupportsRef(Switch, REQUIRED_PROPS, HTMLButtonElement);
  itSupportsFocusEvents(Switch, REQUIRED_PROPS, "button");
  itSupportsDataSetProps(Switch, REQUIRED_PROPS, "[role='switch']");

  it("should have the required classNames", () => {
    render(<Switch {...REQUIRED_PROPS} checked />);

    const sw = screen.getByRole("switch");
    const label = sw.previousElementSibling;
    const track = sw.firstElementChild;
    const thumb = sw.lastElementChild;

    expect(sw).toHaveClass("root");
    expect(label).toHaveClass("label");
    expect(track).toHaveClass("track");
    expect(thumb).toHaveClass("thumb");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <Switch {...REQUIRED_PROPS} label={{ screenReaderLabel: labelText }} />
    );

    expect(screen.getByRole("switch")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(<Switch {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />);

    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-labelledby",
      "identifier"
    );
  });

  it("renders an unchecked switch when `checked={false}`", () => {
    render(<Switch {...REQUIRED_PROPS} />);

    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("renders a checked switch when `checked={true}`", () => {
    render(<Switch {...REQUIRED_PROPS} checked />);

    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles `checked` state with mouse/keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [checkedState: boolean]>();

    userEvent.setup();
    render(<Switch {...REQUIRED_PROPS} onChange={handleChange} />);

    const sw = screen.getByRole("switch");

    await userEvent.click(sw);

    expect(sw).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0][0]).toBe(true);

    await userEvent.click(sw);

    expect(sw).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1][0]).toBe(false);

    handleChange.mockClear();

    sw.focus();
    expect(sw).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(sw).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0][0]).toBe(true);

    await userEvent.keyboard("[Space]");

    expect(sw).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1][0]).toBe(false);
  });

  it("supports custom thumb component", () => {
    render(
      <Switch
        {...REQUIRED_PROPS}
        checked
        thumbComponent={<div data-testid="t1"></div>}
      />
    );

    expect(screen.getByTestId("t1").tagName).toBe("DIV");

    const ThumbComponent = ({ className }: { className?: string }) => (
      <div data-testid="t2" className={className}></div>
    );

    render(
      <Switch {...REQUIRED_PROPS} checked thumbComponent={<ThumbComponent />} />
    );

    expect(screen.getByTestId("t2").tagName).toBe("DIV");
  });

  it("supports custom track component", () => {
    render(
      <Switch
        {...REQUIRED_PROPS}
        checked
        trackComponent={<div data-testid="t1"></div>}
      />
    );

    expect(screen.getByTestId("t1").tagName).toBe("DIV");

    const TrackComponent = ({ className }: { className?: string }) => (
      <div data-testid="t2" className={className}></div>
    );

    render(
      <Switch {...REQUIRED_PROPS} checked trackComponent={<TrackComponent />} />
    );

    expect(screen.getByTestId("t2").tagName).toBe("DIV");
  });
});
