export const DEFAULT_LANGUAGE = "vi";
export const FALLBACK_LANGUAGE = "vi";

export const SUPPORTED_LANGUAGES = ["vi", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const NAMESPACES = [
  "common",
  "home",
  "auth",
  "dashboard",
  "featureGate",
  "store",
  "sale",
  "product",
  "customer",
  "orders",
  "staff",
  "tasks",
  "crm",
  "timekeeping",
  "profile",
  "inventory",
  "reports",
  "subscription",
  "payment",
  "feedback",
  "admin",
  "chatbot",
] as const;

export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE: Namespace = "common";

