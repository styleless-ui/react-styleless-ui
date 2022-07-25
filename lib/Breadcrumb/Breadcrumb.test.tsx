import {
  itShouldMount,
  itSupportsDataSetProps,
  itSupportsRef,
  itSupportsStyle,
  render,
  screen
} from "../../tests/utils";
import Breadcrumb, { type BreadcrumbProps } from "./Breadcrumb";
import BreadcrumbItem from "./Item";

const labelText = "Breadcrumb";

const REQUIRED_PROPS: BreadcrumbProps = {
  label: labelText,
  classes: {
    label: "label",
    root: "root",
    item: "item",
    list: "list"
  }
};

describe("@styleless-ui/react/Breadcrumb", () => {
  afterEach(jest.clearAllMocks);

  itShouldMount(Breadcrumb, REQUIRED_PROPS);
  itSupportsStyle(Breadcrumb, REQUIRED_PROPS, "nav");
  itSupportsRef(Breadcrumb, REQUIRED_PROPS, HTMLElement);
  itSupportsDataSetProps(Breadcrumb, REQUIRED_PROPS, "nav");

  it("should have the required classNames", () => {
    render(
      <Breadcrumb {...REQUIRED_PROPS}>
        <BreadcrumbItem></BreadcrumbItem>
      </Breadcrumb>
    );

    const nav = screen.getByRole("navigation");
    const label = nav.previousElementSibling;
    const list = nav.firstElementChild;
    const item = list?.firstElementChild;

    expect(nav).toHaveClass("root");
    expect(label).toHaveClass("label");
    expect(list).toHaveClass("list");
    expect(item).toHaveClass("item");
  });

  it("should have `aria-label='label'` property when `label={{ screenReaderLabel: 'label' }}`", () => {
    render(
      <Breadcrumb
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
      <Breadcrumb {...REQUIRED_PROPS} label={{ labelledBy: "identifier" }} />
    );

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-labelledby",
      "identifier"
    );
  });
});
