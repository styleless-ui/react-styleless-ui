import * as React from "react";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
  userEvent
} from "../../tests/utils";
import DialogDescription from "./Description";
import Dialog, { type DialogProps } from "./Dialog";
import DialogTitle from "./Title";

describe("Dialog", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Dialog, { role: "dialog", open: true });
  itSupportsRef(Dialog, { role: "dialog", open: true }, HTMLDivElement);
  itSupportsStyle(
    Dialog,
    { role: "dialog", open: true },
    "[data-slot='dialogRoot']",
    { withPortal: true }
  );
  itSupportsDataSetProps(
    Dialog,
    { role: "dialog", open: true },
    "[data-slot='dialogRoot']",
    { withPortal: true }
  );

  it("should have the required classNames", () => {
    render(
      <Dialog
        open
        role="dialog"
        classes={{ backdrop: "backdrop", panel: "panel", root: "root" }}
      />
    );

    const dialog = screen.getByRole("dialog");
    const root = dialog.parentElement;
    const backdrop = root?.firstElementChild;

    expect(dialog).toHaveClass("panel");
    expect(root).toHaveClass("root");
    expect(backdrop).toHaveClass("backdrop");
  });

  it("uses <DialogTitle> and checks for `aria-labelledby` attribute", () => {
    render(
      <Dialog open role="dialog">
        <DialogTitle data-testid="title">Dialog Title</DialogTitle>
      </Dialog>
    );

    const dialog = screen.getByRole("dialog");
    const title = screen.getByTestId("title");

    expect(dialog).toHaveAttribute("aria-labelledby", title.id);
  });

  it("uses <DialogDescription> and checks for `aria-describedby` attribute", () => {
    render(
      <Dialog open role="dialog">
        <DialogDescription data-testid="description">
          Dialog Description
        </DialogDescription>
      </Dialog>
    );

    const dialog = screen.getByRole("dialog");
    const description = screen.getByTestId("description");

    expect(dialog).toHaveAttribute("aria-describedby", description.id);
  });

  it("opens the dialog and calls `onOpen` callback", () => {
    const handleOnOpen = jest.fn<void, []>();
    const handleOnClose = jest.fn<void, []>();

    const props: DialogProps = {
      role: "dialog",
      open: false,
      onOpen: handleOnOpen,
      onClose: handleOnClose
    };

    userEvent.setup();
    const { rerender } = render(<Dialog {...props}></Dialog>);
    rerender(<Dialog {...props} open={true}></Dialog>);

    expect(handleOnOpen.mock.calls.length).toBe(1);
    expect(handleOnOpen.mock.calls[0]?.length).toBe(0);

    expect(handleOnClose.mock.calls.length).toBe(0);
  });

  it("closes the dialog and calls `onClose` callback", () => {
    const handleOnOpen = jest.fn<void, []>();
    const handleOnClose = jest.fn<void, []>();

    const props: DialogProps = {
      role: "dialog",
      open: true,
      onOpen: handleOnOpen,
      onClose: handleOnClose
    };

    userEvent.setup();
    const { rerender } = render(<Dialog {...props}></Dialog>);
    rerender(<Dialog {...props} open={false}></Dialog>);

    expect(handleOnClose.mock.calls.length).toBe(1);
    expect(handleOnClose.mock.calls[0]?.length).toBe(0);

    expect(handleOnOpen.mock.calls.length).toBe(0);
  });

  it("closes the dialog and focuses the specified `focusAfterClosed` element", () => {
    const props: DialogProps = {
      role: "dialog",
      open: false,
      focusAfterClosed: "#focus-btn"
    };

    userEvent.setup();
    const { rerender } = render(
      <>
        <button id="focus-btn">Button</button>
        <Dialog {...props} open={true}></Dialog>
      </>
    );
    rerender(
      <>
        <button id="focus-btn">Button</button>
        <Dialog {...props} open={false}></Dialog>
      </>
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
      <Dialog open role="dialog" onBackdropClick={handleBackdropClick}></Dialog>
    );

    const portal = screen.getByRole("presentation");
    const backdrop = portal.querySelector<HTMLElement>(
      '[data-slot="dialogBackdrop"]'
    );

    expect(backdrop).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userEvent.click(backdrop!);

    expect(handleBackdropClick.mock.calls.length).toBe(1);
    expect(handleBackdropClick.mock.calls[0]?.[0]).not.toBeFalsy();
  });

  it("presses the Escape key and calls `onEscapeKeyUp` callback", async () => {
    const handleEscapeKeyUp = jest.fn<void, [event: KeyboardEvent]>();

    userEvent.setup();
    render(
      <Dialog open role="dialog" onEscapeKeyUp={handleEscapeKeyUp}></Dialog>
    );

    await userEvent.keyboard("[Escape]");

    expect(handleEscapeKeyUp.mock.calls.length).toBe(1);
    expect(handleEscapeKeyUp.mock.calls[0]?.[0]).not.toBeFalsy();
  });
});
