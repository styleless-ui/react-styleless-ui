import * as React from "react";
import { type BreadcrumbProps } from "./Breadcrumb";

export interface IBreadcrumbContext {
  classes: BreadcrumbProps["classes"];
}

const BreadcrumbContext = React.createContext<IBreadcrumbContext | undefined>(
  undefined
);

if (process.env.NODE_ENV !== "production") {
  BreadcrumbContext.displayName = "BreadcrumbContext";
}

export default BreadcrumbContext;
