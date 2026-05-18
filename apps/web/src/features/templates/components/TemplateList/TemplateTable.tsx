import { cn } from "@/lib/utils";
import type { Template } from "../../types/template.types";
import { formatTemplateDate } from "../../utils/templateFormatters";
import { TemplateCategoryBadge } from "./TemplateCategoryBadge";
import { TemplateRowActions } from "./TemplateRowActions";
import { TemplateStatusBadge } from "./TemplateStatusBadge";
import { TemplateTypeBadge } from "./TemplateTypeBadge";

type TemplateTableProps = {
  templates: Template[];
  syncingTemplateId?: string | null;
  onViewTemplate: (templateId: string) => void;
  onSyncTemplate: (templateId: string) => void;
  onDuplicateTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
};

export function TemplateTable({
  templates,
  syncingTemplateId,
  onViewTemplate,
  onSyncTemplate,
  onDuplicateTemplate,
  onDeleteTemplate
}: TemplateTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <caption className="sr-only">WhatsApp templates</caption>
          <thead className="bg-surface-2 text-xs font-medium text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">
                Template
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Category
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Status
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Language
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Type
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Sync
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Created
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Updated
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => {
              const isSyncing = syncingTemplateId === template.id;
              const canSync = template.status !== "DRAFT";

              return (
                <tr
                  key={template.id}
                  className="cursor-pointer border-b border-border transition hover:bg-surface-2/70 focus-within:bg-surface-2/70"
                  tabIndex={0}
                  onClick={() => onViewTemplate(template.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onViewTemplate(template.id);
                    }
                  }}
                >
                  <td className="border-b border-border px-4 py-4">
                    <div className="font-medium text-text">{template.displayName}</div>
                    <div className="mt-1 font-mono text-xs text-text-muted">{template.name}</div>
                    {template.rejectionReason ? (
                      <div className="mt-2 max-w-xs text-xs text-error">{template.rejectionReason}</div>
                    ) : null}
                  </td>
                  <td className="border-b border-border px-4 py-4">
                    <TemplateCategoryBadge category={template.category} />
                  </td>
                  <td className="border-b border-border px-4 py-4">
                    <TemplateStatusBadge status={template.status} />
                  </td>
                  <td className="border-b border-border px-4 py-4 font-mono text-xs text-text-muted">
                    {template.languageCode}
                  </td>
                  <td className="border-b border-border px-4 py-4">
                    <TemplateTypeBadge type={template.type} />
                  </td>
                  <td className="border-b border-border px-4 py-4">
                    {canSync ? (
                      <button
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted transition hover:bg-surface-2 hover:text-text"
                        disabled={isSyncing}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSyncTemplate(template.id);
                        }}
                      >
                        <SyncIcon isSyncing={isSyncing} />
                        {isSyncing ? "Syncing" : "Sync"}
                      </button>
                    ) : (
                      <span className="text-xs text-text-subtle">Not available</span>
                    )}
                  </td>
                  <td className="border-b border-border px-4 py-4 text-sm text-text-muted">
                    {formatTemplateDate(template.createdAt)}
                  </td>
                  <td className="border-b border-border px-4 py-4 text-sm text-text-muted">
                    {formatTemplateDate(template.updatedAt)}
                  </td>
                  <td className="border-b border-border px-4 py-4">
                    <TemplateRowActions
                      templateId={template.id}
                      onDuplicateTemplate={onDuplicateTemplate}
                      onDeleteTemplate={onDeleteTemplate}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {templates.map((template) => {
          const isSyncing = syncingTemplateId === template.id;
          const canSync = template.status !== "DRAFT";

          return (
            <article
              key={template.id}
              className="cursor-pointer p-4 transition hover:bg-surface-2/70"
              tabIndex={0}
              onClick={() => onViewTemplate(template.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onViewTemplate(template.id);
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-text">{template.displayName}</h2>
                  <p className="mt-1 truncate font-mono text-xs text-text-muted">{template.name}</p>
                </div>
                <TemplateStatusBadge status={template.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <TemplateCategoryBadge category={template.category} />
                <TemplateTypeBadge type={template.type} />
                <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs text-text-muted">
                  {template.languageCode}
                </span>
              </div>
              {template.rejectionReason ? <p className="mt-3 text-xs text-error">{template.rejectionReason}</p> : null}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                <span>Created {formatTemplateDate(template.createdAt)}</span>
                <span aria-hidden="true" className="text-text-subtle">
                  ·
                </span>
                <span>Updated {formatTemplateDate(template.updatedAt)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                {canSync ? (
                  <button
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted transition hover:bg-surface-2 hover:text-text"
                    disabled={isSyncing}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSyncTemplate(template.id);
                    }}
                  >
                    <SyncIcon isSyncing={isSyncing} />
                    {isSyncing ? "Syncing" : "Sync"}
                  </button>
                ) : (
                  <span className="text-xs text-text-subtle">Drafts sync after submission</span>
                )}
                <TemplateRowActions
                  templateId={template.id}
                  onDuplicateTemplate={onDuplicateTemplate}
                  onDeleteTemplate={onDeleteTemplate}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SyncIcon({ isSyncing }: { isSyncing: boolean }) {
  return (
    <svg aria-hidden="true" className={cn("size-3.5", isSyncing && "animate-spin")} fill="none" viewBox="0 0 24 24">
      <path
        d="M21 12a9 9 0 0 1-15 6.7L3 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M3 12a9 9 0 0 1 15-6.7L21 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M21 3v5h-5M3 21v-5h5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
