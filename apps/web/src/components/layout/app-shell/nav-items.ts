import { NavItem, SecondaryRouteMeta } from "./types";

export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    href: "/dashboard",
    icon: "dashboard",
    title: "Dashboard",
    subtitle: "Today"
  },
  {
    id: "templates",
    label: "Templates",
    href: "/templates",
    icon: "template",
    title: "Templates",
    subtitle: "Template library"
  },
  {
    id: "automations",
    label: "Automations",
    shortLabel: "Auto",
    href: "/automations",
    icon: "bolt",
    title: "Automations",
    subtitle: "Predefined flows"
  },
  {
    id: "conversations",
    label: "Conversations",
    shortLabel: "Chats",
    href: "/conversations",
    icon: "chat",
    title: "Conversations",
    subtitle: "Customer inbox"
  },
  { id: "logs", label: "Logs", href: "/logs", icon: "logs", title: "Logs", subtitle: "Last 24 hours" },
  { id: "settings", label: "Settings", shortLabel: "More", href: "/settings", icon: "settings", title: "Settings" }
];

export const mobileNavItems = navItems.filter((item) => item.id !== "logs");

export const secondaryRouteMeta: Record<string, SecondaryRouteMeta> = {
  "/templates/create": {
    title: "Create Template",
    subtitle: "Submit to Meta for approval",
    backTo: "/templates"
  },
  "/templates/new": {
    title: "Create Template",
    subtitle: "Submit to Meta for approval",
    backTo: "/templates"
  },
  "/automations/configure": {
    title: "Configure automation",
    subtitle: "Review trigger, message, and guardrails",
    backTo: "/automations"
  },
  "/automations/:id": {
    title: "Configure automation",
    subtitle: "Review trigger, message, and guardrails",
    backTo: "/automations"
  }
};
