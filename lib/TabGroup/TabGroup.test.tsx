import * as TabGroup from ".";
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

const tabListLabel = "Label";

describe("TabGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(TabGroup.Root, {});
  itSupportsStyle(TabGroup.Root, {});
  itSupportsRef(TabGroup.Root, {}, HTMLDivElement);
  itSupportsDataSetProps(TabGroup.Root, {});

  it("selects tabs with mouse interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [tabIndex: number]>();

    userEvent.setup();
    render(
      <TabGroup.Root onChange={handleChange}>
        <TabGroup.List label={tabListLabel}>
          <TabGroup.Tab>Tab 1</TabGroup.Tab>
          <TabGroup.Tab>Tab 2</TabGroup.Tab>
          <TabGroup.Tab>Tab 3</TabGroup.Tab>
        </TabGroup.List>
        <TabGroup.Panels>
          <TabGroup.Panel>Panel 1</TabGroup.Panel>
          <TabGroup.Panel>Panel 2</TabGroup.Panel>
          <TabGroup.Panel>Panel 3</TabGroup.Panel>
        </TabGroup.Panels>
      </TabGroup.Root>
    );

    const tabs = screen.getAllByRole("tab");

    if (tabs[0]) {
      await userEvent.click(tabs[0]);

      expect(handleChange.mock.calls.length).toBe(1);
      expect(handleChange.mock.calls[0]?.[0]).toBe(0);
      expect(screen.getAllByRole("tabpanel").length).toBe(1);
      expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 1/i);
    }

    if (tabs[2]) {
      await userEvent.click(tabs[2]);

      expect(handleChange.mock.calls.length).toBe(2);
      expect(handleChange.mock.calls[1]?.[0]).toBe(2);
      expect(screen.getAllByRole("tabpanel").length).toBe(1);
      expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 3/i);
    }
  });

  it("selects tabs with keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [tabIndex: number]>();

    userEvent.setup();
    render(
      <TabGroup.Root onChange={handleChange}>
        <TabGroup.List label={tabListLabel}>
          <TabGroup.Tab>Tab 1</TabGroup.Tab>
          <TabGroup.Tab>Tab 2</TabGroup.Tab>
          <TabGroup.Tab>Tab 3</TabGroup.Tab>
        </TabGroup.List>
        <TabGroup.Panels>
          <TabGroup.Panel>Panel 1</TabGroup.Panel>
          <TabGroup.Panel>Panel 2</TabGroup.Panel>
          <TabGroup.Panel>Panel 3</TabGroup.Panel>
        </TabGroup.Panels>
      </TabGroup.Root>
    );

    const tabs = screen.getAllByRole("tab");

    act(() => void tabs[0]?.focus());
    expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0]?.[0]).toBe(0);
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 1/i);

    act(() => void tabs[2]?.focus());
    expect(tabs[2]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1]?.[0]).toBe(2);
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 3/i);
  });
});

describe("TabList", () => {
  afterEach(jest.clearAllMocks);

  const REQUIRED_PROPS: TabGroup.ListProps = {
    label: tabListLabel,
    classes: { label: "label", root: "root" }
  };

  itShouldMount(TabGroup.List, REQUIRED_PROPS);
  itSupportsRef(TabGroup.List, REQUIRED_PROPS, HTMLDivElement);
  itSupportsStyle(TabGroup.List, REQUIRED_PROPS, "[role='tablist']");
  itSupportsDataSetProps(TabGroup.List, REQUIRED_PROPS, "[role='tablist']");

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <TabGroup.List
        {...REQUIRED_PROPS}
        label={{ screenReaderLabel: tabListLabel }}
      />
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      tabListLabel
    );
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <TabGroup.List {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-labelledby",
      "identifier"
    );
  });
});
