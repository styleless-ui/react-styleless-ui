import cls from "classnames";
import * as Toast from ".";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
  wait,
} from "../../tests/utils";
import * as Slots from "./slots";

describe("Toast", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Toast.Root, { open: true, role: "status" });
  itSupportsRef(Toast.Root, { open: true, role: "status" }, HTMLDivElement);
  itSupportsStyle(
    Toast.Root,
    { open: true, role: "status" },
    `[data-slot='${Slots.Root}']`,
    { withPortal: true },
  );
  itSupportsDataSetProps(
    Toast.Root,
    { open: true, role: "status" },
    `[data-slot='${Slots.Root}']`,
    { withPortal: true },
  );

  it("should have the required classNames", () => {
    render(
      <Toast.Root
        open
        role="status"
        data-testid="toast-root"
        className={({ openState }) => cls("root", { "root--open": openState })}
      >
        <Toast.Content className="content" data-testid="toast-content">
          <Toast.Title className="title" data-testid="toast-title">
            Title
          </Toast.Title>
          <Toast.Description
            className="description"
            data-testid="toast-description"
          >
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum
            dolorum quod voluptas! Necessitatibus, velit perspiciatis odit
            laudantium impedit quos, non vitae id magnam sed dolore, aliquid
            aliquam dolor corporis assumenda.
          </Toast.Description>
          <Toast.Action
            data-testid="toast-action"
            className={({ disabled, focusedVisible }) =>
              cls("action", {
                "action--disabled": disabled,
                "action--focus-visible": focusedVisible,
              })
            }
          >
            Action
          </Toast.Action>
        </Toast.Content>
      </Toast.Root>,
    );

    const root = screen.getByTestId("toast-root");
    const content = screen.getByTestId("toast-content");
    const title = screen.getByTestId("toast-title");
    const description = screen.getByTestId("toast-description");
    const action = screen.getByTestId("toast-action");

    expect(root).toHaveClass("root", "root--open");
    expect(content).toHaveClass("content");
    expect(title).toHaveClass("title");
    expect(description).toHaveClass("description");
    expect(action).toHaveClass("action", "action--focus-visible");
  });

  it("should have `aria-labelledby` and `aria-describedby` attributes", () => {
    render(
      <Toast.Root open role="status" data-testid="toast-root">
        <Toast.Content data-testid="toast-content">
          <Toast.Title data-testid="toast-title">Title</Toast.Title>
          <Toast.Description data-testid="toast-description">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum
            dolorum quod voluptas! Necessitatibus, velit perspiciatis odit
            laudantium impedit quos, non vitae id magnam sed dolore, aliquid
            aliquam dolor corporis assumenda.
          </Toast.Description>
        </Toast.Content>
      </Toast.Root>,
    );

    const content = screen.getByTestId("toast-content");
    const title = screen.getByTestId("toast-title");
    const description = screen.getByTestId("toast-description");

    expect(content).toHaveAttribute("aria-labelledby", title.id);
    expect(content).toHaveAttribute("aria-describedby", description.id);
  });

  it("closes the toast and focuses the specified `focusAfterClosed` element", () => {
    userEvent.setup();
    const { rerender } = render(
      <>
        <button id="focus-btn">Button</button>
        <Toast.Root
          role="status"
          open={true}
          focusAfterClosed="#focus-btn"
        ></Toast.Root>
      </>,
    );

    rerender(
      <>
        <button id="focus-btn">Button</button>
        <Toast.Root
          role="status"
          open={false}
          focusAfterClosed="#focus-btn"
        ></Toast.Root>
      </>,
    );

    const focusBtn = screen.getByRole("button");

    expect(focusBtn).toHaveFocus();
  });

  it("presses the Escape key and calls `onEscapeKeyUp` callback", async () => {
    const handleEscapeKeyUp = jest.fn<void, [event: KeyboardEvent]>();

    userEvent.setup();
    render(
      <Toast.Root
        open
        role="status"
        onEscapeKeyUp={handleEscapeKeyUp}
      ></Toast.Root>,
    );

    await userEvent.keyboard("[Escape]");

    expect(handleEscapeKeyUp.mock.calls.length).toBe(1);
    expect(handleEscapeKeyUp.mock.calls[0]?.[0]).not.toBeFalsy();
  });

  it("set `duration` and calls `onDurationEnd` callback", async () => {
    const handleDurationEnd = jest.fn<void, []>();

    const duration = 1000;

    const props: Toast.RootProps = {
      duration,
      role: "status",
      open: true,
      onDurationEnd: handleDurationEnd,
    };

    render(<Toast.Root {...props}></Toast.Root>);
    expect(handleDurationEnd).not.toHaveBeenCalled();

    await wait(duration);

    expect(handleDurationEnd.mock.calls.length).toBe(1);
    expect(handleDurationEnd.mock.calls[0]?.length).toBe(0);
  });
});
