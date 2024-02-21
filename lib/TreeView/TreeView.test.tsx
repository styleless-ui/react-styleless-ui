import classNames from "classnames";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsFocusEvents,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
} from "../../tests/utils";
import * as TreeView from "./index";
import { SubTreeLabel as SubTreeLabelSlot } from "./slots";

describe("TreeView", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(TreeView.Root, { selectability: false });
  itSupportsStyle(TreeView.Root, { selectability: false });
  itSupportsRef(TreeView.Root, { selectability: false }, HTMLDivElement);
  itSupportsFocusEvents(
    TreeView.Root,
    { selectability: false },
    "[role='tree']",
  );
  itSupportsDataSetProps(TreeView.Root, { selectability: false });

  it("should have the required classNames", async () => {
    const itemClassName: TreeView.ItemProps["className"] = props => {
      const { active, expandable, expanded, selected, disabled } = props;

      return classNames("treeview__item", {
        "treeview__item--active": active,
        "treeview__item--expanded": expanded,
        "treeview__item--disabled": disabled,
        "treeview__item--expandable": expandable,
        "treeview__item--selected": selected,
      });
    };

    const rootClassName: TreeView.RootProps["className"] = props => {
      const { selectMode, selectable } = props;

      return classNames("treeview", {
        "treeview--selectable": selectable,
        [`treeview--${String(selectMode)}`]: selectMode,
      });
    };

    const subTreeClassName: TreeView.SubTreeProps["classes"] = props => {
      const { open } = props;

      return {
        root: classNames("treeview__subtree", {
          "treeview__subtree--open": open,
        }),
        label: "treeview__subtree__label",
      };
    };

    render(
      <TreeView.Root
        className={rootClassName}
        defaultExpandedDescendants={["2"]}
        selectability={"multi-select"}
      >
        <TreeView.Item
          className={itemClassName}
          value="1"
          data-testid="1"
          triggerContent={<div>File 1</div>}
        />
        <TreeView.Item
          className={itemClassName}
          value="2"
          data-testid="2"
          triggerContent={<div>File 2</div>}
          subTree={
            <TreeView.SubTree
              classes={subTreeClassName}
              label="Sub Tree 1"
            >
              <TreeView.Item
                className={itemClassName}
                value="3"
                data-testid="3"
                triggerContent={<div>File 3</div>}
              />
              <TreeView.Item
                className={itemClassName}
                disabled
                value="4"
                data-testid="4"
                triggerContent={<div>File 4</div>}
              />
            </TreeView.SubTree>
          }
        />
      </TreeView.Root>,
    );

    const tree = screen.getByRole("tree");

    expect(tree).toHaveClass(
      "treeview",
      "treeview--multi-select",
      "treeview--selectable",
    );

    expect(screen.getByTestId("1")).toHaveClass("treeview__item");
    expect(screen.getByTestId("2")).toHaveClass(
      "treeview__item",
      "treeview__item--expandable",
      "treeview__item--expanded",
    );
    expect(screen.getByTestId("3")).toHaveClass("treeview__item");
    expect(screen.getByTestId("4")).toHaveClass(
      "treeview__item",
      "treeview__item--disabled",
    );

    expect(screen.getByRole("group")).toHaveClass(
      "treeview__subtree",
      "treeview__subtree--open",
    );
    expect(
      screen
        .getByRole("group")
        .querySelector(`[data-slot="${SubTreeLabelSlot}"]`),
    ).toHaveClass("treeview__subtree__label");

    await userEvent.tab();

    expect(tree).toHaveFocus();

    expect(screen.getByTestId("1")).toHaveClass(
      "treeview__item",
      "treeview__item--active",
    );
    expect(screen.getByTestId("2")).toHaveClass("treeview__item");
  });

  it("should have the required aria attributes", async () => {
    render(
      <TreeView.Root
        defaultExpandedDescendants={["2"]}
        defaultSelectedDescendants={["1"]}
        selectability={"multi-select"}
      >
        <TreeView.Item
          value="1"
          data-testid="1"
          triggerContent={<div>File 1</div>}
        />
        <TreeView.Item
          value="2"
          data-testid="2"
          triggerContent={<div>File 2</div>}
          subTree={
            <TreeView.SubTree label={{ screenReaderLabel: "label" }}>
              <TreeView.Item
                value="3"
                data-testid="3"
                triggerContent={<div>File 3</div>}
              />
              <TreeView.Item
                value="4"
                disabled
                data-testid="4"
                triggerContent={<div>File 4</div>}
              />
            </TreeView.SubTree>
          }
        />
        <TreeView.Item
          value="5"
          disabled
          data-testid="5"
          triggerContent={<div>File 5</div>}
        />
      </TreeView.Root>,
    );

    await userEvent.tab();

    expect(screen.getByRole("tree")).toHaveAttribute("aria-activedescendant");
    expect(screen.getByRole("tree")).toHaveAttribute(
      "aria-multiselectable",
      "true",
    );

    expect(screen.getByTestId("1")).not.toHaveAttribute("aria-expanded");
    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("1")).toHaveAttribute("aria-disabled", "false");
    expect(screen.getByTestId("1")).toHaveAttribute("aria-level", "1");
    expect(screen.getByTestId("1")).toHaveAttribute("aria-posinset", "1");
    expect(screen.getByTestId("1")).toHaveAttribute("aria-setsize", "3");

    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-disabled", "false");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-level", "1");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-posinset", "2");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-setsize", "3");

    expect(screen.getByTestId("5")).not.toHaveAttribute("aria-expanded");
    expect(screen.getByTestId("5")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByTestId("5")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("5")).toHaveAttribute("aria-level", "1");
    expect(screen.getByTestId("5")).toHaveAttribute("aria-posinset", "3");
    expect(screen.getByTestId("5")).toHaveAttribute("aria-setsize", "3");

    expect(screen.getByRole("group")).toHaveAttribute("aria-label", "label");

    expect(screen.getByTestId("3")).not.toHaveAttribute("aria-expanded");
    expect(screen.getByTestId("3")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("3")).toHaveAttribute("aria-disabled", "false");
    expect(screen.getByTestId("3")).toHaveAttribute("aria-level", "2");
    expect(screen.getByTestId("3")).toHaveAttribute("aria-posinset", "1");
    expect(screen.getByTestId("3")).toHaveAttribute("aria-setsize", "2");

    expect(screen.getByTestId("4")).not.toHaveAttribute("aria-expanded");
    expect(screen.getByTestId("4")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("4")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByTestId("4")).toHaveAttribute("aria-level", "2");
    expect(screen.getByTestId("4")).toHaveAttribute("aria-posinset", "2");
    expect(screen.getByTestId("4")).toHaveAttribute("aria-setsize", "2");
  });

  it("should properly move the active element by keyboard", async () => {
    const handleExpandStateChange = jest.fn<void, [expanded: string[]]>();

    const { unmount } = render(
      <TreeView.Root
        selectability={false}
        onExpandStateChange={handleExpandStateChange}
      >
        <TreeView.Item
          value="1"
          data-testid="1"
          triggerContent={<div>File 1</div>}
        />
        <TreeView.Item
          value="2"
          data-testid="2"
          triggerContent={<div>File 2</div>}
          subTree={
            <TreeView.SubTree label={{ screenReaderLabel: "label" }}>
              <TreeView.Item
                value="3"
                data-testid="3"
                triggerContent={<div>File 3</div>}
              />
              <TreeView.Item
                value="4"
                disabled
                data-testid="4"
                triggerContent={<div>File 4</div>}
              />
            </TreeView.SubTree>
          }
        />
        <TreeView.Item
          value="5"
          disabled
          data-testid="5"
          triggerContent={<div>File 5</div>}
        />
      </TreeView.Root>,
    );

    await userEvent.tab();

    expect(screen.getByRole("tree")).toHaveFocus();
    expect(screen.getByTestId("1")).toHaveAttribute("data-active");

    await userEvent.keyboard("[ArrowDown]");

    expect(screen.getByTestId("1")).not.toHaveAttribute("data-active");
    expect(screen.getByTestId("2")).toHaveAttribute("data-active");

    await userEvent.keyboard("[ArrowRight]");

    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("data-active");
    expect(screen.getByTestId("3")).toBeInTheDocument();
    expect(handleExpandStateChange.mock.calls.length).toBe(1);
    expect(handleExpandStateChange.mock.calls[0]?.[0]).toEqual(["2"]);

    await userEvent.keyboard("[ArrowLeft]");

    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("2")).toHaveAttribute("data-active");
    expect(screen.queryByTestId("3")).not.toBeInTheDocument();
    expect(handleExpandStateChange.mock.calls.length).toBe(2);
    expect(handleExpandStateChange.mock.calls[1]?.[0]).toEqual([]);

    await userEvent.keyboard("[ArrowRight]");
    await userEvent.keyboard("[ArrowRight]");

    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("2")).not.toHaveAttribute("data-active");
    expect(screen.getByTestId("3")).toHaveAttribute("data-active");
    expect(handleExpandStateChange.mock.calls.length).toBe(3);
    expect(handleExpandStateChange.mock.calls[2]?.[0]).toEqual(["2"]);

    await userEvent.keyboard("[ArrowLeft]");
    await userEvent.keyboard("[ArrowLeft]");

    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("2")).toHaveAttribute("data-active");
    expect(screen.queryByTestId("3")).not.toBeInTheDocument();
    expect(handleExpandStateChange.mock.calls.length).toBe(4);
    expect(handleExpandStateChange.mock.calls[3]?.[0]).toEqual([]);

    await userEvent.keyboard("[Enter]");

    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("data-active");
    expect(screen.getByTestId("3")).toBeInTheDocument();
    expect(handleExpandStateChange.mock.calls.length).toBe(5);
    expect(handleExpandStateChange.mock.calls[4]?.[0]).toEqual(["2"]);

    await userEvent.keyboard("[ArrowDown]");

    expect(screen.getByTestId("3")).toHaveAttribute("data-active");

    await userEvent.keyboard("[ArrowDown]");

    expect(screen.getByTestId("1")).toHaveAttribute("data-active");

    await userEvent.keyboard("[ArrowUp]");

    expect(screen.getByTestId("3")).toHaveAttribute("data-active");

    unmount();
    handleExpandStateChange.mockReset();

    render(
      <TreeView.Root
        selectability={false}
        onExpandStateChange={handleExpandStateChange}
      >
        <TreeView.Item
          value="1"
          data-testid="1"
          triggerContent={<div>File 1</div>}
        />
        <TreeView.Item
          value="2"
          data-testid="2"
          triggerContent={<div>File 2</div>}
          subTree={
            <TreeView.SubTree label={{ screenReaderLabel: "label" }}>
              <TreeView.Item
                value="3"
                disabled
                data-testid="3"
                triggerContent={<div>File 3</div>}
              />
              <TreeView.Item
                value="4"
                disabled
                data-testid="4"
                triggerContent={<div>File 4</div>}
              />
            </TreeView.SubTree>
          }
        />
        <TreeView.Item
          value="5"
          disabled
          data-testid="5"
          triggerContent={<div>File 5</div>}
        />
      </TreeView.Root>,
    );

    await userEvent.tab();

    expect(screen.getByRole("tree")).toHaveFocus();
    expect(screen.getByTestId("1")).toHaveAttribute("data-active");

    await userEvent.keyboard("[ArrowDown]");

    expect(screen.getByTestId("1")).not.toHaveAttribute("data-active");
    expect(screen.getByTestId("2")).toHaveAttribute("data-active");

    await userEvent.keyboard("[ArrowRight]");

    expect(screen.getByTestId("2")).toHaveAttribute("data-active");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("3")).toBeInTheDocument();
    expect(screen.getByTestId("4")).toBeInTheDocument();
    expect(handleExpandStateChange.mock.calls.length).toBe(1);
    expect(handleExpandStateChange.mock.calls[0]?.[0]).toEqual(["2"]);

    await userEvent.keyboard("[ArrowRight]");

    expect(screen.getByTestId("2")).toHaveAttribute("data-active");

    await userEvent.keyboard("[ArrowDown]");

    expect(screen.getByTestId("1")).toHaveAttribute("data-active");
  });

  it("should properly select the active element by keyboard", async () => {
    const handleSelectStateChange = jest.fn<void, [selected: string[]]>();
    const handleExpandStateChange = jest.fn<void, [expanded: string[]]>();

    const { unmount } = render(
      <TreeView.Root
        selectability={"single-select"}
        onExpandStateChange={handleExpandStateChange}
        onSelectStateChange={handleSelectStateChange}
      >
        <TreeView.Item
          value="1"
          disabled
          data-testid="1"
          triggerContent={<div>File 1</div>}
        />
        <TreeView.Item
          value="2"
          data-testid="2"
          triggerContent={<div>File 2</div>}
          subTree={
            <TreeView.SubTree label={{ screenReaderLabel: "label" }}>
              <TreeView.Item
                value="3"
                data-testid="3"
                triggerContent={<div>File 3</div>}
              />
              <TreeView.Item
                value="4"
                disabled
                data-testid="4"
                triggerContent={<div>File 4</div>}
              />
            </TreeView.SubTree>
          }
        />
        <TreeView.Item
          value="5"
          data-testid="5"
          triggerContent={<div>File 5</div>}
        />
      </TreeView.Root>,
    );

    await userEvent.tab();

    expect(screen.getByRole("tree")).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(screen.getByTestId("1")).not.toHaveAttribute(
      "aria-selected",
      "true",
    );

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(1);
    expect(handleSelectStateChange.mock.calls[0]?.[0]).toEqual(["2"]);
    expect(handleExpandStateChange.mock.calls.length).toBe(0);

    await userEvent.keyboard("[Enter]");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(1);
    expect(handleSelectStateChange.mock.calls[0]?.[0]).toEqual(["2"]);
    expect(handleExpandStateChange.mock.calls.length).toBe(1);
    expect(handleSelectStateChange.mock.calls[0]?.[0]).toEqual(["2"]);

    await userEvent.keyboard("[ArrowDown]");
    await userEvent.keyboard("[Space]");

    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("3")).toHaveAttribute("aria-selected", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(2);
    expect(handleSelectStateChange.mock.calls[1]?.[0]).toEqual(["3"]);

    await userEvent.keyboard("[ArrowUp]");
    await userEvent.keyboard("[Enter]");

    expect(handleExpandStateChange.mock.calls.length).toBe(2);
    expect(handleExpandStateChange.mock.calls[1]?.[0]).toEqual([]);
    expect(handleSelectStateChange.mock.calls.length).toBe(2);
    expect(handleSelectStateChange.mock.calls[1]?.[0]).toEqual(["3"]);

    await userEvent.keyboard("[ArrowDown]");
    await userEvent.keyboard("[Space]");

    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("5")).toHaveAttribute("aria-selected", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(3);
    expect(handleSelectStateChange.mock.calls[2]?.[0]).toEqual(["5"]);

    unmount();
    handleSelectStateChange.mockReset();
    handleExpandStateChange.mockReset();

    render(
      <TreeView.Root
        selectability={"multi-select"}
        onExpandStateChange={handleExpandStateChange}
        onSelectStateChange={handleSelectStateChange}
      >
        <TreeView.Item
          value="1"
          data-testid="1"
          triggerContent={<div>File 1</div>}
        />
        <TreeView.Item
          value="2"
          data-testid="2"
          triggerContent={<div>File 2</div>}
          subTree={
            <TreeView.SubTree label={{ screenReaderLabel: "label" }}>
              <TreeView.Item
                value="3"
                disabled
                data-testid="3"
                triggerContent={<div>File 3</div>}
              />
              <TreeView.Item
                value="4"
                data-testid="4"
                triggerContent={<div>File 4</div>}
              />
            </TreeView.SubTree>
          }
        />
      </TreeView.Root>,
    );

    await userEvent.tab();

    expect(screen.getByRole("tree")).toHaveFocus();

    await userEvent.keyboard("[Space]");

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(1);
    expect(handleSelectStateChange.mock.calls[0]?.[0]).toEqual(["1"]);

    await userEvent.keyboard("[ArrowDown]");
    await userEvent.keyboard("[Space]");

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(2);
    expect(handleSelectStateChange.mock.calls[1]?.[0]).toEqual(["1", "2"]);

    await userEvent.keyboard("[Space]");

    expect(handleSelectStateChange.mock.calls.length).toBe(3);
    expect(handleSelectStateChange.mock.calls[2]?.[0]).toEqual(["1"]);

    await userEvent.keyboard("[Enter]");

    expect(handleSelectStateChange.mock.calls.length).toBe(3);
    expect(handleSelectStateChange.mock.calls[2]?.[0]).toEqual(["1"]);
    expect(handleExpandStateChange.mock.calls.length).toBe(1);
    expect(handleExpandStateChange.mock.calls[0]?.[0]).toEqual(["2"]);

    await userEvent.keyboard("[ArrowDown]");
    await userEvent.keyboard("[Space]");

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("4")).toHaveAttribute("aria-selected", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(4);
    expect(handleSelectStateChange.mock.calls[3]?.[0]).toEqual(["1", "4"]);
  });

  it("should be correctly interactive with mouse", async () => {
    const handleSelectStateChange = jest.fn<void, [selected: string[]]>();
    const handleExpandStateChange = jest.fn<void, [expanded: string[]]>();

    const { unmount } = render(
      <TreeView.Root
        selectability={"single-select"}
        onExpandStateChange={handleExpandStateChange}
        onSelectStateChange={handleSelectStateChange}
      >
        <TreeView.Item
          value="1"
          data-testid="1"
          triggerContent={<div data-testid="trigger-1">File 1</div>}
        />
        <TreeView.Item
          value="2"
          data-testid="2"
          triggerContent={<div data-testid="trigger-2">File 1</div>}
          subTree={
            <TreeView.SubTree label={{ screenReaderLabel: "label" }}>
              <TreeView.Item
                value="3"
                data-testid="3"
                triggerContent={<div data-testid="trigger-3">File 1</div>}
              />
            </TreeView.SubTree>
          }
        />
        <TreeView.Item
          value="4"
          disabled
          data-testid="4"
          triggerContent={<div data-testid="trigger-4">File 4</div>}
        />
      </TreeView.Root>,
    );

    await userEvent.hover(screen.getByTestId("trigger-1"));

    expect(screen.getByTestId("1")).toHaveAttribute("data-active");

    await userEvent.click(screen.getByTestId("trigger-1"));

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(1);
    expect(handleSelectStateChange.mock.calls[0]?.[0]).toEqual(["1"]);

    await userEvent.unhover(screen.getByTestId("trigger-1"));

    expect(screen.getByTestId("1")).not.toHaveAttribute("data-active");

    await userEvent.click(screen.getByTestId("trigger-2"));

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(2);
    expect(handleSelectStateChange.mock.calls[1]?.[0]).toEqual(["2"]);
    expect(handleExpandStateChange.mock.calls.length).toBe(1);
    expect(handleExpandStateChange.mock.calls[0]?.[0]).toEqual(["2"]);

    await userEvent.click(screen.getByTestId("trigger-3"));

    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("3")).toHaveAttribute("aria-selected", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(3);
    expect(handleSelectStateChange.mock.calls[2]?.[0]).toEqual(["3"]);

    await userEvent.click(screen.getByTestId("trigger-2"));

    expect(screen.queryByTestId("3")).not.toBeInTheDocument();
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "false");
    expect(handleSelectStateChange.mock.calls.length).toBe(4);
    expect(handleSelectStateChange.mock.calls[3]?.[0]).toEqual(["2"]);
    expect(handleExpandStateChange.mock.calls.length).toBe(2);
    expect(handleExpandStateChange.mock.calls[1]?.[0]).toEqual([]);

    await userEvent.click(screen.getByTestId("trigger-4"));

    expect(screen.getByTestId("4")).toHaveAttribute("aria-selected", "false");
    expect(handleSelectStateChange.mock.calls.length).toBe(4);
    expect(handleSelectStateChange.mock.calls[3]?.[0]).toEqual(["2"]);

    await userEvent.hover(screen.getByTestId("trigger-4"));

    expect(screen.getByTestId("4")).not.toHaveAttribute("data-active");

    await userEvent.unhover(screen.getByTestId("trigger-4"));

    expect(screen.getByTestId("4")).not.toHaveAttribute("data-active");

    unmount();
    handleSelectStateChange.mockReset();
    handleExpandStateChange.mockReset();

    render(
      <TreeView.Root
        selectability={"multi-select"}
        onExpandStateChange={handleExpandStateChange}
        onSelectStateChange={handleSelectStateChange}
      >
        <TreeView.Item
          value="1"
          data-testid="1"
          triggerContent={<div data-testid="trigger-1">File 1</div>}
        />
        <TreeView.Item
          value="2"
          data-testid="2"
          triggerContent={<div data-testid="trigger-2">File 1</div>}
          subTree={
            <TreeView.SubTree label={{ screenReaderLabel: "label" }}>
              <TreeView.Item
                value="3"
                data-testid="3"
                triggerContent={<div data-testid="trigger-3">File 1</div>}
              />
            </TreeView.SubTree>
          }
        />
      </TreeView.Root>,
    );

    await userEvent.hover(screen.getByTestId("trigger-2"));

    expect(screen.getByTestId("2")).toHaveAttribute("data-active");

    await userEvent.unhover(screen.getByTestId("trigger-2"));

    expect(screen.getByTestId("2")).not.toHaveAttribute("data-active");

    await userEvent.click(screen.getByTestId("trigger-2"));

    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("3")).toBeInTheDocument();
    expect(handleSelectStateChange.mock.calls.length).toBe(1);
    expect(handleSelectStateChange.mock.calls[0]?.[0]).toEqual(["2"]);
    expect(handleExpandStateChange.mock.calls.length).toBe(1);
    expect(handleExpandStateChange.mock.calls[0]?.[0]).toEqual(["2"]);

    await userEvent.click(screen.getByTestId("trigger-1"));

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(2);
    expect(handleSelectStateChange.mock.calls[1]?.[0]).toEqual(["2", "1"]);

    await userEvent.click(screen.getByTestId("trigger-3"));

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("3")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "true");
    expect(handleSelectStateChange.mock.calls.length).toBe(3);
    expect(handleSelectStateChange.mock.calls[2]?.[0]).toEqual(["2", "1", "3"]);

    await userEvent.click(screen.getByTestId("trigger-2"));

    expect(screen.getByTestId("1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("2")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("3")).not.toBeInTheDocument();
    expect(handleSelectStateChange.mock.calls.length).toBe(4);
    expect(handleSelectStateChange.mock.calls[3]?.[0]).toEqual(["1", "3"]);
    expect(handleExpandStateChange.mock.calls.length).toBe(2);
    expect(handleExpandStateChange.mock.calls[1]?.[0]).toEqual([]);
  });
});
