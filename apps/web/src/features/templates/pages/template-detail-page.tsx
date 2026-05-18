import { SectionErrorBoundary } from "@/components/error-boundaries";
import { Card } from "@/components/ui/card";

export function TemplateDetailPage() {
  return (
    <section aria-labelledby="template-detail-title" className="space-y-4">
      <SectionErrorBoundary name="Template Detail Placeholder">
        <Card>
          <h1 id="template-detail-title" className="text-xl font-semibold text-text">
            Template detail feature coming soon
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Detail, review status, and future edit/sync workflows will be implemented after the list and create flows.
          </p>
        </Card>
      </SectionErrorBoundary>
    </section>
  );
}
