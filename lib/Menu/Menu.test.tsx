import cls from "classnames";
import * as React from "react";
import * as Menu from ".";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent
} from "../../tests/utils";
import * as Slots from "./slots";

describe("Menu", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Menu.Root, { open: true });
  itSupportsRef(Menu.Root, { open: true }, HTMLDivElement);
  itSupportsStyle(Menu.Root, { open: true }, `[data-slot='${Slots.Root}']`);
  itSupportsDataSetProps(
    Menu.Root,
    { open: true },
    `[data-slot='${Slots.Root}']`
  );

  it("should have the required classNames", () => {
    render(
      <Menu.Root
        open
        className={({ open }) => (open ? "menu menu--open" : "menu")}
      >
        <Menu.Items
          className="menu__items"
          label={{ screenReaderLabel: "Menu 0" }}
        >
          <Menu.Group
            classes={{ label: "menu__group__label", root: "menu__group" }}
            label="Group 0"
          >
            <Menu.Item
              disabled
              className={({ disabled }) =>
                disabled ? "menu__item menu__item--disabled" : "menu__item"
              }
            >
              Item 0
            </Menu.Item>
            <Menu.Item
              className={({ disabled }) =>
                disabled ? "menu__item menu__item--disabled" : "menu__item"
              }
            >
              Item 1
            </Menu.Item>
            <Menu.Item
              className={({ disabled }) =>
                disabled ? "menu__item menu__item--disabled" : "menu__item"
              }
            >
              <span>Item 2</span>
              <Menu.Sub
                className={({ open }) =>
                  open
                    ? "menu menu--sub-menu menu--open"
                    : "menu menu--sub-menu"
                }
              >
                <Menu.Items
                  className="menu__items"
                  label={{ screenReaderLabel: "Item 2" }}
                >
                  <Menu.Item
                    className={({ disabled }) =>
                      disabled
                        ? "menu__item menu__item--disabled"
                        : "menu__item"
                    }
                  >
                    Item 2.0
                  </Menu.Item>
                  <Menu.Item
                    disabled
                    className={({ disabled }) =>
                      disabled
                        ? "menu__item menu__item--disabled"
                        : "menu__item"
                    }
                  >
                    Item 2.1
                  </Menu.Item>
                  <Menu.Item
                    className={({ disabled }) =>
                      disabled
                        ? "menu__item menu__item--disabled"
                        : "menu__item"
                    }
                  >
                    Item 2.3
                  </Menu.Item>
                </Menu.Items>
              </Menu.Sub>
            </Menu.Item>
          </Menu.Group>
          <Menu.SeparatorItem className="menu__separator" />
          <Menu.Group
            classes={{ label: "menu__group__label", root: "menu__group" }}
            label="Group 1"
          >
            <Menu.CheckItem
              defaultChecked
              className={({ disabled, selected }) =>
                cls("menu__check-item", {
                  "menu__check-item--disabled": disabled,
                  "menu__check-item--selected": selected
                })
              }
            >
              Item 3
            </Menu.CheckItem>
            <Menu.CheckItem
              disabled
              className={({ disabled, selected }) =>
                cls("menu__check-item", {
                  "menu__check-item--disabled": disabled,
                  "menu__check-item--selected": selected
                })
              }
            >
              Item 4
            </Menu.CheckItem>
            <Menu.CheckItem
              className={({ disabled, selected }) =>
                cls("menu__check-item", {
                  "menu__check-item--disabled": disabled,
                  "menu__check-item--selected": selected
                })
              }
            >
              Item 5
            </Menu.CheckItem>
          </Menu.Group>
          <Menu.RadioGroup
            classes={{
              label: "menu__group__label",
              root: "menu__group"
            }}
            label="Group 2"
            defaultValue="6"
          >
            <Menu.RadioItem
              value="6"
              className={({ disabled, selected }) =>
                cls("menu__radio-item", {
                  "menu__radio-item--disabled": disabled,
                  "menu__radio-item--selected": selected
                })
              }
            >
              Item 6
            </Menu.RadioItem>
            <Menu.RadioItem
              value="7"
              disabled
              className={({ disabled, selected }) =>
                cls("menu__radio-item", {
                  "menu__radio-item--disabled": disabled,
                  "menu__radio-item--selected": selected
                })
              }
            >
              Item 7
            </Menu.RadioItem>
            <Menu.RadioItem
              value="8"
              className={({ disabled, selected }) =>
                cls("menu__radio-item", {
                  "menu__radio-item--disabled": disabled,
                  "menu__radio-item--selected": selected
                })
              }
            >
              Item 8
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Items>
      </Menu.Root>
    );

    const menuItemWrappers = screen.getAllByRole("menu");
    const menuGroups = screen.getAllByRole("group");
    const menuSeparators = screen.getAllByRole("separator");
    const menuItems = screen.getAllByRole("menuitem");
    const menuCheckItems = screen.getAllByRole("menuitemcheckbox");
    const menuRadioItems = screen.getAllByRole("menuitemradio");

    menuItemWrappers.forEach((menuItemWrapper, idx) => {
      if (idx === 0) {
        expect(menuItemWrapper.parentElement).toHaveClass("menu", "menu--open");
      } else {
        expect(menuItemWrapper.parentElement).toHaveClass(
          "menu",
          "menu--sub-menu"
        );
      }

      expect(menuItemWrapper).toHaveClass("menu__items");
    });

    menuGroups.forEach(menuGroup => {
      expect(menuGroup).toHaveClass("menu__group");
      expect(menuGroup.firstElementChild).toHaveClass("menu__group__label");
    });

    menuSeparators.forEach(menuSeparator => {
      expect(menuSeparator).toHaveClass("menu__separator");
    });

    menuItems.forEach(menuItem => {
      const isDisabled = menuItem.getAttribute("aria-disabled") === "true";

      expect(menuItem).toHaveClass("menu__item");

      if (isDisabled)
        expect(menuItem).toHaveClass("menu__item", "menu__item--disabled");
    });

    menuCheckItems.forEach(menuCheckItem => {
      const isDisabled = menuCheckItem.getAttribute("aria-disabled") === "true";
      const isChecked = menuCheckItem.getAttribute("aria-checked") === "true";

      expect(menuCheckItem).toHaveClass("menu__check-item");

      if (isDisabled)
        expect(menuCheckItem).toHaveClass(
          "menu__check-item",
          "menu__check-item--disabled"
        );

      if (isChecked)
        expect(menuCheckItem).toHaveClass(
          "menu__check-item",
          "menu__check-item--selected"
        );
    });

    menuRadioItems.forEach(menuRadioItem => {
      const isDisabled = menuRadioItem.getAttribute("aria-disabled") === "true";
      const isChecked = menuRadioItem.getAttribute("aria-checked") === "true";

      expect(menuRadioItem).toHaveClass("menu__radio-item");

      if (isDisabled)
        expect(menuRadioItem).toHaveClass(
          "menu__radio-item",
          "menu__radio-item--disabled"
        );

      if (isChecked)
        expect(menuRadioItem).toHaveClass(
          "menu__radio-item",
          "menu__radio-item--selected"
        );
    });
  });

  it("the anchor of the submenu should have the required aria attributes", () => {
    render(
      <Menu.Root open>
        <Menu.Items label={{ screenReaderLabel: "Menu 0" }}>
          <Menu.Group label="Group 0">
            <Menu.Item disabled>Item 0</Menu.Item>
            <Menu.Item>Item 1</Menu.Item>
            <Menu.Item data-testid="item:2">
              <span>Item 2</span>
              <Menu.Sub id="submenu:0">
                <Menu.Items label={{ screenReaderLabel: "Item 2" }}>
                  <Menu.Item>Item 2.0</Menu.Item>
                  <Menu.Item disabled>Item 2.1</Menu.Item>
                  <Menu.Item>Item 2.3</Menu.Item>
                </Menu.Items>
              </Menu.Sub>
            </Menu.Item>
          </Menu.Group>
        </Menu.Items>
      </Menu.Root>
    );

    const triggerItem = screen.getByTestId("item:2");

    expect(triggerItem).toHaveAttribute("aria-controls", "submenu:0");
    expect(triggerItem).toHaveAttribute("aria-expanded", "false");
    expect(triggerItem).toHaveAttribute("aria-haspopup", "menu");
  });

  it("selects a `menuitem` and calls `onSelect` callback", async () => {
    const handleOnSelect = jest.fn<
      void,
      [event: React.MouseEvent | React.KeyboardEvent]
    >();

    userEvent.setup();
    render(
      <Menu.Root open>
        <Menu.Items label={{ screenReaderLabel: "Menu 0" }}>
          <Menu.Item disabled onSelect={handleOnSelect}>
            Item 0
          </Menu.Item>
          <Menu.Item onSelect={handleOnSelect}>Item 1</Menu.Item>
          <Menu.Item onSelect={handleOnSelect}>Item 2</Menu.Item>
        </Menu.Items>
      </Menu.Root>
    );

    const items = screen.getAllByRole("menuitem");

    let calls = 0;
    for (const item of items) {
      const isDisabled = item.getAttribute("aria-disabled") === "true";

      await userEvent.click(item);
      if (!isDisabled) {
        calls++;
        expect(handleOnSelect.mock.calls[0]?.[0]).not.toBeFalsy();
      }

      expect(handleOnSelect.mock.calls.length).toBe(calls);
    }
  });

  it("selects a `menuitemcheckbox` and calls `onSelect` and `onCheckChange` callbacks", async () => {
    const handleOnSelect = jest.fn<
      void,
      [event: React.MouseEvent | React.KeyboardEvent]
    >();

    const handleOnCheckChange = jest.fn<void, [checked: boolean]>();

    userEvent.setup();
    render(
      <Menu.Root open>
        <Menu.Items label={{ screenReaderLabel: "Menu 0" }}>
          <Menu.CheckItem
            disabled
            onSelect={handleOnSelect}
            onCheckChange={handleOnCheckChange}
          >
            Item 0
          </Menu.CheckItem>
          <Menu.CheckItem
            onSelect={handleOnSelect}
            onCheckChange={handleOnCheckChange}
          >
            Item 1
          </Menu.CheckItem>
          <Menu.CheckItem
            onSelect={handleOnSelect}
            onCheckChange={handleOnCheckChange}
          >
            Item 2
          </Menu.CheckItem>
        </Menu.Items>
      </Menu.Root>
    );

    const items = screen.getAllByRole("menuitemcheckbox");

    let calls = 0;
    for (const item of items) {
      const isDisabled = item.getAttribute("aria-disabled") === "true";

      await userEvent.click(item);
      if (!isDisabled) {
        calls++;
        expect(handleOnSelect.mock.calls[0]?.[0]).not.toBeFalsy();
        expect(handleOnCheckChange.mock.calls[0]?.[0]).toBe(true);
      }

      expect(handleOnSelect.mock.calls.length).toBe(calls);
      expect(handleOnCheckChange.mock.calls.length).toBe(calls);
    }
  });

  it("selects a `menuitemradio` and calls `onSelect` callback", async () => {
    const handleOnSelect = jest.fn<
      void,
      [event: React.MouseEvent | React.KeyboardEvent]
    >();

    userEvent.setup();
    render(
      <Menu.Root open>
        <Menu.Items label={{ screenReaderLabel: "Menu 0" }}>
          <Menu.RadioGroup label="Group 0">
            <Menu.RadioItem disabled value="0" onSelect={handleOnSelect}>
              Item 0
            </Menu.RadioItem>
            <Menu.RadioItem value="1" onSelect={handleOnSelect}>
              Item 1
            </Menu.RadioItem>
            <Menu.RadioItem value="2" onSelect={handleOnSelect}>
              Item 2
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Items>
      </Menu.Root>
    );

    const items = screen.getAllByRole("menuitemradio");

    let calls = 0;
    for (const item of items) {
      const isDisabled = item.getAttribute("aria-disabled") === "true";

      await userEvent.click(item);
      if (!isDisabled) {
        calls++;
        expect(handleOnSelect.mock.calls[0]?.[0]).not.toBeFalsy();
      }

      expect(handleOnSelect.mock.calls.length).toBe(calls);
    }
  });

  it("toggles `menuitemradio`s of <MenuRadioGroup> and calls `onValueChange` callback", async () => {
    const handleOnValueChange = jest.fn<void, [value: string]>();

    userEvent.setup();
    render(
      <Menu.Root open>
        <Menu.Items label={{ screenReaderLabel: "Menu 0" }}>
          <Menu.RadioGroup label="Group 0" onValueChange={handleOnValueChange}>
            <Menu.RadioItem disabled value="0">
              Item 0
            </Menu.RadioItem>
            <Menu.RadioItem value="1">Item 1</Menu.RadioItem>
            <Menu.RadioItem value="2">Item 2</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Items>
      </Menu.Root>
    );

    const items = screen.getAllByRole("menuitemradio");

    if (items[1]) {
      await userEvent.click(items[1]);
      expect(items[1]).toBeChecked();
      expect(handleOnValueChange.mock.calls.length).toBe(1);
      expect(handleOnValueChange.mock.calls[0]?.[0]).toBe("1");
    }

    if (items[2]) {
      await userEvent.click(items[2]);
      expect(items[2]).toBeChecked();
      expect(handleOnValueChange.mock.calls.length).toBe(2);
      expect(handleOnValueChange.mock.calls[1]?.[0]).toBe("2");
    }
  });

  it("clicks outside of the component and calls `onOutsideClick` callback", async () => {
    const handleOutsideClick = jest.fn<void, [event: MouseEvent]>();

    userEvent.setup();
    render(
      <>
        <button data-testid="btn">Button</button>
        <Menu.Root open onOutsideClick={handleOutsideClick} />
      </>
    );

    await userEvent.click(screen.getByTestId("btn"));

    expect(handleOutsideClick.mock.calls.length).toBe(1);
    expect(handleOutsideClick.mock.calls[0]?.[0]).not.toBeFalsy();
  });

  it("presses the Escape key and calls `onEscapeKeyUp` callback", async () => {
    const handleEscapeKeyUp = jest.fn<void, [event: KeyboardEvent]>();

    userEvent.setup();
    render(<Menu.Root open onEscapeKeyUp={handleEscapeKeyUp} />);

    await userEvent.keyboard("[Escape]");

    expect(handleEscapeKeyUp.mock.calls.length).toBe(1);
    expect(handleEscapeKeyUp.mock.calls[0]?.[0]).not.toBeFalsy();
  });
});
