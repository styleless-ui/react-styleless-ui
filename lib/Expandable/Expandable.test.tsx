import * as Expandable from ".";
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

describe("Expandable", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Expandable.Root, {});
  itSupportsRef(Expandable.Root, {}, HTMLDivElement);
  itSupportsStyle(Expandable.Root, {});
  itSupportsDataSetProps(Expandable.Root, {});

  it("should have the required classNames", () => {
    render(
      <Expandable.Root
        expanded
        className={({ expanded }) => (expanded ? "root expanded" : "root")}
      >
        <Expandable.Trigger
          disabled
          as="button"
          className={({ disabled }) =>
            disabled ? "trigger disabled" : "trigger"
          }
        >
          Trigger
        </Expandable.Trigger>
        <Expandable.Content className="content">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </Expandable.Content>
      </Expandable.Root>,
    );

    const trigger = screen.getByRole("button");
    const root = trigger.parentElement;
    const content = screen.getByRole("region");

    expect(trigger).toHaveClass("trigger", "disabled");
    expect(root).toHaveClass("root", "expanded");
    expect(content).toHaveClass("content");
  });

  it("checks for `aria-labelledby` attribute on <Expandable.Content>", () => {
    render(
      <Expandable.Root>
        <Expandable.Trigger as="button">Trigger</Expandable.Trigger>
        <Expandable.Content data-testid="content">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </Expandable.Content>
      </Expandable.Root>,
    );

    const trigger = screen.getByRole("button");
    const content = screen.getByTestId("content");

    expect(content).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("checks for `aria-controls` attribute on <Expandable.Trigger>", () => {
    render(
      <Expandable.Root>
        <Expandable.Trigger as="button">Trigger</Expandable.Trigger>
        <Expandable.Content data-testid="content">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </Expandable.Content>
      </Expandable.Root>,
    );

    const trigger = screen.getByRole("button");
    const content = screen.getByTestId("content");

    expect(trigger).toHaveAttribute("aria-controls", content.id);
  });

  it("toggles the <Expandable.Trigger> with MouseEvent and calls `onExpandChange` callback", async () => {
    const handleOnExpandChange = jest.fn<void, [expandState: boolean]>();

    userEvent.setup();
    render(
      <Expandable.Root
        defaultExpanded={false}
        onExpandChange={handleOnExpandChange}
      >
        <Expandable.Trigger as="button">Trigger</Expandable.Trigger>
        <Expandable.Content data-testid="content">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </Expandable.Content>
      </Expandable.Root>,
    );

    const trigger = screen.getByRole("button");

    await userEvent.click(trigger);

    expect(handleOnExpandChange.mock.calls.length).toBe(1);
    expect(handleOnExpandChange.mock.calls[0]?.[0]).toBe(true);

    await userEvent.click(trigger);

    expect(handleOnExpandChange.mock.calls.length).toBe(2);
    expect(handleOnExpandChange.mock.calls[1]?.[0]).toBe(false);
  });

  it("toggles the <Expandable.Trigger> with KeyboardEvent and calls `onExpandChange` callback", async () => {
    const handleOnExpandChange = jest.fn<void, [expandState: boolean]>();

    userEvent.setup();
    render(
      <Expandable.Root
        defaultExpanded={false}
        onExpandChange={handleOnExpandChange}
      >
        <Expandable.Trigger as="button">Trigger</Expandable.Trigger>
        <Expandable.Content data-testid="content">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima libero
          voluptatibus sint illo totam autem eligendi animi inventore distinctio
          nulla consequatur voluptates facere, reprehenderit nisi placeat
          cupiditate vero repellendus rerum?
        </Expandable.Content>
      </Expandable.Root>,
    );

    const trigger = screen.getByRole("button");

    act(() => void trigger.focus());
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleOnExpandChange.mock.calls.length).toBe(1);
    expect(handleOnExpandChange.mock.calls[0]?.[0]).toBe(true);

    act(() => void trigger.focus());
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("[Space]");

    expect(handleOnExpandChange.mock.calls.length).toBe(2);
    expect(handleOnExpandChange.mock.calls[1]?.[0]).toBe(false);
  });
});
