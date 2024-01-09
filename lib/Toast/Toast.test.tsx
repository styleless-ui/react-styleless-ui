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
        <Toast.Content
          className="content"
          data-testid="toast-content"
        >
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum
          dolorum quod voluptas! Necessitatibus, velit perspiciatis odit
          laudantium impedit quos, non vitae id magnam sed dolore, aliquid
          aliquam dolor corporis assumenda.
          <Toast.Action
            data-testid="toast-action"
            className="action"
          >
            Action
          </Toast.Action>
        </Toast.Content>
      </Toast.Root>,
    );

    const root = screen.getByTestId("toast-root");
    const content = screen.getByTestId("toast-content");
    const action = screen.getByTestId("toast-action");

    expect(root).toHaveClass("root", "root--open");
    expect(content).toHaveClass("content");
    expect(action).toHaveClass("action");
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
