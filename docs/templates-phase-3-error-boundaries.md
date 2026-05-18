# Templates Phase 3 App-Wide Error Boundaries

## 1. Summary

Phase 3 added a reusable app-wide error boundary system for the frontend. The goal is to prevent one broken route, feature, or section from crashing the full application shell.

This phase is shared infrastructure, not Templates UI work. No backend APIs, database migrations, Meta integrations, or Templates list/create screens were implemented.

## 2. Files Created/Updated

Created:

- `apps/web/src/components/error-boundaries/AppErrorBoundary.tsx`
- `apps/web/src/components/error-boundaries/BaseErrorBoundary.tsx`
- `apps/web/src/components/error-boundaries/ErrorFallback.tsx`
- `apps/web/src/components/error-boundaries/FeatureErrorBoundary.tsx`
- `apps/web/src/components/error-boundaries/RouteErrorBoundary.tsx`
- `apps/web/src/components/error-boundaries/SectionErrorBoundary.tsx`
- `apps/web/src/components/error-boundaries/errorBoundary.types.ts`
- `apps/web/src/components/error-boundaries/errorLogger.ts`
- `apps/web/src/components/error-boundaries/index.ts`
- `apps/web/src/components/error-boundaries/__tests__/error-boundaries.test.tsx`

Updated:

- `apps/web/src/main.tsx`
- `apps/web/src/app/router.tsx`
- `apps/web/src/features/templates/pages/templates-page.tsx`
- `apps/web/src/features/templates/pages/create-template-page.tsx`
- `apps/web/src/features/templates/pages/template-detail-page.tsx`

## 3. Error Boundary Hierarchy

`AppErrorBoundary`

- Highest-level boundary.
- Protects the app from unrecoverable render failures.
- Uses a full-page fallback with a refresh action.

`RouteErrorBoundary`

- Wraps route page elements.
- Prevents one page from taking down the whole authenticated shell.
- Uses a page-sized fallback with retry and dashboard navigation.

`FeatureErrorBoundary`

- Wraps a whole feature area.
- Templates pages are wrapped with `FeatureErrorBoundary name="Templates"`.
- Future features can use the same component without Templates-specific behavior.

`SectionErrorBoundary`

- Wraps smaller complex UI sections.
- Intended for future pieces such as `TemplateTable`, `TemplateBuilder`, `TemplatePreview`, `VariableMappingPanel`, `ButtonEditor`, charts, and message lists.
- Uses a compact inline fallback.

`ErrorFallback`

- Shared fallback UI for `app`, `route`, `feature`, and `section` variants.
- Hides technical details by default in production.
- Shows technical details in development unless overridden.

## 4. Integration Points

App root:

- `AppErrorBoundary` wraps `AppProviders` and `AppRouter` in `apps/web/src/main.tsx`.

Routes:

- Authenticated routes in `apps/web/src/app/router.tsx` are wrapped with `RouteErrorBoundary`.
- Templates routes also get `FeatureErrorBoundary`.

Templates placeholders:

- `TemplatesListPage`, `CreateTemplatePage`, and `TemplateDetailPage` use `SectionErrorBoundary` around their current placeholder card sections.

## 5. Future Section Usage

Future Templates components should wrap risky sections close to where they render:

```tsx
<SectionErrorBoundary name="Template Preview">
  <TemplatePreview />
</SectionErrorBoundary>
```

Recommended future section boundaries:

- `TemplateTable`
- `TemplateBuilder`
- `TemplatePreview`
- `VariableMappingPanel`
- `ButtonEditor`
- future media upload/sample picker
- future carousel card builder

## 6. Error Logging

`errorLogger.ts` provides a centralized `logError` helper. Current behavior:

- Logs to `console.error` in development.
- Accepts boundary name, level, error, and React component stack.
- Sends nothing externally.

The helper is intentionally ready for future Sentry, LogRocket, PostHog, or similar monitoring integration without changing boundary call sites.

## 7. Production Behavior

- Technical stack traces are hidden by default in production.
- Development can show details to make local debugging easier.
- Normal users see friendly fallback messages and retry/refresh actions.

## 8. Test Summary

Added automated tests for:

- `ErrorFallback` title/description rendering.
- `SectionErrorBoundary` catching thrown child render errors.
- Boundary reset/retry behavior.

## 9. Phase 4 Readiness Checklist

- [ ] Use `SectionErrorBoundary` around the real Templates list table/cards when implemented.
- [ ] Add normal loading/empty/error query states alongside render-error boundaries.
- [ ] Keep backend/API errors in TanStack Query states, not error boundaries.
- [ ] Add feature-specific fallback copy only through props, not shared boundary hardcoding.
- [ ] Consider route `errorElement` later if loader/action routes are introduced.
- [ ] Add external monitoring only after product approval.
