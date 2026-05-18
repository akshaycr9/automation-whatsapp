type TemplateRowActionsProps = {
  templateId: string;
  onDuplicateTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
};

export function TemplateRowActions({ templateId, onDuplicateTemplate, onDeleteTemplate }: TemplateRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <button
        aria-label="Duplicate template"
        className="grid size-8 place-items-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text"
        type="button"
        title="Duplicate"
        onClick={(event) => {
          event.stopPropagation();
          onDuplicateTemplate(templateId);
        }}
      >
        <DuplicateIcon />
      </button>
      <button
        aria-label="Delete template"
        className="grid size-8 place-items-center rounded-md text-error transition hover:bg-error-soft"
        type="button"
        title="Delete"
        onClick={(event) => {
          event.stopPropagation();
          onDeleteTemplate(templateId);
        }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function DuplicateIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15H4a2 2 0 0 1-2-2V5a3 3 0 0 1 3-3h8a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M3 6h18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path
        d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
