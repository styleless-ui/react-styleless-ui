import classNames from "classnames";
import type { FormEvent, FormEventHandler } from "react";
import {
  act,
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsFocusEvents,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
} from "../../tests/utils";
import Switch, { type Props } from "./Switch";

const labelText = "Label";

const mockRequiredProps: Props = {
  label: { screenReaderLabel: labelText },
};

describe("Switch", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Switch, mockRequiredProps);
  itSupportsStyle(Switch, mockRequiredProps, "[role='switch']");
  itSupportsRef(Switch, mockRequiredProps, HTMLButtonElement);
  itSupportsFocusEvents(Switch, mockRequiredProps, "button");
  itSupportsDataSetProps(Switch, mockRequiredProps, "[role='switch']");

  it("should have the required classNames", () => {
    const { unmount } = render(
      <Switch
        {...mockRequiredProps}
        checked
        autoFocus
        disabled
        readOnly
        className={({ checked, disabled, readOnly, focusedVisible }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--readonly": readOnly,
            "root--checked": checked,
            "root--focus-visible": focusedVisible,
          })
        }
      />,
    );

    expect(screen.getByRole("switch")).toHaveClass(
      "root",
      "root--checked",
      "root--disabled",
      "root--readonly",
    );

    unmount();
    render(
      <Switch
        {...mockRequiredProps}
        checked
        autoFocus
        readOnly
        className={({ checked, disabled, readOnly, focusedVisible }) =>
          classNames("root", {
            "root--disabled": disabled,
            "root--readonly": readOnly,
            "root--checked": checked,
            "root--focus-visible": focusedVisible,
          })
        }
      />,
    );

    expect(screen.getByRole("switch")).toHaveClass(
      "root",
      "root--checked",
      "root--focus-visible",
      "root--readonly",
    );
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(<Switch {...mockRequiredProps} />);

    expect(screen.getByRole("switch")).toHaveAttribute("aria-label", labelText);
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <Switch
        {...mockRequiredProps}
        label={{ labelledBy: "identifier" }}
      />,
    );

    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });

  it("renders an unchecked switch when `checked={false}`", () => {
    render(<Switch {...mockRequiredProps} />);

    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("renders a checked switch when `checked={true}`", () => {
    render(
      <Switch
        {...mockRequiredProps}
        checked
      />,
    );

    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles `checked` state with mouse/keyboard interactions and calls `onCheckedChange` callback", async () => {
    const handleCheckedChange = jest.fn<void, [checkedState: boolean]>();

    userEvent.setup();

    const getSwitch = () => screen.getByRole("switch");

    const { unmount: unmount1 } = render(
      <Switch
        {...mockRequiredProps}
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.click(getSwitch());

    expect(getSwitch()).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.click(getSwitch());

    expect(getSwitch()).not.toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(2);
    expect(handleCheckedChange.mock.calls[1]?.[0]).toBe(false);

    handleCheckedChange.mockReset();
    unmount1();
    const { unmount: unmount2 } = render(
      <Switch
        {...mockRequiredProps}
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.tab();

    expect(getSwitch()).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(getSwitch()).toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(1);
    expect(handleCheckedChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.keyboard("[Space]");

    expect(getSwitch()).not.toBeChecked();
    expect(handleCheckedChange.mock.calls.length).toBe(2);
    expect(handleCheckedChange.mock.calls[1]?.[0]).toBe(false);

    handleCheckedChange.mockReset();
    unmount2();
    const { unmount: unmount3 } = render(
      <Switch
        {...mockRequiredProps}
        readOnly
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.tab();

    expect(getSwitch()).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(handleCheckedChange.mock.calls.length).toBe(0);

    await userEvent.keyboard("[Enter]");

    expect(handleCheckedChange.mock.calls.length).toBe(0);

    await userEvent.click(getSwitch());

    expect(handleCheckedChange.mock.calls.length).toBe(0);

    handleCheckedChange.mockReset();
    unmount3();
    render(
      <Switch
        {...mockRequiredProps}
        disabled
        onCheckedChange={handleCheckedChange}
      />,
    );

    await userEvent.tab();

    expect(getSwitch()).not.toHaveFocus();

    await userEvent.click(getSwitch());

    expect(handleCheckedChange.mock.calls.length).toBe(0);
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
        <Switch
          {...mockRequiredProps}
          checked={false}
          name="n"
          value="v0"
        />
      </form>,
    );

    act(() => {
      getForm().submit();
    });

    expect(handleSubmit.mock.calls.length).toBe(1);
    expect(getFormData().get("n")).toBe(null);

    rerender(
      <form
        data-testid="form"
        onSubmit={submitHandler}
      >
        <Switch
          {...mockRequiredProps}
          checked={true}
          name="n"
          value="v0"
        />
      </form>,
    );

    act(() => {
      getForm().submit();
    });

    expect(handleSubmit.mock.calls.length).toBe(2);
    expect(getFormData().get("n")).toBe("v0");

    rerender(
      <form
        data-testid="form"
        onSubmit={submitHandler}
      >
        <Switch
          {...mockRequiredProps}
          disabled
          checked={true}
          name="n"
          value="v0"
        />
      </form>,
    );

    act(() => {
      getForm().submit();
    });

    expect(handleSubmit.mock.calls.length).toBe(3);
    expect(getFormData().get("n")).toBe(null);
  });
});
