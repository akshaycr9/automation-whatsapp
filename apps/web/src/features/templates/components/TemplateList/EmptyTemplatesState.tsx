import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmptyTemplatesStateProps = {
  hasFilters: boolean;
  onCreateTemplate: () => void;
  onClearFilters: () => void;
};

export function EmptyTemplatesState({ hasFilters, onCreateTemplate, onClearFilters }: EmptyTemplatesStateProps) {
  return (
    <Card className="border-dashed p-8 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-lg bg-brand-soft text-lg font-semibold text-brand-hover">
        WA
      </div>
      <h2 className="mt-4 text-lg font-semibold text-text">
        {hasFilters ? "No templates match your filters." : "No templates created yet."}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
        {hasFilters
          ? "Adjust the search or clear filters to see more templates."
          : "Create your first WhatsApp template and submit it for review when backend integration is ready."}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        {hasFilters ? (
          <Button type="button" variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : (
          <Button type="button" onClick={onCreateTemplate}>
            Create your first template
          </Button>
        )}
      </div>
    </Card>
  );
}
