-- RenameIndex
DO $$
BEGIN
  IF to_regclass('"WhatsAppTemplateComponent_templateId_componentType_sortOrder_ke"') IS NOT NULL THEN
    ALTER INDEX "WhatsAppTemplateComponent_templateId_componentType_sortOrder_ke" RENAME TO "WhatsAppTemplateComponent_templateId_componentType_sortOrde_key";
  END IF;
END $$;
