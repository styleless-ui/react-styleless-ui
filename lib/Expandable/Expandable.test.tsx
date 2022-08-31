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
import Expandable, { type ExpandableProps } from "./Expandable";
import ExpandablePanel from "./Panel";
import ExpandableTrigger from "./Trigger";

describe("Expandable", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Expandable, {});
  itSupportsRef(Expandable, {}, HTMLDivElement);
  itSupportsStyle(Expandable, {});
  itSupportsDataSetProps(Expandable, {});

  it("should have the required classNames", () => {
    render(
      <Expandable
        expanded
        className={({ expanded }) => (expanded ? "root expanded" : "root")}
      >
        <ExpandableTrigger
          disabled
          className={({ disabled }) =>
            disabled ? "trigger disabled" : "trigger"
          }
        >
          Trigger
        </ExpandableTrigger>
        <ExpandablePanel className="panel">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </ExpandablePanel>
      </Expandable>
    );

    const trigger = screen.getByRole("button");
    const root = trigger.parentElement;
    const panel = screen.getByRole("region");

    expect(trigger).toHaveClass("trigger", "disabled");
    expect(root).toHaveClass("root", "expanded");
    expect(panel).toHaveClass("panel");
  });

  it("checks for `aria-labelledby` attribute on <ExpandablePanel>", () => {
    render(
      <Expandable>
        <ExpandableTrigger>Trigger</ExpandableTrigger>
        <ExpandablePanel data-testid="panel">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </ExpandablePanel>
      </Expandable>
    );

    const trigger = screen.getByRole("button");
    const panel = screen.getByTestId("panel");

    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("checks for `aria-controls` attribute on <ExpandableTrigger>", () => {
    render(
      <Expandable>
        <ExpandableTrigger>Trigger</ExpandableTrigger>
        <ExpandablePanel data-testid="panel">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </ExpandablePanel>
      </Expandable>
    );

    const trigger = screen.getByRole("button");
    const panel = screen.getByTestId("panel");

    expect(trigger).toHaveAttribute("aria-controls", panel.id);
  });

  it("expands the panel and calls `onExpand` callback", () => {
    const handleOnExpand = jest.fn<void, []>();
    const handleOnCollapse = jest.fn<void, []>();

    const props: ExpandableProps = {
      expanded: false,
      onExpand: handleOnExpand,
      onCollapse: handleOnCollapse
    };

    userEvent.setup();
    const { rerender } = render(<Expandable {...props} />);
    rerender(<Expandable {...props} expanded={true} />);

    expect(handleOnExpand.mock.calls.length).toBe(1);
    expect(handleOnExpand.mock.calls[0]?.length).toBe(0);

    expect(handleOnCollapse.mock.calls.length).toBe(0);
  });

  it("collapses the panel and calls `onCollapse` callback", () => {
    const handleOnExpand = jest.fn<void, []>();
    const handleOnCollapse = jest.fn<void, []>();

    const props: ExpandableProps = {
      expanded: true,
      onExpand: handleOnExpand,
      onCollapse: handleOnCollapse
    };

    userEvent.setup();
    const { rerender } = render(<Expandable {...props} />);
    rerender(<Expandable {...props} expanded={false} />);

    expect(handleOnCollapse.mock.calls.length).toBe(1);
    expect(handleOnCollapse.mock.calls[0]?.length).toBe(0);

    expect(handleOnExpand.mock.calls.length).toBe(0);
  });

  it("toggles the <ExpandableTrigger> with MouseEvent and calls `onExpand` and `onCollapse` callbacks", async () => {
    const handleOnExpand = jest.fn<void, []>();
    const handleOnCollapse = jest.fn<void, []>();

    userEvent.setup();
    render(
      <Expandable
        defaultExpanded={false}
        onExpand={handleOnExpand}
        onCollapse={handleOnCollapse}
      >
        <ExpandableTrigger>Trigger</ExpandableTrigger>
        <ExpandablePanel data-testid="panel">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </ExpandablePanel>
      </Expandable>
    );

    const trigger = screen.getByRole("button");

    await userEvent.click(trigger);

    expect(handleOnExpand.mock.calls.length).toBe(1);
    expect(handleOnExpand.mock.calls[0]?.length).toBe(0);

    expect(handleOnCollapse.mock.calls.length).toBe(0);

    await userEvent.click(trigger);

    expect(handleOnCollapse.mock.calls.length).toBe(1);
    expect(handleOnCollapse.mock.calls[0]?.length).toBe(0);

    expect(handleOnExpand.mock.calls.length).toBe(1);
  });

  it("toggles the <ExpandableTrigger> with KeyboardEvent and calls `onExpand` and `onCollapse` callbacks", async () => {
    const handleOnExpand = jest.fn<void, []>();
    const handleOnCollapse = jest.fn<void, []>();

    userEvent.setup();
    render(
      <Expandable
        defaultExpanded={false}
        onExpand={handleOnExpand}
        onCollapse={handleOnCollapse}
      >
        <ExpandableTrigger>Trigger</ExpandableTrigger>
        <ExpandablePanel data-testid="panel">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </ExpandablePanel>
      </Expandable>
    );

    const trigger = screen.getByRole("button");

    act(() => void trigger.focus());
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleOnExpand.mock.calls.length).toBe(1);
    expect(handleOnExpand.mock.calls[0]?.length).toBe(0);

    expect(handleOnCollapse.mock.calls.length).toBe(0);

    act(() => void trigger.focus());
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleOnCollapse.mock.calls.length).toBe(1);
    expect(handleOnCollapse.mock.calls[0]?.length).toBe(0);

    expect(handleOnExpand.mock.calls.length).toBe(1);
  });
});
