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
import RadioGroup, { type RootProps } from "./RadioGroup";
import * as Slots from "./slots";

const labelText = "Label";

const REQUIRED_PROPS: RootProps = {
  label: labelText,
  classes: { label: "label", root: "root", group: "group" }
};

describe("RadioGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(RadioGroup, REQUIRED_PROPS);
  itSupportsStyle(RadioGroup, REQUIRED_PROPS);
  itSupportsRef(RadioGroup, REQUIRED_PROPS, HTMLDivElement);
  itSupportsDataSetProps(RadioGroup, REQUIRED_PROPS);

  it("should have the required classNames", () => {
    render(<RadioGroup {...REQUIRED_PROPS} />);

    const group = screen.getByRole("radiogroup");
    const root = group.parentElement;
    const label = root?.querySelector(`[data-slot='${Slots.Label}']`);

    expect(root).toHaveClass("root");
    expect(group).toHaveClass("group");
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
        <Radio label="item 0" value="0" disabled />
        <Radio label="item 1" value="1" />
        <Radio label="item 2" value="2" />
        <Radio label="item 3" value="3" />
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");

    if (radios[0]) {
      await userEvent.click(radios[0]);

      expect(radios[0]).not.toBeChecked();
      expect(handleChange.mock.calls.length).toBe(0);
    }

    if (radios[1]) {
      await userEvent.click(radios[1]);

      expect(radios[1]).toBeChecked();
      expect(handleChange.mock.calls.length).toBe(1);
      expect(handleChange.mock.calls[0]?.join()).toBe("1");
    }

    if (radios[2]) {
      await userEvent.click(radios[2]);

      expect(radios[2]).toBeChecked();
      expect(handleChange.mock.calls.length).toBe(2);
      expect(handleChange.mock.calls[1]?.join()).toBe("2");
    }
  });

  it("selects radios with keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [selectedValues: string]>();

    userEvent.setup();
    render(
      <RadioGroup {...REQUIRED_PROPS} onChange={handleChange}>
        <Radio label="item 0" value="0" disabled />
        <Radio label="item 1" value="1" />
        <Radio label="item 2" value="2" />
        <Radio label="item 3" value="3" />
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");

    act(() => void radios[0]?.focus());
    await userEvent.keyboard("[Space]");

    expect(radios[0]).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.tab();
    expect(radios[1]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(radios[1]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.keyboard("[ArrowDown]");
    expect(radios[2]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(radios[2]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("2");
  });
});
