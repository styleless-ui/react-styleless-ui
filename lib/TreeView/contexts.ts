import * as React from "react";

export type LevelContextValue = number;
export type SizeContextValue = number;

export type TreeViewContextValue = {
  activeElement: HTMLElement | null;
  isSelectable: boolean;
  isMultiSelect: boolean;
  setActiveElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  isDescendantSelected: (descendant: string) => boolean;
  isDescendantExpanded: (descendant: string) => boolean;
  handleDescendantSelect: (descendant: string) => void;
  handleDescendantCollapse: (descendant: string) => void;
  handleDescendantExpand: (descendant: string) => void;
  handleDescendantExpandToggle: (descendant: string) => void;
};

export const LevelContext = React.createContext<LevelContextValue | null>(null);

export const SizeContext = React.createContext<SizeContextValue | null>(null);

export const TreeViewContext = React.createContext<TreeViewContextValue | null>(
  null,
);

if (process.env.NODE_ENV !== "production") {
  LevelContext.displayName = "TreeView.LevelContext";
  SizeContext.displayName = "TreeView.SizeContext";
  TreeViewContext.displayName = "TreeView.Context";
}
