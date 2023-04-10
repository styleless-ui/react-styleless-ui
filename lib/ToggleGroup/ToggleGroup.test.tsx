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
import * as Slots from "./slots";
import ToggleGroup from "./ToggleGroup";

const labelText = "Label";

describe("CheckGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(ToggleGroup, { label: labelText });
  itSupportsStyle(ToggleGroup, { label: labelText });
  itSupportsRef(ToggleGroup, { label: labelText }, HTMLDivElement);
  itSupportsDataSetProps(ToggleGroup, { label: labelText });

  it("should have the required classNames", () => {
    render(
      <ToggleGroup
        label={labelText}
        classes={{
          label: "toggle-group__label",
          group: "toggle-group__group",
          root: "toggle-group",
        }}
      >
        <Toggle value="0" disabled>
          Item 0
        </Toggle>
        <Toggle value="1">Item 1</Toggle>
        <Toggle value="2">Item 2</Toggle>
      </ToggleGroup>,
    );

    const group = screen.getByRole("group");
    const root = group.parentElement;
    const label = root?.querySelector(`[data-slot='${Slots.Label}']`);

    expect(root).toHaveClass("toggle-group");
    expect(group).toHaveClass("toggle-group__group");
    expect(label).toHaveClass("toggle-group__label");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(<ToggleGroup label={{ screenReaderLabel: labelText }} />);

    expect(screen.getByRole("group")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(<ToggleGroup label={{ labelledBy: "identifier" }} />);

    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("toggles `value` state with mouse interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [activeItems: string | string[]]>();

    userEvent.setup();
    const { unmount } = render(
      <ToggleGroup label={labelText} onChange={handleChange}>
        <Toggle value="0" disabled>
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

    expect(toggles[0]).not.toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.click(toggles[1]!);

    expect(toggles[1]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.click(toggles[1]!);

    expect(toggles[1]).not.toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("");

    await userEvent.click(toggles[1]!);

    expect(toggles[1]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("1");

    await userEvent.click(toggles[2]!);

    expect(toggles[2]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(4);
    expect(handleChange.mock.calls[3]?.join()).toBe("2");

    unmount();
    handleChange.mockReset();
    userEvent.setup();
    render(
      <ToggleGroup multiple label={labelText} onChange={handleChange}>
        <Toggle value="0" disabled>
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

    expect(toggles[0]).not.toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.click(toggles[1]!);

    expect(toggles[1]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.click(toggles[2]!);

    expect(toggles[2]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("1,2");

    await userEvent.click(toggles[2]!);

    expect(toggles[2]).not.toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("1");
  });

  it("toggles `value` state with keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [activeItems: string | string[]]>();

    userEvent.setup();
    const { unmount } = render(
      <ToggleGroup label={labelText} onChange={handleChange}>
        <Toggle value="0" disabled>
          Item 0
        </Toggle>
        <Toggle value="1">Item 1</Toggle>
        <Toggle value="2">Item 2</Toggle>
      </ToggleGroup>,
    );

    let toggles = screen.getAllByRole("button");

    act(() => void toggles[0]?.focus());
    await userEvent.keyboard("[Space]");

    expect(toggles[0]).not.toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.tab();
    expect(toggles[1]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggles[1]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.keyboard("[Enter]");

    expect(toggles[1]).not.toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("");

    await userEvent.keyboard("[Space]");

    expect(toggles[1]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("1");

    await userEvent.keyboard("[ArrowRight]");
    expect(toggles[2]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggles[2]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(4);
    expect(handleChange.mock.calls[3]?.join()).toBe("2");

    unmount();
    handleChange.mockReset();
    userEvent.setup();
    render(
      <ToggleGroup multiple label={labelText} onChange={handleChange}>
        <Toggle value="0" disabled>
          Item 0
        </Toggle>
        <Toggle value="1">Item 1</Toggle>
        <Toggle value="2">Item 2</Toggle>
      </ToggleGroup>,
    );

    toggles = screen.getAllByRole("button");

    act(() => void toggles[0]?.focus());
    await userEvent.keyboard("[Space]");

    expect(toggles[0]).not.toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.tab();
    expect(toggles[1]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggles[1]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.keyboard("[ArrowRight]");
    expect(toggles[2]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(toggles[2]).toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("1,2");

    await userEvent.keyboard("[Enter]");

    expect(toggles[2]).not.toHaveAttribute("data-active");
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("1");
  });
});
