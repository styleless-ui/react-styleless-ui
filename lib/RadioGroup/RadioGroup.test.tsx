import {
  act,
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent
} from "../../tests/utils";
import Radio from "../Radio";
import RadioGroup, { type RadioGroupProps } from "./RadioGroup";

const labelText = "Label";

const REQUIRED_PROPS: RadioGroupProps = {
  label: labelText,
  classes: { label: "label", root: "root" }
};

describe("@styleless-ui/react/RadioGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(RadioGroup, REQUIRED_PROPS);
  itSupportsStyle(RadioGroup, REQUIRED_PROPS, "[role='radiogroup']");
  itSupportsRef(RadioGroup, REQUIRED_PROPS, HTMLDivElement);
  itSupportsDataSetProps(RadioGroup, REQUIRED_PROPS, "[role='radiogroup']");

  it("should have the required classNames", () => {
    render(<RadioGroup {...REQUIRED_PROPS} />);

    const group = screen.getByRole("radiogroup");
    const label = group.previousElementSibling;

    expect(group).toHaveClass("root");
    expect(label).toHaveClass("label");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <RadioGroup
        {...REQUIRED_PROPS}
        label={{ screenReaderLabel: labelText }}
      />
    );

    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-label",
      labelText
    );
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <RadioGroup {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />
    );

    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-labelledby",
      "identifier"
    );
  });

  it("selects radios with mouse interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [selectedValues: string]>();

    userEvent.setup();
    render(
      <RadioGroup {...REQUIRED_PROPS} onChange={handleChange}>
        <Radio label="item 0" value="0" />
        <Radio label="item 1" value="1" />
        <Radio label="item 2" value="2" />
        <Radio label="item 3" value="3" />
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");

    await userEvent.click(radios[0]);

    expect(radios[0]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0][0]).toBe("0");

    await userEvent.click(radios[3]);

    expect(radios[3]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1][0]).toBe("3");
  });

  it("selects radios with keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [selectedValues: string]>();

    userEvent.setup();
    render(
      <RadioGroup {...REQUIRED_PROPS} onChange={handleChange}>
        <Radio label="item 0" value="0" />
        <Radio label="item 1" value="1" />
        <Radio label="item 2" value="2" />
        <Radio label="item 3" value="3" />
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");

    act(() => void radios[0].focus());
    expect(radios[0]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(radios[0]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0][0]).toBe("0");

    act(() => void radios[3].focus());
    expect(radios[3]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(radios[3]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1][0]).toBe("3");
  });
});
