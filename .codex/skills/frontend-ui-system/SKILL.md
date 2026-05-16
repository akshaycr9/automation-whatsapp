# Frontend UI System

## Purpose

Guide frontend work for the QW Automations React PWA.

## When to Use

Use for screens, components, forms, responsive UI, and frontend tests.

## Stack

React, Vite, TypeScript, Tailwind CSS v4, TanStack Query, React Hook Form, Zod, React Router, Socket.IO Client later, Vitest, React Testing Library.

## Feature Structure

Use `api`, `hooks`, `schemas`, `components`, `pages`, and `__tests__` inside each feature.

## Patterns

Pages stay thin. Containers and hooks handle fetching, mutations, derived state, effects, permissions, and sockets. Presentational components render from props.

## State

TanStack Query is server state only. Use local state/reducer for UI state. Use Context only for app-wide auth/session/theme/notification/shell concerns.

## Forms

All forms use React Hook Form + Zod. Test validation through user behavior.

## Tailwind

Use Tailwind CSS v4 imports and mobile-first utilities. Keep layouts touch-friendly and accessible.

## Mobile and Accessibility

Tables become cards on mobile. Conversations use desktop split view and mobile list/thread navigation. Use semantic markup and accessible names.

## Testing

Use Vitest and React Testing Library. Prefer roles, labels, text, placeholders, and accessible names.

## Do

Build small testable components, loading/empty/error states, and reusable UI.

## Do Not

Do not add Redux, Zustand, MobX, Recoil, Jotai, feature business logic in pages, or real integration calls in UI components.
