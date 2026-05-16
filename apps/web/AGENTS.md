# Frontend Agent Guide

Use React + Vite + TypeScript with Tailwind CSS v4.

- TanStack Query is for server state only.
- Use React Hook Form + Zod for all forms.
- Keep pages thin. Move orchestration, effects, data fetching, mutations, and socket subscriptions into hooks, containers, or services.
- Use presentational components for rendering-only concerns.
- Do not add Redux, Zustand, MobX, Recoil, Jotai, or similar global state libraries.
- Build small, testable components.
- Use React Testing Library + Vitest.
- Design mobile-first with accessible labels and semantic markup.
- Tables must become cards on mobile.
- Conversations require desktop split layout and mobile list/thread navigation.
- Include loading, empty, and error states when implementing real screens.
