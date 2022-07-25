import { Breadcrumb, BreadcrumbItem } from "../../lib";
import classes from "./Breadcrumb.module.css";

const MyBreadcrumb = () => {
  return (
    <Breadcrumb
      classes={{
        root: classes.root,
        item: classes.item,
        label: classes.label,
        list: classes.list
      }}
      label={{ screenReaderLabel: "Breadcrumb" }}
    >
      <BreadcrumbItem>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.w3.org/WAI/ARIA/apg/"
        >
          WAI-ARIA Authoring Practices
        </a>
      </BreadcrumbItem>
      <BreadcrumbItem role="presentation">{"➡"}</BreadcrumbItem>
      <BreadcrumbItem>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.w3.org/WAI/ARIA/apg/patterns/"
        >
          Design Patterns
        </a>
      </BreadcrumbItem>
      <BreadcrumbItem role="presentation">{"➡"}</BreadcrumbItem>
      <BreadcrumbItem>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/"
        >
          Breadcrumb Pattern
        </a>
      </BreadcrumbItem>
      <BreadcrumbItem role="presentation">{"➡"}</BreadcrumbItem>
      <BreadcrumbItem>
        <a href="" aria-current="page">
          Breadcrumb Example
        </a>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};

export default MyBreadcrumb;
