import * as Breadcrumb from ".";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen,
} from "../../tests/utils";

const labelText = "Breadcrumb";

const mockRequiredProps: Breadcrumb.RootProps = {
  label: { screenReaderLabel: labelText },
};

describe("Breadcrumb", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Breadcrumb.Root, mockRequiredProps);
  itSupportsStyle(Breadcrumb.Root, mockRequiredProps, "nav");
  itSupportsRef(Breadcrumb.Root, mockRequiredProps, HTMLElement);
  itSupportsDataSetProps(Breadcrumb.Root, mockRequiredProps, "nav");

  it("should have the required classNames", () => {
    render(
      <Breadcrumb.Root
        {...mockRequiredProps}
        className="root"
      >
        <Breadcrumb.List
          data-testid="list"
          className="list"
        >
          <Breadcrumb.Item
            data-testid="item"
            className="item"
          ></Breadcrumb.Item>
          <Breadcrumb.SeparatorItem
            data-testid="separator"
            className="separator"
            separatorSymbol={"/"}
          />
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );

    const nav = screen.getByRole("navigation");
    const list = screen.getByTestId("list");
    const item = screen.getByTestId("item");
    const separator = screen.getByTestId("separator");

    expect(nav).toHaveClass("root");
    expect(list).toHaveClass("list");
    expect(item).toHaveClass("item");
    expect(separator).toHaveClass("separator");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(<Breadcrumb.Root {...mockRequiredProps} />);

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      labelText,
    );
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <Breadcrumb.Root
        {...mockRequiredProps}
        label={{ labelledBy: "identifier" }}
      />,
    );

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-labelledby",
      "identifier",
    );
  });
});
