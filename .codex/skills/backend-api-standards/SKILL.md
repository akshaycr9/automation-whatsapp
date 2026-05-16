# Backend API Standards

## Purpose

Guide Express API implementation.

## When to Use

Use for routes, controllers, services, repositories, validation, auth, integrations, and backend tests.

## Stack

Node.js, Express, TypeScript, Zod, Prisma later, PostgreSQL later, BullMQ/Redis later, Socket.IO later, Vitest, Supertest.

## Boundaries

Controllers parse/validate input, call services, and return responses. Services own business logic. Repositories isolate database access. External APIs live behind adapter/client modules.

## Validation and Errors

Validate all input with Zod. Use centralized error handling. Do not leak secrets or internal stack traces.

## Auth

JWT single-admin auth comes later. Keep auth server-side and testable.

## Integrations

Shopify, Meta WhatsApp, and push notifications must be wrapped in clients. Tests must mock them.

## SOLID

Separate responsibilities and depend on abstractions where it improves testability.

## Testing

Use Supertest for API routes and Vitest for services/utilities.

## Do

Add route tests, service tests for complex logic, and explicit schemas.

## Do Not

Do not call real external APIs, couple controllers to Prisma, send WhatsApp messages in webhook handlers, or expose secrets.
