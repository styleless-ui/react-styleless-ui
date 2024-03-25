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
import Toggle from "../Toggle";
import ToggleGroup, { type Props } from "./ToggleGroup";

const labelText = "Label";

describe("ToggleGroup", () => {
  afterEach(jest.clearAllMocks);

  const mockRequiredProps: Props = {
    multiple: false,
    label: { screenReaderLabel: labelText },
  };

  itShouldMount(ToggleGroup, mockRequiredProps);
  itSupportsStyle(ToggleGroup, mockRequiredProps);
  itSupportsRef(ToggleGroup, mockRequiredProps, HTMLDivElement);
  itSupportsDataSetProps(ToggleGroup, mockRequiredProps);

  it("should have the required classNames", () => {
    render(
      <ToggleGroup
        {...mockRequiredProps}
        className="toggle-group"
      >
        <Toggle
          value="0"
          disabled
        >
          Item 0
        </Toggle>
        <Toggle value="1">Item 1</Toggle>
        <Toggle value="2">Item 2</Toggle>
      </ToggleGroup>,
    );

    expect(screen.getByRole("group")).toHaveClass("toggle-group");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <ToggleGroup
        {...mockRequiredProps}
        label={{ screenReaderLabel: labelText }}
      />,
    );

    expect(screen.getByRole("group")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <ToggleGroup
        {...mockRequiredProps}
        label={{ labelledBy: "identifier" }}
      />,
    );

    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("toggles `value` state with mouse interactions and calls `onValueChange` callback", async () => {
    const handleValueChange = jest.fn<void, [activeItems: string | string[]]>();

    userEvent.setup();
    const { unmount } = render(
      <ToggleGroup
        {...mockRequiredProps}
        onValueChange={handleValueChange}
      >
        <Toggle
          value="0"
          disabled
        >
          Item 0
        </Toggle>
        <Toggle value="1">Item 1</Toggle>
        <Toggle value="2">Item 2</Toggle>
      </ToggleGroup>,
    );

    let toggles = screen.getAllByRole("button");

    expect(toggles[0]).not.toBeUndefined();
    expect(toggles[1]).not.toBeUndefined();
    expect(toggles[2]).not.toBeUndefined();

    await userEvent.click(toggles[0]!);

    expect(toggles[0]).not.toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(toggles[1]!);

    expect(toggles[1]).toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.click(toggles[1]!);

    expect(toggles[1]).not.toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.join()).toBe("");

    await userEvent.click(toggles[1]!);

    expect(toggles[1]).toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.join()).toBe("1");

    await userEvent.click(toggles[2]!);

    expect(toggles[2]).toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(4);
    expect(handleValueChange.mock.calls[3]?.join()).toBe("2");

    unmount();
    handleValueChange.mockReset();
    userEvent.setup();
    render(
      <ToggleGroup
        label={{ screenReaderLabel: labelText }}
        multiple
        onValueChange={handleValueChange}
      >
        <Toggle
          value="0"
          disabled
        >
          Item 0
        </Toggle>
        <Toggle value="1">Item 1</Toggle>
        <Toggle value="2">Item 2</Toggle>
      </ToggleGroup>,
    );

    toggles = screen.getAllByRole("button");

    expect(toggles[0]).not.toBeUndefined();
    expect(toggles[1]).not.toBeUndefined();
    expect(toggles[2]).not.toBeUndefined();

    await userEvent.click(toggles[0]!);

    expect(toggles[0]).not.toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(toggles[1]!);

    expect(toggles[1]).toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.click(toggles[2]!);

    expect(toggles[2]).toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.join()).toBe("1,2");

    await userEvent.click(toggles[2]!);

    expect(toggles[2]).not.toHaveAttribute("data-pressed");
    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.join()).toBe("1");
  });

  it("toggles `value` state with keyboard interactions and calls `onValueChange` callback", async () => {
    const handleChange = jest.fn<void, [activeItems: string | string[]]>();

    userEvent.setup();
    const { unmount } = render(
      <ToggleGroup
        {...mockRequiredProps}
        onValueChange={handleChange}
      >
        <Toggle
          value="0"
          disabled
        >
          Item 0
        </Toggle>
        <Toggle value="1">Item 1</Toggle>
        <Toggle value="2">Item 2</Toggle>
      </ToggleGroup>,
    );

    let toggles = screen.getAllByRole("button");

    act(() => void toggles[0]?.focus());
    await userEvent.keyboard("[Space]");

    expect(toggles[0]).not.toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.tab();
    expect(toggles[1]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggles[1]).toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.keyboard("[Enter]");

    expect(toggles[1]).not.toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("");

    await userEvent.keyboard("[Space]");

    expect(toggles[1]).toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("1");

    await userEvent.keyboard("[ArrowRight]");
    expect(toggles[2]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggles[2]).toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(4);
    expect(handleChange.mock.calls[3]?.join()).toBe("2");

    unmount();
    handleChange.mockReset();
    userEvent.setup();
    render(
      <ToggleGroup
        multiple
        label={{ screenReaderLabel: labelText }}
        onValueChange={handleChange}
      >
        <Toggle
          value="0"
          disabled
        >
          Item 0
        </Toggle>
        <Toggle value="1">Item 1</Toggle>
        <Toggle value="2">Item 2</Toggle>
      </ToggleGroup>,
    );

    toggles = screen.getAllByRole("button");

    act(() => void toggles[0]?.focus());
    await userEvent.keyboard("[Space]");

    expect(toggles[0]).not.toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.tab();
    expect(toggles[1]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggles[1]).toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.keyboard("[ArrowRight]");

    expect(toggles[2]).not.toHaveFocus();
    expect(toggles[1]).toHaveFocus();

    await userEvent.tab();
    await userEvent.keyboard("[Space]");

    expect(toggles[2]).toHaveFocus();
    expect(toggles[2]).toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("1,2");

    await userEvent.keyboard("[Enter]");

    expect(toggles[2]).not.toHaveAttribute("data-pressed");
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("1");
  });
});
