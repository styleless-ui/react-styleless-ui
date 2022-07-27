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
import TabGroup from "./TabGroup";
import TabList, { type TabListProps } from "./List";
import TabPanels from "./Panels";
import TabPanel from "./Panel";
import Tab from "./Tab";

const tabListLabel = "Label";

describe("TabGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(TabGroup, {});
  itSupportsStyle(TabGroup, {});
  itSupportsRef(TabGroup, {}, HTMLDivElement);
  itSupportsDataSetProps(TabGroup, {});

  it("selects tabs with mouse interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [tabIndex: number]>();

    userEvent.setup();
    render(
      <TabGroup onChange={handleChange}>
        <TabList label={tabListLabel}>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Panel 1</TabPanel>
          <TabPanel>Panel 2</TabPanel>
          <TabPanel>Panel 3</TabPanel>
        </TabPanels>
      </TabGroup>
    );

    const tabs = screen.getAllByRole("tab");

    await userEvent.click(tabs[0]);

    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0][0]).toBe(0);
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 1/i);

    await userEvent.click(tabs[2]);

    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1][0]).toBe(2);
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 3/i);
  });

  it("selects tabs with keyboard interactions and calls `onChange` callback", async () => {
    const handleChange = jest.fn<void, [tabIndex: number]>();

    userEvent.setup();
    render(
      <TabGroup onChange={handleChange}>
        <TabList label={tabListLabel}>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Panel 1</TabPanel>
          <TabPanel>Panel 2</TabPanel>
          <TabPanel>Panel 3</TabPanel>
        </TabPanels>
      </TabGroup>
    );

    const tabs = screen.getAllByRole("tab");

    act(() => void tabs[0].focus());
    expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0][0]).toBe(0);
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 1/i);

    act(() => void tabs[2].focus());
    expect(tabs[2]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleChange.mock.calls.length).toBe(2);
    expect(handleChange.mock.calls[1][0]).toBe(2);
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 3/i);
  });
});

describe("TabList", () => {
  afterEach(jest.clearAllMocks);

  const REQUIRED_PROPS: TabListProps = {
    label: tabListLabel,
    classes: { label: "label", root: "root" }
  };

  itShouldMount(TabList, REQUIRED_PROPS);
  itSupportsRef(TabList, REQUIRED_PROPS, HTMLDivElement);
  itSupportsStyle(TabList, REQUIRED_PROPS, "[role='tablist']");
  itSupportsDataSetProps(TabList, REQUIRED_PROPS, "[role='tablist']");

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <TabList
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
      <TabList {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-labelledby",
      "identifier"
    );
  });
});
