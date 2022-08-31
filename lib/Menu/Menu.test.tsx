import cls from "classnames";
import * as React from "react";
import Menu, {
  MenuCheckItem,
  MenuGroup,
  MenuItem,
  MenuItems,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparatorItem,
  SubMenu
} from ".";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent
} from "../../tests/utils";

describe("Menu", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Menu, { open: true });
  itSupportsRef(Menu, { open: true }, HTMLDivElement);
  itSupportsStyle(Menu, { open: true }, "[data-slot='menuRoot']");
  itSupportsDataSetProps(Menu, { open: true }, "[data-slot='menuRoot']");

  it("should have the required classNames", () => {
    render(
      <Menu className={({ open }) => (open ? "menu menu--open" : "menu")} open>
        <MenuItems
          className="menu__items"
          label={{ screenReaderLabel: "Menu 0" }}
        >
          <MenuGroup
            classes={{ label: "menu__group__label", root: "menu__group" }}
            label="Group 0"
          >
            <MenuItem
              disabled
              className={({ disabled }) =>
                disabled ? "menu__item menu__item--disabled" : "menu__item"
              }
            >
              Item 0
            </MenuItem>
            <MenuItem
              className={({ disabled }) =>
                disabled ? "menu__item menu__item--disabled" : "menu__item"
              }
            >
              Item 1
            </MenuItem>
            <MenuItem
              className={({ disabled }) =>
                disabled ? "menu__item menu__item--disabled" : "menu__item"
              }
            >
              <span>Item 2</span>
              <SubMenu
                className={({ open }) =>
                  open
                    ? "menu menu--sub-menu menu--open"
                    : "menu menu--sub-menu"
                }
              >
                <MenuItems
                  className="menu__items"
                  label={{ screenReaderLabel: "Item 2" }}
                >
                  <MenuItem
                    className={({ disabled }) =>
                      disabled
                        ? "menu__item menu__item--disabled"
                        : "menu__item"
                    }
                  >
                    Item 2.0
                  </MenuItem>
                  <MenuItem
                    disabled
                    className={({ disabled }) =>
                      disabled
                        ? "menu__item menu__item--disabled"
                        : "menu__item"
                    }
                  >
                    Item 2.1
                  </MenuItem>
                  <MenuItem
                    className={({ disabled }) =>
                      disabled
                        ? "menu__item menu__item--disabled"
                        : "menu__item"
                    }
                  >
                    Item 2.3
                  </MenuItem>
                </MenuItems>
              </SubMenu>
            </MenuItem>
          </MenuGroup>
          <MenuSeparatorItem className="menu__separator" />
          <MenuGroup
            classes={{ label: "menu__group__label", root: "menu__group" }}
            label="Group 1"
          >
            <MenuCheckItem
              defaultChecked
              className={({ disabled, selected }) =>
                cls("menu__check-item", {
                  "menu__check-item--disabled": disabled,
                  "menu__check-item--selected": selected
                })
              }
            >
              Item 3
            </MenuCheckItem>
            <MenuCheckItem
              disabled
              className={({ disabled, selected }) =>
                cls("menu__check-item", {
                  "menu__check-item--disabled": disabled,
                  "menu__check-item--selected": selected
                })
              }
            >
              Item 4
            </MenuCheckItem>
            <MenuCheckItem
              className={({ disabled, selected }) =>
                cls("menu__check-item", {
                  "menu__check-item--disabled": disabled,
                  "menu__check-item--selected": selected
                })
              }
            >
              Item 5
            </MenuCheckItem>
          </MenuGroup>
          <MenuRadioGroup
            classes={{
              label: "menu__group__label",
              root: "menu__group"
            }}
            label="Group 2"
            defaultValue="6"
          >
            <MenuRadioItem
              value="6"
              className={({ disabled, selected }) =>
                cls("menu__radio-item", {
                  "menu__radio-item--disabled": disabled,
                  "menu__radio-item--selected": selected
                })
              }
            >
              Item 6
            </MenuRadioItem>
            <MenuRadioItem
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
            </MenuRadioItem>
            <MenuRadioItem
              value="8"
              className={({ disabled, selected }) =>
                cls("menu__radio-item", {
                  "menu__radio-item--disabled": disabled,
                  "menu__radio-item--selected": selected
                })
              }
            >
              Item 8
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuItems>
      </Menu>
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
      <Menu open>
        <MenuItems label={{ screenReaderLabel: "Menu 0" }}>
          <MenuGroup label="Group 0">
            <MenuItem disabled>Item 0</MenuItem>
            <MenuItem>Item 1</MenuItem>
            <MenuItem data-testid="item:2">
              <span>Item 2</span>
              <SubMenu id="submenu:0">
                <MenuItems label={{ screenReaderLabel: "Item 2" }}>
                  <MenuItem>Item 2.0</MenuItem>
                  <MenuItem disabled>Item 2.1</MenuItem>
                  <MenuItem>Item 2.3</MenuItem>
                </MenuItems>
              </SubMenu>
            </MenuItem>
          </MenuGroup>
        </MenuItems>
      </Menu>
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
      <Menu open>
        <MenuItems label={{ screenReaderLabel: "Menu 0" }}>
          <MenuItem disabled onSelect={handleOnSelect}>
            Item 0
          </MenuItem>
          <MenuItem onSelect={handleOnSelect}>Item 1</MenuItem>
          <MenuItem onSelect={handleOnSelect}>Item 2</MenuItem>
        </MenuItems>
      </Menu>
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
      <Menu open>
        <MenuItems label={{ screenReaderLabel: "Menu 0" }}>
          <MenuCheckItem
            disabled
            onSelect={handleOnSelect}
            onCheckChange={handleOnCheckChange}
          >
            Item 0
          </MenuCheckItem>
          <MenuCheckItem
            onSelect={handleOnSelect}
            onCheckChange={handleOnCheckChange}
          >
            Item 1
          </MenuCheckItem>
          <MenuCheckItem
            onSelect={handleOnSelect}
            onCheckChange={handleOnCheckChange}
          >
            Item 2
          </MenuCheckItem>
        </MenuItems>
      </Menu>
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
      <Menu open>
        <MenuItems label={{ screenReaderLabel: "Menu 0" }}>
          <MenuRadioGroup label="Group 0">
            <MenuRadioItem disabled value="0" onSelect={handleOnSelect}>
              Item 0
            </MenuRadioItem>
            <MenuRadioItem value="1" onSelect={handleOnSelect}>
              Item 1
            </MenuRadioItem>
            <MenuRadioItem value="2" onSelect={handleOnSelect}>
              Item 2
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuItems>
      </Menu>
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
      <Menu open>
        <MenuItems label={{ screenReaderLabel: "Menu 0" }}>
          <MenuRadioGroup label="Group 0" onValueChange={handleOnValueChange}>
            <MenuRadioItem disabled value="0">
              Item 0
            </MenuRadioItem>
            <MenuRadioItem value="1">Item 1</MenuRadioItem>
            <MenuRadioItem value="2">Item 2</MenuRadioItem>
          </MenuRadioGroup>
        </MenuItems>
      </Menu>
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
        <Menu open onOutsideClick={handleOutsideClick} />
      </>
    );

    await userEvent.click(screen.getByTestId("btn"));

    expect(handleOutsideClick.mock.calls.length).toBe(1);
    expect(handleOutsideClick.mock.calls[0]?.[0]).not.toBeFalsy();
  });

  it("presses the Escape key and calls `onEscapeKeyUp` callback", async () => {
    const handleEscapeKeyUp = jest.fn<void, [event: KeyboardEvent]>();

    userEvent.setup();
    render(<Menu open onEscapeKeyUp={handleEscapeKeyUp} />);

    await userEvent.keyboard("[Escape]");

    expect(handleEscapeKeyUp.mock.calls.length).toBe(1);
    expect(handleEscapeKeyUp.mock.calls[0]?.[0]).not.toBeFalsy();
  });
});
