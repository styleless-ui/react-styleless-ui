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
import Checkbox from "../Checkbox";
import CheckGroup, { type Props } from "./CheckGroup";
import * as Slots from "./slots";

const labelText = "Label";

const REQUIRED_PROPS: Props = {
  label: labelText,
  classes: { label: "label", root: "root", group: "group" },
};

describe("CheckGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(CheckGroup, REQUIRED_PROPS);
  itSupportsStyle(CheckGroup, REQUIRED_PROPS);
  itSupportsRef(CheckGroup, REQUIRED_PROPS, HTMLDivElement);
  itSupportsDataSetProps(CheckGroup, REQUIRED_PROPS);

  it("should have the required classNames", () => {
    render(<CheckGroup {...REQUIRED_PROPS} />);

    const group = screen.getByRole("group");
    const root = group.parentElement;
    const label = root?.querySelector(`[data-slot='${Slots.Label}']`);

    expect(root).toHaveClass("root");
    expect(group).toHaveClass("group");
    expect(label).toHaveClass("label");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <CheckGroup
        {...REQUIRED_PROPS}
        label={{ screenReaderLabel: labelText }}
      />,
    );

    expect(screen.getByRole("group")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <CheckGroup {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />,
    );

    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("toggles `checked` state with mouse interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [selectedValues: string[]]>();

    userEvent.setup();
    render(
      <CheckGroup {...REQUIRED_PROPS} onChange={handleChange}>
        <Checkbox label="item 0" value="0" disabled />
        <Checkbox label="item 1" value="1" />
        <Checkbox label="item 2" value="2" />
        <Checkbox label="item 3" value="3" />
      </CheckGroup>,
    );

    const boxes = screen.getAllByRole("checkbox");

    expect(boxes[0]).not.toBeUndefined();
    expect(boxes[1]).not.toBeUndefined();
    expect(boxes[2]).not.toBeUndefined();

    await userEvent.click(boxes[0]!);

    expect(boxes[0]).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.click(boxes[1]!);

    expect(boxes[1]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.click(boxes[1]!);

    expect(boxes[1]).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("");

    await userEvent.click(boxes[1]!);

    expect(boxes[1]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("1");

    await userEvent.click(boxes[2]!);

    expect(boxes[2]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(4);
    expect(handleChange.mock.calls[3]?.join()).toBe("1,2");
  });

  it("toggles `checked` state with keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [selectedValues: string[]]>();

    userEvent.setup();
    render(
      <CheckGroup {...REQUIRED_PROPS} onChange={handleChange}>
        <Checkbox label="item 0" value="0" disabled />
        <Checkbox label="item 1" value="1" />
        <Checkbox label="item 2" value="2" />
        <Checkbox label="item 3" value="3" />
      </CheckGroup>,
    );

    const boxes = screen.getAllByRole("checkbox");

    act(() => void boxes[0]?.focus());
    await userEvent.keyboard("[Space]");

    expect(boxes[0]).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(0);

    await userEvent.tab();
    expect(boxes[1]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(boxes[1]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.keyboard("[Space]");

    expect(boxes[1]).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("");

    await userEvent.keyboard("[Space]");

    expect(boxes[1]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("1");

    await userEvent.tab();
    expect(boxes[2]).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(boxes[2]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(4);
    expect(handleChange.mock.calls[3]?.join()).toBe("1,2");
  });
});
