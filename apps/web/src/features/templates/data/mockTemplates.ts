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
    qualityRating: "HIGH",
    createdAt: "2026-05-01T09:30:00.000Z",
    updatedAt: "2026-05-02T10:15:00.000Z"
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
    updatedAt: "2026-05-08T11:00:00.000Z"
  },
  {
    id: "tmpl_new_collection_offer_v1",
    name: "new_collection_offer_v1",
    displayName: "New collection offer",
    category: "MARKETING",
    type: "TEXT",
    languageCode: "en",
    status: "REJECTED",
    qualityRating: "LOW",
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
  }
];
