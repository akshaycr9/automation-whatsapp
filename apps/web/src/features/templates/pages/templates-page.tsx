import { SectionErrorBoundary } from "@/components/error-boundaries";
import { Card } from "@/components/ui/card";

export function TemplatesListPage() {
  return (
    <section aria-labelledby="templates-list-title" className="space-y-4">
      <SectionErrorBoundary name="Templates List Placeholder">
        <Card>
          <h1 id="templates-list-title" className="text-xl font-semibold text-text">
            Templates list feature coming soon
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Phase 2 has prepared the feature foundation. The production list UI will be implemented in a later phase.
          </p>
        </Card>
      </SectionErrorBoundary>
    </section>
  );
}

export const TemplatesPage = TemplatesListPage;
