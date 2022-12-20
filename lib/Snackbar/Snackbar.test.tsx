import cls from "classnames";
import * as Snackbar from ".";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
  wait
} from "../../tests/utils";
import * as Slots from "./slots";

describe("Snackbar", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Snackbar.Root, { open: true });
  itSupportsRef(Snackbar.Root, { open: true }, HTMLDivElement);
  itSupportsStyle(
    Snackbar.Root,
    { open: true },
    `[data-slot='${Slots.Root}']`,
    { withPortal: true }
  );
  itSupportsDataSetProps(
    Snackbar.Root,
    { open: true },
    `[data-slot='${Slots.Root}']`,
    { withPortal: true }
  );

  it("should have the required classNames", () => {
    render(
      <Snackbar.Root
        open
        role="alertdialog"
        data-testid="snackbar-root"
        className={({ openState }) => cls("root", { "root--open": openState })}
      >
        <Snackbar.Content className="content" data-testid="snackbar-content">
          <Snackbar.Title className="title" data-testid="snackbar-title">
            Title
          </Snackbar.Title>
          <Snackbar.Description
            className="description"
            data-testid="snackbar-description"
          >
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum
            dolorum quod voluptas! Necessitatibus, velit perspiciatis odit
            laudantium impedit quos, non vitae id magnam sed dolore, aliquid
            aliquam dolor corporis assumenda.
          </Snackbar.Description>
          <Snackbar.Action
            data-testid="snackbar-action"
            className={({ disabled, focusedVisible }) =>
              cls("action", {
                "action--disabled": disabled,
                "action--focus-visible": focusedVisible
              })
            }
          >
            Action
          </Snackbar.Action>
        </Snackbar.Content>
      </Snackbar.Root>
    );

    const root = screen.getByTestId("snackbar-root");
    const content = screen.getByTestId("snackbar-content");
    const title = screen.getByTestId("snackbar-title");
    const description = screen.getByTestId("snackbar-description");
    const action = screen.getByTestId("snackbar-action");

    expect(root).toHaveClass("root", "root--open");
    expect(content).toHaveClass("content");
    expect(title).toHaveClass("title");
    expect(description).toHaveClass("description");
    expect(action).toHaveClass("action", "action--focus-visible");
  });

  it("should have `aria-labelledby` and `aria-describedby` attributes", () => {
    render(
      <Snackbar.Root open data-testid="snackbar-root">
        <Snackbar.Content data-testid="snackbar-content">
          <Snackbar.Title data-testid="snackbar-title">Title</Snackbar.Title>
          <Snackbar.Description data-testid="snackbar-description">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum
            dolorum quod voluptas! Necessitatibus, velit perspiciatis odit
            laudantium impedit quos, non vitae id magnam sed dolore, aliquid
            aliquam dolor corporis assumenda.
          </Snackbar.Description>
        </Snackbar.Content>
      </Snackbar.Root>
    );

    const content = screen.getByTestId("snackbar-content");
    const title = screen.getByTestId("snackbar-title");
    const description = screen.getByTestId("snackbar-description");

    expect(content).toHaveAttribute("aria-labelledby", title.id);
    expect(content).toHaveAttribute("aria-describedby", description.id);
  });

  it("closes the snackbar and focuses the specified `focusAfterClosed` element", () => {
    userEvent.setup();
    const { rerender } = render(
      <>
        <button id="focus-btn">Button</button>
        <Snackbar.Root
          open={true}
          focusAfterClosed="#focus-btn"
        ></Snackbar.Root>
      </>
    );
    rerender(
      <>
        <button id="focus-btn">Button</button>
        <Snackbar.Root
          open={false}
          focusAfterClosed="#focus-btn"
        ></Snackbar.Root>
      </>
    );

    const focusBtn = screen.getByRole("button");
    expect(focusBtn).toHaveFocus();
  });

  it("presses the Escape key and calls `onEscapeKeyUp` callback", async () => {
    const handleEscapeKeyUp = jest.fn<void, [event: KeyboardEvent]>();

    userEvent.setup();
    render(
      <Snackbar.Root open onEscapeKeyUp={handleEscapeKeyUp}></Snackbar.Root>
    );

    await userEvent.keyboard("[Escape]");

    expect(handleEscapeKeyUp.mock.calls.length).toBe(1);
    expect(handleEscapeKeyUp.mock.calls[0]?.[0]).not.toBeFalsy();
  });

  it("set `duration` and calls `onDurationEnd` callback", async () => {
    const handleDurationEnd = jest.fn<void, []>();

    const duration = 1000;

    const props: Snackbar.RootProps = {
      duration,
      open: true,
      onDurationEnd: handleDurationEnd
    };

    render(<Snackbar.Root {...props}></Snackbar.Root>);
    expect(handleDurationEnd).not.toBeCalled();

    await wait(duration);

    expect(handleDurationEnd.mock.calls.length).toBe(1);
    expect(handleDurationEnd.mock.calls[0]?.length).toBe(0);
  });
});
