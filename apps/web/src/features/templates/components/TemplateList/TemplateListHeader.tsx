import { Button } from "@/components/ui/button";

type TemplateListHeaderProps = {
  totalCount: number;
  filteredCount: number;
  onCreateTemplate: () => void;
};

export function TemplateListHeader({ totalCount, filteredCount, onCreateTemplate }: TemplateListHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 id="templates-list-title" className="text-2xl font-semibold tracking-tight text-text">
          Templates
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage WhatsApp message templates for automations. Showing {filteredCount} of {totalCount}.
        </p>
      </div>
      <Button type="button" onClick={onCreateTemplate}>
        Create Template
      </Button>
    </div>
  );
}
