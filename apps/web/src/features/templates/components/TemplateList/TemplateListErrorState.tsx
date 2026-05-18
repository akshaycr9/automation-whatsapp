import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type TemplateListErrorStateProps = {
  onRetry: () => void;
};

export function TemplateListErrorState({ onRetry }: TemplateListErrorStateProps) {
  return (
    <Card className="border-error/30 bg-error-soft">
      <h2 className="text-base font-semibold text-text">Unable to load templates</h2>
      <p className="mt-2 text-sm text-text-muted">The template library could not be loaded. Try again in a moment.</p>
      <Button className="mt-4" type="button" variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </Card>
  );
}
