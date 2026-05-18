import { SectionErrorBoundary } from "@/components/error-boundaries";
import { Card } from "@/components/ui/card";

export function CreateTemplatePage() {
  return (
    <section aria-labelledby="create-template-title" className="space-y-4">
      <SectionErrorBoundary name="Create Template Placeholder">
        <Card>
          <h1 id="create-template-title" className="text-xl font-semibold text-text">
            Create template feature coming soon
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            The form foundation is scaffolded for text templates first, with room for media, carousel, and
            authentication templates later.
          </p>
        </Card>
      </SectionErrorBoundary>
    </section>
  );
}
