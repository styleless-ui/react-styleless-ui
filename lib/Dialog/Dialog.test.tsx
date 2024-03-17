import classNames from "classnames";
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

  const mockRequiredProps: Dialog.RootProps = {
    role: "dialog",
    open: true,
    onClose: () => void 0,
  };

  itShouldMount(Dialog.Root, mockRequiredProps);
  itSupportsRef(Dialog.Root, mockRequiredProps, HTMLDivElement);
  itSupportsStyle(
    Dialog.Root,
    mockRequiredProps,
    `[data-slot='${Slots.Root}']`,
    { withPortal: true },
  );
  itSupportsDataSetProps(
    Dialog.Root,
    mockRequiredProps,
    `[data-slot='${Slots.Root}']`,
    { withPortal: true },
  );

  it("should have the required classNames", () => {
    render(
      <Dialog.Root
        {...mockRequiredProps}
        data-testid="dialog-root"
        className={({ open }) => classNames("root", { "root--open": open })}
      >
        <Dialog.Backdrop
          data-testid="dialog-backdrop"
          className="backdrop"
        />
        <Dialog.Content
          className="content"
          data-testid="dialog-content"
        >
          <Dialog.Title
            className="title"
            data-testid="dialog-title"
          >
            Title
          </Dialog.Title>
          <Dialog.Description
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
    const backdrop = screen.getByTestId("dialog-backdrop");
    const content = screen.getByTestId("dialog-content");
    const title = screen.getByTestId("dialog-title");
    const description = screen.getByTestId("dialog-description");

    expect(root).toHaveClass("root", "root--open");
    expect(backdrop).toHaveClass("backdrop");
    expect(content).toHaveClass("content");
    expect(title).toHaveClass("title");
    expect(description).toHaveClass("description");
  });

  it("should have `aria-labelledby` and `aria-describedby` attributes", () => {
    render(
      <Dialog.Root
        {...mockRequiredProps}
        data-testid="dialog-root"
      >
        <Dialog.Backdrop
          data-testid="dialog-backdrop"
          className="backdrop"
        />
        <Dialog.Content data-testid="dialog-content">
          <Dialog.Title data-testid="dialog-title">Title</Dialog.Title>
          <Dialog.Description data-testid="dialog-description">
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

  it("clicks the backdrop and calls `onClose` callback", async () => {
    const handleClose = jest.fn<void, []>();

    userEvent.setup();
    render(
      <Dialog.Root
        open
        role="dialog"
        onClose={handleClose}
      >
        <Dialog.Backdrop data-testid="backdrop"></Dialog.Backdrop>
        <Dialog.Content></Dialog.Content>
      </Dialog.Root>,
    );

    const backdrop = screen.getByTestId("backdrop");

    expect(backdrop).toBeInTheDocument();

    await userEvent.click(backdrop);

    expect(handleClose.mock.calls.length).toBe(1);
  });

  it("presses the escape and calls `onClose` callback", async () => {
    const handleClose = jest.fn<void, []>();

    userEvent.setup();
    render(
      <Dialog.Root
        open
        role="dialog"
        onClose={handleClose}
      ></Dialog.Root>,
    );

    await userEvent.keyboard("[Escape]");

    expect(handleClose.mock.calls.length).toBe(1);
  });
});
