import * as Breadcrumb from ".";
import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen
} from "../../tests/utils";

const labelText = "Breadcrumb";

const REQUIRED_PROPS: Breadcrumb.RootProps = {
  label: labelText,
  classes: {
    label: "label",
    root: "root",
    list: "list"
  }
};

describe("Breadcrumb", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Breadcrumb.Root, REQUIRED_PROPS);
  itSupportsStyle(Breadcrumb.Root, REQUIRED_PROPS, "nav");
  itSupportsRef(Breadcrumb.Root, REQUIRED_PROPS, HTMLElement);
  itSupportsDataSetProps(Breadcrumb.Root, REQUIRED_PROPS, "nav");

  it("should have the required classNames", () => {
    render(
      <Breadcrumb.Root {...REQUIRED_PROPS}>
        <Breadcrumb.Item className="item"></Breadcrumb.Item>
        <Breadcrumb.Separator className="separator" />
      </Breadcrumb.Root>
    );

    const nav = screen.getByRole("navigation");
    const label = nav.previousElementSibling;
    const list = nav.firstElementChild;
    const item = list?.firstElementChild;
    const separator = list?.lastElementChild;

    expect(nav).toHaveClass("root");
    expect(label).toHaveClass("label");
    expect(list).toHaveClass("list");
    expect(item).toHaveClass("item");
    expect(separator).toHaveClass("separator");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <Breadcrumb.Root
        {...REQUIRED_PROPS}
        label={{ screenReaderLabel: labelText }}
      />
    );

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      labelText
    );
  });

  it("should have `aria-labelledby='identifier'` property when `label={{ labelledBy: 'identifier' }}`", () => {
    render(
      <Breadcrumb.Root
        {...REQUIRED_PROPS}
        label={{ labelledBy: "identifier" }}
      />
    );

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-labelledby",
      "identifier"
    );
  });
});
