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
import Checkbox from "../Checkbox";
import CheckGroup, { type CheckGroupProps } from "./CheckGroup";

const labelText = "Label";

const REQUIRED_PROPS: CheckGroupProps = {
  label: labelText,
  classes: { label: "label", root: "root" }
};

describe("CheckGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(CheckGroup, REQUIRED_PROPS);
  itSupportsStyle(CheckGroup, REQUIRED_PROPS, "[role='group']");
  itSupportsRef(CheckGroup, REQUIRED_PROPS, HTMLDivElement);
  itSupportsDataSetProps(CheckGroup, REQUIRED_PROPS, "[role='group']");

  it("should have the required classNames", () => {
    render(<CheckGroup {...REQUIRED_PROPS} />);

    const group = screen.getByRole("group");
    const label = group.previousElementSibling;

    expect(group).toHaveClass("root");
    expect(label).toHaveClass("label");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <CheckGroup
        {...REQUIRED_PROPS}
        label={{ screenReaderLabel: labelText }}
      />
    );

    expect(screen.getByRole("group")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <CheckGroup {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />
    );

    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-labelledby",
      "identifier"
    );
  });

  it("toggles `checked` state with mouse interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [selectedValues: string[]]>();

    userEvent.setup();
    render(
      <CheckGroup {...REQUIRED_PROPS} onChange={handleChange}>
        <Checkbox label="item 0" value="0" />
        <Checkbox label="item 1" value="1" />
        <Checkbox label="item 2" value="2" />
        <Checkbox label="item 3" value="3" />
      </CheckGroup>
    );

    const boxes = screen.getAllByRole("checkbox");

    if (boxes[0]) {
      await userEvent.click(boxes[0]);

      expect(boxes[0]).toBeChecked();
      expect(handleChange.mock.calls.length).toBe(1);
      expect(handleChange.mock.calls[0]?.join()).toBe("0");
    }

    if (boxes[3]) {
      await userEvent.click(boxes[3]);

      expect(boxes[3]).toBeChecked();
      expect(handleChange.mock.calls.length).toBe(2);
      expect(handleChange.mock.calls[1]?.join()).toBe("0,3");
    }

    if (boxes[0]) {
      await userEvent.click(boxes[0]);

      expect(boxes[0]).not.toBeChecked();
      expect(handleChange.mock.calls.length).toBe(3);
      expect(handleChange.mock.calls[2]?.join()).toBe("3");
    }

    if (boxes[3]) {
      await userEvent.click(boxes[3]);

      expect(boxes[3]).not.toBeChecked();
      expect(handleChange.mock.calls.length).toBe(4);
      expect(handleChange.mock.calls[3]?.join()).toBe("");
    }
  });

  it("toggles `checked` state with keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [selectedValues: string[]]>();

    userEvent.setup();
    render(
      <CheckGroup {...REQUIRED_PROPS} onChange={handleChange}>
        <Checkbox label="item 0" value="0" />
        <Checkbox label="item 1" value="1" />
        <Checkbox label="item 2" value="2" />
        <Checkbox label="item 3" value="3" />
      </CheckGroup>
    );

    const boxes = screen.getAllByRole("checkbox");

    act(() => void boxes[0]?.focus());
    expect(boxes[0]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(boxes[0]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.join()).toBe("0");

    act(() => void boxes[3]?.focus());
    expect(boxes[3]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(boxes[3]).toBeChecked();
    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.join()).toBe("0,3");

    act(() => void boxes[0]?.focus());
    expect(boxes[0]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(boxes[0]).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(3);
    expect(handleChange.mock.calls[2]?.join()).toBe("3");

    act(() => void boxes[3]?.focus());
    expect(boxes[3]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(boxes[3]).not.toBeChecked();
    expect(handleChange.mock.calls.length).toBe(4);
    expect(handleChange.mock.calls[3]?.join()).toBe("");
  });
});
