/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from "classnames";
import {
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
        disabled
        readOnly
        className={({ disabled, readOnly }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--readonly": readOnly,
          })
        }
      />,
    );

    expect(screen.getByRole("radiogroup")).toHaveClass(
      "root",
      "root--disabled",
      "root--readonly",
    );
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
    userEvent.setup();

    const handleValueChange = jest.fn<void, [selectedValue: string]>();
    const getRadios = () => screen.getAllByRole("radio");

    const { unmount: unmount1 } = render(
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

    await userEvent.click(getRadios()[0]!);

    expect(getRadios()[0]).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(getRadios()[1]!);

    expect(getRadios()[1]).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.click(getRadios()[2]!);

    expect(getRadios()[2]).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.join()).toBe("2");

    unmount1();
    handleValueChange.mockReset();
    const { unmount: unmount2 } = render(
      <RadioGroup
        {...mockRequiredProps}
        readOnly
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
      </RadioGroup>,
    );

    await userEvent.click(getRadios()[0]!);

    expect(getRadios()[0]).not.toBeChecked();
    expect(getRadios()[0]).not.toHaveFocus();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(getRadios()[1]!);

    expect(getRadios()[1]).not.toBeChecked();
    expect(getRadios()[1]).toHaveFocus();
    expect(handleValueChange.mock.calls.length).toBe(0);

    handleValueChange.mockReset();
    unmount2();
    render(
      <RadioGroup
        {...mockRequiredProps}
        disabled
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
      </RadioGroup>,
    );

    await userEvent.click(getRadios()[0]!);

    expect(getRadios()[0]).not.toBeChecked();
    expect(getRadios()[0]).not.toHaveFocus();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(getRadios()[1]!);

    expect(getRadios()[1]).not.toBeChecked();
    expect(getRadios()[1]).not.toHaveFocus();
    expect(handleValueChange.mock.calls.length).toBe(0);
  });

  it("selects radios with keyboard interactions and calls `onValueChange` callback", async () => {
    userEvent.setup();

    const handleValueChange = jest.fn<void, [selectedValues: string]>();
    const getRadios = () => screen.getAllByRole("radio");

    const { unmount: unmount1 } = render(
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

    await userEvent.tab();

    expect(getRadios()[0]!).not.toHaveFocus();
    expect(getRadios()[1]!).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(getRadios()[1]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.[0]).toBe("1");

    await userEvent.keyboard("[ArrowDown]");

    expect(getRadios()[2]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.[0]).toBe("2");

    await userEvent.keyboard("[Home]");

    expect(getRadios()[1]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.[0]).toBe("1");

    await userEvent.keyboard("[ArrowUp]");

    expect(getRadios()[3]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(4);
    expect(handleValueChange.mock.calls[3]?.[0]).toBe("3");

    await userEvent.keyboard("[Home]");
    await userEvent.keyboard("[End]");

    expect(getRadios()[3]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(6);
    expect(handleValueChange.mock.calls[5]?.[0]).toBe("3");

    handleValueChange.mockReset();
    unmount1();
    const { unmount: unmount2 } = render(
      <RadioGroup
        {...mockRequiredProps}
        readOnly
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

    await userEvent.tab();

    expect(getRadios()[0]!).not.toHaveFocus();
    expect(getRadios()[1]!).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(getRadios()[1]!).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.keyboard("[Enter]");

    expect(getRadios()[1]!).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.keyboard("[ArrowDown]");

    expect(getRadios()[1]!).not.toHaveFocus();
    expect(getRadios()[2]!).toHaveFocus();

    await userEvent.keyboard("[End]");

    expect(getRadios()[3]!).toHaveFocus();

    await userEvent.keyboard("[Home]");

    expect(getRadios()[1]!).toHaveFocus();

    getRadios().forEach(radio => {
      expect(radio).toHaveAttribute("aria-readonly", "true");
    });

    handleValueChange.mockReset();
    unmount2();
    render(
      <RadioGroup
        {...mockRequiredProps}
        disabled
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

    await userEvent.tab();

    expect(getRadios()[0]!).not.toHaveFocus();
    expect(getRadios()[1]!).not.toHaveFocus();

    getRadios().forEach(radio => {
      expect(radio).toBeDisabled();
    });
  });
});
