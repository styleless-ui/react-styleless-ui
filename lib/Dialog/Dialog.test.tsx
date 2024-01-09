import cls from "classnames";
import * as React from "react";
import * as Dialog from ".";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent,
} from "../../tests/utils";
import * as Slots from "./slots";

describe("Dialog", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Dialog.Root, { role: "dialog", open: true });
  itSupportsRef(Dialog.Root, { role: "dialog", open: true }, HTMLDivElement);
  itSupportsStyle(
    Dialog.Root,
    { role: "dialog", open: true },
    `[data-slot='${Slots.Root}']`,
    { withPortal: true },
  );
  itSupportsDataSetProps(
    Dialog.Root,
    { role: "dialog", open: true },
    `[data-slot='${Slots.Root}']`,
    { withPortal: true },
  );

  it("should have the required classNames", () => {
    render(
      <Dialog.Root
        open
        role="dialog"
        data-testid="dialog-root"
        classes={({ openState }) => ({
          root: cls("root", { "root--open": openState }),
          backdrop: "backdrop",
        })}
      >
        <Dialog.Content
          className="content"
          data-testid="dialog-content"
        >
          <Dialog.Title
            as="strong"
            className="title"
            data-testid="dialog-title"
          >
            Title
          </Dialog.Title>
          <Dialog.Description
            as="p"
            className="description"
            data-testid="dialog-description"
          >
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum
            dolorum quod voluptas! Necessitatibus, velit perspiciatis odit
            laudantium impedit quos, non vitae id magnam sed dolore, aliquid
            aliquam dolor corporis assumenda.
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const root = screen.getByTestId("dialog-root");
    const content = screen.getByTestId("dialog-content");
    const title = screen.getByTestId("dialog-title");
    const description = screen.getByTestId("dialog-description");

    expect(root).toHaveClass("root", "root--open");
    expect(content).toHaveClass("content");
    expect(title).toHaveClass("title");
    expect(description).toHaveClass("description");
  });

  it("should have `aria-labelledby` and `aria-describedby` attributes", () => {
    render(
      <Dialog.Root
        open
        role="dialog"
        data-testid="dialog-root"
      >
        <Dialog.Content data-testid="dialog-content">
          <Dialog.Title
            as="strong"
            data-testid="dialog-title"
          >
            Title
          </Dialog.Title>
          <Dialog.Description
            as="p"
            data-testid="dialog-description"
          >
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum
            dolorum quod voluptas! Necessitatibus, velit perspiciatis odit
            laudantium impedit quos, non vitae id magnam sed dolore, aliquid
            aliquam dolor corporis assumenda.
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const content = screen.getByTestId("dialog-content");
    const title = screen.getByTestId("dialog-title");
    const description = screen.getByTestId("dialog-description");

    expect(content).toHaveAttribute("aria-labelledby", title.id);
    expect(content).toHaveAttribute("aria-describedby", description.id);
  });

  it("closes the dialog and focuses the specified `focusAfterClosed` element", () => {
    const props: Dialog.RootProps = {
      role: "dialog",
      open: false,
      focusAfterClosed: "#focus-btn",
    };

    userEvent.setup();
    const { rerender } = render(
      <>
        <button id="focus-btn">Button</button>
        <Dialog.Root
          {...props}
          open={true}
        ></Dialog.Root>
      </>,
    );

    rerender(
      <>
        <button id="focus-btn">Button</button>
        <Dialog.Root
          {...props}
          open={false}
        ></Dialog.Root>
      </>,
    );

    const focusBtn = screen.getByRole("button");

    expect(focusBtn).toHaveFocus();
  });

  it("clicks the backdrop and calls `onBackdropClick` callback", async () => {
    const handleBackdropClick = jest.fn<
      void,
      [event: React.MouseEvent<HTMLDivElement>]
    >();

    userEvent.setup();
    render(
      <Dialog.Root
        open
        role="dialog"
        onBackdropClick={handleBackdropClick}
      />,
    );

    const portal = screen.getByRole("presentation");
    const backdrop = portal.querySelector<HTMLElement>(
      `[data-slot="${Slots.Backdrop}"]`,
    );

    expect(backdrop).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userEvent.click(backdrop!);

    expect(handleBackdropClick.mock.calls.length).toBe(1);
    expect(handleBackdropClick.mock.calls[0]?.[0]).not.toBeFalsy();
  });
});
