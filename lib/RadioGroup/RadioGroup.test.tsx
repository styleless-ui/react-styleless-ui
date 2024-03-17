/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  act,
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
} from "../../tests/utils";
import Radio from "../Radio";
import RadioGroup, { type Props } from "./RadioGroup";

const labelText = "Label";

const mockRequiredProps: Props = {
  label: { screenReaderLabel: labelText },
};

describe("RadioGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(RadioGroup, mockRequiredProps);
  itSupportsStyle(RadioGroup, mockRequiredProps, "[role='radiogroup']");
  itSupportsRef(RadioGroup, mockRequiredProps, HTMLDivElement);
  itSupportsDataSetProps(RadioGroup, mockRequiredProps, "[role='radiogroup']");

  it("should have the required classNames", () => {
    render(
      <RadioGroup
        {...mockRequiredProps}
        className="root"
      />,
    );

    const root = screen.getByRole("radiogroup");

    expect(root).toHaveClass("root");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(<RadioGroup {...mockRequiredProps} />);

    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-label",
      labelText,
    );
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <RadioGroup
        {...mockRequiredProps}
        label={{ labelledBy: "identifier" }}
      />,
    );

    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("selects radios with mouse interactions and calls `onValueChange` callback", async () => {
    const handleValueChange = jest.fn<void, [selectedValues: string]>();

    userEvent.setup();
    render(
      <RadioGroup
        {...mockRequiredProps}
        onValueChange={handleValueChange}
      >
        <Radio
          label={{ screenReaderLabel: "item 0" }}
          value="0"
          disabled
        />
        <Radio
          label={{ screenReaderLabel: "item 1" }}
          value="1"
        />
        <Radio
          label={{ screenReaderLabel: "item 2" }}
          value="2"
        />
        <Radio
          label={{ screenReaderLabel: "item 3" }}
          value="3"
        />
      </RadioGroup>,
    );

    const radios = screen.getAllByRole("radio");

    expect(radios[0]).not.toBeUndefined();
    expect(radios[1]).not.toBeUndefined();
    expect(radios[2]).not.toBeUndefined();

    await userEvent.click(radios[0]!);

    expect(radios[0]).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(radios[1]!);

    expect(radios[1]).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.click(radios[2]!);

    expect(radios[2]).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.join()).toBe("2");
  });

  it("selects radios with keyboard interactions and calls `onValueChange` callback", async () => {
    const handleValueChange = jest.fn<void, [selectedValues: string]>();

    userEvent.setup();
    render(
      <RadioGroup
        {...mockRequiredProps}
        onValueChange={handleValueChange}
      >
        <Radio
          label={{ screenReaderLabel: "item 0" }}
          value="0"
          disabled
        />
        <Radio
          label={{ screenReaderLabel: "item 1" }}
          value="1"
        />
        <Radio
          label={{ screenReaderLabel: "item 2" }}
          value="2"
        />
        <Radio
          label={{ screenReaderLabel: "item 3" }}
          value="3"
        />
      </RadioGroup>,
    );

    const radios = screen.getAllByRole("radio");

    act(() => void radios[0]?.focus());
    await userEvent.keyboard("[Space]");

    expect(radios[0]).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.tab();
    expect(radios[1]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(radios[1]).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.keyboard("[ArrowDown]");
    expect(radios[2]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(radios[2]).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.join()).toBe("2");
  });
});
