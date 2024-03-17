/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as TabGroup from ".";
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

const tabListLabel = "Label";

describe("TabGroup", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(TabGroup.Root, {});
  itSupportsStyle(TabGroup.Root, {});
  itSupportsRef(TabGroup.Root, {}, HTMLDivElement);
  itSupportsDataSetProps(TabGroup.Root, {});

  it("selects tabs with mouse interactions and calls `onActiveTabChange` callback", async () => {
    const handleActiveTabChange = jest.fn<void, [tabValue: string]>();

    userEvent.setup();
    render(
      <TabGroup.Root onActiveTabChange={handleActiveTabChange}>
        <TabGroup.List label={{ screenReaderLabel: tabListLabel }}>
          <TabGroup.Tab value="0">Tab 1</TabGroup.Tab>
          <TabGroup.Tab value="1">Tab 2</TabGroup.Tab>
          <TabGroup.Tab value="2">Tab 3</TabGroup.Tab>
        </TabGroup.List>
        <TabGroup.Panel value="0">Panel 1</TabGroup.Panel>
        <TabGroup.Panel value="1">Panel 2</TabGroup.Panel>
        <TabGroup.Panel value="2">Panel 3</TabGroup.Panel>
      </TabGroup.Root>,
    );

    const tabs = screen.getAllByRole("tab");

    expect(tabs[0]).not.toBeUndefined();
    expect(tabs[2]).not.toBeUndefined();

    await userEvent.click(tabs[0]!);

    expect(handleActiveTabChange.mock.calls.length).toBe(1);
    expect(handleActiveTabChange.mock.calls[0]?.[0]).toBe("0");
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 1/i);

    await userEvent.click(tabs[2]!);

    expect(handleActiveTabChange.mock.calls.length).toBe(2);
    expect(handleActiveTabChange.mock.calls[1]?.[0]).toBe("2");
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 3/i);
  });

  it("selects tabs with keyboard interactions and calls `onActiveTabChange` callback", async () => {
    const handleActiveTabChange = jest.fn<void, [tabValue: string]>();

    userEvent.setup();
    render(
      <TabGroup.Root onActiveTabChange={handleActiveTabChange}>
        <TabGroup.List label={{ screenReaderLabel: tabListLabel }}>
          <TabGroup.Tab value="0">Tab 1</TabGroup.Tab>
          <TabGroup.Tab value="1">Tab 2</TabGroup.Tab>
          <TabGroup.Tab value="2">Tab 3</TabGroup.Tab>
        </TabGroup.List>
        <TabGroup.Panel value="0">Panel 1</TabGroup.Panel>
        <TabGroup.Panel value="1">Panel 2</TabGroup.Panel>
        <TabGroup.Panel value="2">Panel 3</TabGroup.Panel>
      </TabGroup.Root>,
    );

    const tabs = screen.getAllByRole("tab");

    act(() => void tabs[0]?.focus());
    expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleActiveTabChange.mock.calls.length).toBe(1);
    expect(handleActiveTabChange.mock.calls[0]?.[0]).toBe("0");
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 1/i);

    act(() => void tabs[2]?.focus());
    expect(tabs[2]).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleActiveTabChange.mock.calls.length).toBe(2);
    expect(handleActiveTabChange.mock.calls[1]?.[0]).toBe("2");
    expect(screen.getAllByRole("tabpanel").length).toBe(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/panel 3/i);
  });
});

describe("TabGroup.List", () => {
  afterEach(jest.clearAllMocks);

  const Base = () => (
    <TabGroup.Root>
      <TabGroup.List
        label={{ screenReaderLabel: tabListLabel }}
      ></TabGroup.List>
    </TabGroup.Root>
  );

  itShouldMount(Base, {});

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <TabGroup.Root>
        <TabGroup.List
          label={{ screenReaderLabel: tabListLabel }}
        ></TabGroup.List>
      </TabGroup.Root>,
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      tabListLabel,
    );
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <TabGroup.Root>
        <TabGroup.List label={{ labelledBy: "identifier" }}></TabGroup.List>
      </TabGroup.Root>,
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });
});
