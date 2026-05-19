import type { Template } from "../types/template.types";

export const mockTemplates: Template[] = [
  {
    id: "tmpl_order_confirmation_v1",
    name: "order_confirmation_v1",
    displayName: "Order confirmation",
    category: "UTILITY",
    type: "TEXT",
    languageCode: "en",
    status: "APPROVED",
    qualityRating: "GREEN",
    createdAt: "2026-05-01T09:30:00.000Z",
    updatedAt: "2026-05-14T10:15:00.000Z"
  },
  {
    id: "tmpl_order_shipped_v1",
    name: "order_shipped_v1",
    displayName: "Order shipped",
    category: "UTILITY",
    type: "TEXT",
    languageCode: "en",
    status: "PENDING",
    qualityRating: "UNKNOWN",
    createdAt: "2026-05-08T11:00:00.000Z",
    updatedAt: "2026-05-15T11:00:00.000Z"
  },
  {
    id: "tmpl_new_collection_offer_v1",
    name: "new_collection_offer_v1",
    displayName: "New collection offer",
    category: "MARKETING",
    type: "TEXT",
    languageCode: "en",
    status: "REJECTED",
    qualityRating: "RED",
    rejectionReason: "Promotional claim needs clearer opt-out language.",
    createdAt: "2026-05-10T08:45:00.000Z",
    updatedAt: "2026-05-10T14:20:00.000Z"
  },
  {
    id: "tmpl_cod_confirmation_v1",
    name: "cod_confirmation_v1",
    displayName: "COD confirmation",
    category: "UTILITY",
    type: "TEXT",
    languageCode: "en",
    status: "DRAFT",
    createdAt: "2026-05-12T13:10:00.000Z",
    updatedAt: "2026-05-12T13:10:00.000Z"
  },
  {
    id: "tmpl_abandoned_cart_reminder_v1",
    name: "abandoned_cart_reminder_v1",
    displayName: "Abandoned cart reminder",
    category: "MARKETING",
    type: "TEXT",
    languageCode: "en",
    status: "PAUSED",
    qualityRating: "YELLOW",
    createdAt: "2026-05-04T16:25:00.000Z",
    updatedAt: "2026-05-11T09:35:00.000Z"
  },
  {
    id: "tmpl_delivery_update_v1",
    name: "delivery_update_v1",
    displayName: "Delivery update",
    category: "UTILITY",
    type: "TEXT",
    languageCode: "en",
    status: "APPROVED",
    qualityRating: "GREEN",
    createdAt: "2026-04-28T07:20:00.000Z",
    updatedAt: "2026-05-16T12:40:00.000Z"
  }
];
