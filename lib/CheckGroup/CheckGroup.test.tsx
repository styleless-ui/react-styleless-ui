/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from "classnames";
import type { FormEvent, FormEventHandler } from "react";
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

const labelText = "Label";

const mockRequiredProps: Props = {
  label: { screenReaderLabel: labelText },
};

describe("CheckGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(CheckGroup, mockRequiredProps);
  itSupportsStyle(CheckGroup, mockRequiredProps, "[role='group']");
  itSupportsRef(CheckGroup, mockRequiredProps, HTMLDivElement);
  itSupportsDataSetProps(CheckGroup, mockRequiredProps, "[role='group']");

  it("should have the required classNames", () => {
    render(
      <CheckGroup
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

    expect(screen.getByRole("group")).toHaveClass(
      "root",
      "root--disabled",
      "root--readonly",
    );
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(<CheckGroup {...mockRequiredProps} />);

    expect(screen.getByRole("group")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <CheckGroup
        {...mockRequiredProps}
        label={{ labelledBy: "identifier" }}
      />,
    );

    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("toggles `checked` state with mouse interactions and calls `onValueChange` callback", async () => {
    userEvent.setup();

    const handleValueChange = jest.fn<void, [selectedValues: string[]]>();
    const getCheckboxes = () => screen.getAllByRole("checkbox");

    const { unmount: unmount1 } = render(
      <CheckGroup
        {...mockRequiredProps}
        onValueChange={handleValueChange}
      >
        <Checkbox
          label={{ screenReaderLabel: "item 0" }}
          value="0"
          disabled
        />
        <Checkbox
          label={{ screenReaderLabel: "item 1" }}
          value="1"
        />
        <Checkbox
          label={{ screenReaderLabel: "item 2" }}
          value="2"
        />
        <Checkbox
          label={{ screenReaderLabel: "item 3" }}
          value="3"
        />
      </CheckGroup>,
    );

    await userEvent.click(getCheckboxes()[0]!);

    expect(getCheckboxes()[0]!).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(getCheckboxes()[1]!);

    expect(getCheckboxes()[1]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.click(getCheckboxes()[1]!);

    expect(getCheckboxes()[1]!).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.join()).toBe("");

    await userEvent.click(getCheckboxes()[1]!);

    expect(getCheckboxes()[1]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.join()).toBe("1");

    await userEvent.click(getCheckboxes()[2]!);

    expect(getCheckboxes()[2]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(4);
    expect(handleValueChange.mock.calls[3]?.join()).toBe("1,2");

    unmount1();
    handleValueChange.mockReset();
    const { unmount: unmount2 } = render(
      <CheckGroup
        {...mockRequiredProps}
        readOnly
        onValueChange={handleValueChange}
      >
        <Checkbox
          label={{ screenReaderLabel: "item 0" }}
          value="0"
          disabled
        />
        <Checkbox
          label={{ screenReaderLabel: "item 1" }}
          value="1"
        />
      </CheckGroup>,
    );

    await userEvent.click(getCheckboxes()[0]!);

    expect(getCheckboxes()[0]!).not.toBeChecked();
    expect(getCheckboxes()[0]!).not.toHaveFocus();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(getCheckboxes()[1]!);

    expect(getCheckboxes()[1]!).not.toBeChecked();
    expect(getCheckboxes()[1]!).toHaveFocus();
    expect(handleValueChange.mock.calls.length).toBe(0);

    handleValueChange.mockReset();
    unmount2();
    render(
      <CheckGroup
        {...mockRequiredProps}
        disabled
        onValueChange={handleValueChange}
      >
        <Checkbox
          label={{ screenReaderLabel: "item 0" }}
          value="0"
          disabled
        />
        <Checkbox
          label={{ screenReaderLabel: "item 1" }}
          value="1"
        />
      </CheckGroup>,
    );

    await userEvent.click(getCheckboxes()[0]!);

    expect(getCheckboxes()[0]!).not.toBeChecked();
    expect(getCheckboxes()[0]!).not.toHaveFocus();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.click(getCheckboxes()[1]!);

    expect(getCheckboxes()[1]!).not.toBeChecked();
    expect(getCheckboxes()[1]!).not.toHaveFocus();
    expect(handleValueChange.mock.calls.length).toBe(0);
  });

  it("toggles `checked` state with keyboard interactions and calls `onValueChange` callback", async () => {
    userEvent.setup();

    const handleValueChange = jest.fn<void, [selectedValues: string[]]>();
    const getCheckboxes = () => screen.getAllByRole("checkbox");

    const { unmount: unmount1 } = render(
      <CheckGroup
        {...mockRequiredProps}
        onValueChange={handleValueChange}
      >
        <Checkbox
          label={{ screenReaderLabel: "item 0" }}
          value="0"
          disabled
        />
        <Checkbox
          label={{ screenReaderLabel: "item 1" }}
          value="1"
        />
        <Checkbox
          label={{ screenReaderLabel: "item 2" }}
          value="2"
        />
        <Checkbox
          label={{ screenReaderLabel: "item 3" }}
          value="3"
        />
      </CheckGroup>,
    );

    await userEvent.tab();

    expect(getCheckboxes()[0]!).not.toHaveFocus();
    expect(getCheckboxes()[1]!).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(getCheckboxes()[1]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(1);
    expect(handleValueChange.mock.calls[0]?.join()).toBe("1");

    await userEvent.keyboard("[Space]");

    expect(getCheckboxes()[1]!).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(2);
    expect(handleValueChange.mock.calls[1]?.join()).toBe("");

    await userEvent.keyboard("[Space]");

    expect(getCheckboxes()[1]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(3);
    expect(handleValueChange.mock.calls[2]?.join()).toBe("1");

    await userEvent.tab();
    expect(getCheckboxes()[2]!).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(getCheckboxes()[2]!).toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(4);
    expect(handleValueChange.mock.calls[3]?.join()).toBe("1,2");

    handleValueChange.mockReset();
    unmount1();
    const { unmount: unmount2 } = render(
      <CheckGroup
        {...mockRequiredProps}
        readOnly
        onValueChange={handleValueChange}
      >
        <Checkbox
          label={{ screenReaderLabel: "item 0" }}
          value="0"
          disabled
        />
        <Checkbox
          label={{ screenReaderLabel: "item 1" }}
          value="1"
        />
        <Checkbox
          label={{ screenReaderLabel: "item 2" }}
          value="2"
        />
        <Checkbox
          label={{ screenReaderLabel: "item 3" }}
          value="3"
        />
      </CheckGroup>,
    );

    await userEvent.tab();

    expect(getCheckboxes()[0]!).not.toHaveFocus();
    expect(getCheckboxes()[1]!).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(getCheckboxes()[1]!).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.keyboard("[Enter]");

    expect(getCheckboxes()[1]!).not.toBeChecked();
    expect(handleValueChange.mock.calls.length).toBe(0);

    await userEvent.tab();

    expect(getCheckboxes()[1]!).not.toHaveFocus();
    expect(getCheckboxes()[2]!).toHaveFocus();

    await userEvent.tab({ shift: true });

    expect(getCheckboxes()[2]!).not.toHaveFocus();
    expect(getCheckboxes()[1]!).toHaveFocus();

    getCheckboxes().forEach(checkbox => {
      expect(checkbox).toHaveAttribute("aria-readonly", "true");
    });

    handleValueChange.mockReset();
    unmount2();
    render(
      <CheckGroup
        {...mockRequiredProps}
        disabled
        onValueChange={handleValueChange}
      >
        <Checkbox
          label={{ screenReaderLabel: "item 0" }}
          value="0"
          disabled
        />
        <Checkbox
          label={{ screenReaderLabel: "item 1" }}
          value="1"
        />
        <Checkbox
          label={{ screenReaderLabel: "item 2" }}
          value="2"
        />
        <Checkbox
          label={{ screenReaderLabel: "item 3" }}
          value="3"
        />
      </CheckGroup>,
    );

    await userEvent.tab();

    expect(getCheckboxes()[0]!).not.toHaveFocus();
    expect(getCheckboxes()[1]!).not.toHaveFocus();

    getCheckboxes().forEach(checkbox => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("should be submitted with the form as part of a name/value pair", () => {
    const handleSubmit = jest.fn<void, [FormEvent<HTMLFormElement>]>();

    const submitHandler: FormEventHandler<HTMLFormElement> = event => {
      event.preventDefault();
      handleSubmit(event);
    };

    const getForm = () => screen.getByTestId<HTMLFormElement>("form");
    const getFormData = () => new FormData(getForm());

    const { rerender } = render(
      <form
        data-testid="form"
        onSubmit={submitHandler}
      >
        <CheckGroup
          {...mockRequiredProps}
          value={[]}
          name="n"
        >
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 0" }}
            value="v0"
            disabled
          />
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 1" }}
            value="v1"
          />
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 2" }}
            value="v2"
          />
        </CheckGroup>
      </form>,
    );

    act(() => {
      getForm().submit();
    });

    expect(handleSubmit.mock.calls.length).toBe(1);
    expect(getFormData().getAll("n")).toEqual([]);

    rerender(
      <form
        data-testid="form"
        onSubmit={submitHandler}
      >
        <CheckGroup
          {...mockRequiredProps}
          value={["v0", "v1"]}
          name="n"
        >
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 0" }}
            value="v0"
            disabled
          />
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 1" }}
            value="v1"
          />
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 2" }}
            value="v2"
          />
        </CheckGroup>
      </form>,
    );

    act(() => {
      getForm().submit();
    });

    expect(handleSubmit.mock.calls.length).toBe(2);
    expect(getFormData().getAll("n")).toEqual(["v1"]);

    rerender(
      <form
        data-testid="form"
        onSubmit={submitHandler}
      >
        <CheckGroup
          {...mockRequiredProps}
          disabled
          value={["v0", "v1", "v2"]}
          name="n"
        >
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 0" }}
            value="v0"
            disabled
          />
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 1" }}
            value="v1"
          />
          <Checkbox
            label={{ screenReaderLabel: "Checkbox 2" }}
            value="v2"
          />
        </CheckGroup>
      </form>,
    );

    act(() => {
      getForm().submit();
    });

    expect(handleSubmit.mock.calls.length).toBe(3);
    expect(getFormData().getAll("n")).toEqual([]);
  });
});
