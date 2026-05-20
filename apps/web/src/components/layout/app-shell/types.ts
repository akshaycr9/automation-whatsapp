export type IconName =
  | "arrow-left"
  | "bell"
  | "bolt"
  | "chat"
  | "dashboard"
  | "filter"
  | "logs"
  | "plus"
  | "search"
  | "settings"
  | "sync"
  | "template";

export type NavItem = {
  id: string;
  label: string;
  shortLabel?: string;
  href: string;
  icon: IconName;
  title: string;
  subtitle?: string;
};

export type SecondaryRouteMeta = {
  title: string;
  subtitle?: string;
  backTo: string;
};
