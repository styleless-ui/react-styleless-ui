import cls from "classnames";
import * as React from "react";
import { render, screen } from "../../tests/utils";
import * as PopperSlots from "../Popper/slots";
import Tooltip from "./Tooltip";

describe("Tooltip", () => {
  afterEach(jest.clearAllMocks);

  it(`component could be updated and unmounted without errors`, () => {
    const Component = (
      <>
        <div id="anchor">Anchor</div>
        <Tooltip anchorElement="anchor">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia
          magnam ad excepturi ipsa exercitationem cum?
        </Tooltip>
      </>
    );

    const { rerender, unmount } = render(Component);

    expect(() => void (rerender(Component), unmount())).not.toThrow();
  });

  it("supports forwarding ref", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <>
        <div id="anchor">Anchor</div>
        <Tooltip
          anchorElement="anchor"
          defaultOpen={true}
          ref={ref}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia
          magnam ad excepturi ipsa exercitationem cum?
        </Tooltip>
      </>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("supports `style` prop", () => {
    const getTarget = (containerEl: HTMLElement): HTMLElement => {
      const portal = document.querySelector<HTMLElement>(
        "[data-slot='Portal:Root']",
      );

      return portal
        ? (portal.querySelector(
            `[data-slot="${PopperSlots.Root}"]`,
          ) as HTMLElement)
        : (containerEl.querySelector(
            `[data-slot="${PopperSlots.Root}"]`,
          ) as HTMLElement);
    };

    const style = { border: "1px solid red", backgroundColor: "black" };

    const { container } = render(
      <>
        <div id="anchor">Anchor</div>
        <Tooltip
          anchorElement="anchor"
          defaultOpen={true}
          style={style}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia
          magnam ad excepturi ipsa exercitationem cum?
        </Tooltip>
      </>,
    );

    expect(getTarget(container)).toHaveStyle(style);
  });

  it("supports `data-*` props", () => {
    const getTarget = (containerEl: HTMLElement): HTMLElement => {
      const portal = document.querySelector<HTMLElement>(
        "[data-slot='Portal:Root']",
      );

      return portal
        ? (portal.querySelector(
            `[data-slot="${PopperSlots.Root}"]`,
          ) as HTMLElement)
        : (containerEl.querySelector(
            `[data-slot="${PopperSlots.Root}"]`,
          ) as HTMLElement);
    };

    const { container } = render(
      <>
        <div id="anchor">Anchor</div>
        <Tooltip
          anchorElement="anchor"
          defaultOpen={true}
          data-other-attribute="test"
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia
          magnam ad excepturi ipsa exercitationem cum?
        </Tooltip>
      </>,
    );

    expect(getTarget(container)).toHaveAttribute(
      "data-other-attribute",
      "test",
    );
  });

  it("should have the required classNames", () => {
    render(
      <>
        <div id="anchor">Anchor</div>
        <Tooltip
          anchorElement="anchor"
          defaultOpen={true}
          data-other-attribute="test"
          className={({ placement, openState }) =>
            cls("root", placement, openState ? "open" : undefined)
          }
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia
          magnam ad excepturi ipsa exercitationem cum?
        </Tooltip>
      </>,
    );

    const tooltip = screen.getByRole("tooltip");

    expect(tooltip).toHaveClass("root", "open", "top");
  });

  it("should have `aria-describedby` attribute on anchor element", () => {
    render(
      <>
        <div
          id="anchor"
          data-testid="anchor"
        >
          Anchor
        </div>
        <Tooltip
          anchorElement="anchor"
          defaultOpen={true}
          data-other-attribute="test"
          className={({ placement, openState }) =>
            cls("root", placement, openState ? "open" : undefined)
          }
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia
          magnam ad excepturi ipsa exercitationem cum?
        </Tooltip>
      </>,
    );

    const tooltip = screen.getByRole("tooltip");
    const anchor = screen.getByTestId("anchor");

    expect(anchor).toHaveAttribute("aria-describedby", tooltip.id);
  });
});
