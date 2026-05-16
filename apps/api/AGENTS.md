# Backend Agent Guide

Use Express + TypeScript.

- Keep controllers thin.
- Put business logic in services.
- Use repositories/data-access helpers when useful.
- Validate input with Zod.
- Use centralized error handling.
- JWT single-admin auth will be added later.
- Shopify and Meta webhooks must be verified later before processing.
- Raw webhook events must be stored later.
- WhatsApp sends must go through queues later, never directly inside webhook handlers.
- Never expose secrets to the frontend or logs.
- Use Vitest + Supertest for route tests.
- Unit test complex services and utilities.
- Mock Shopify, Meta WhatsApp, Redis, push notifications, and payment APIs.
- Apply SOLID pragmatically without premature abstractions.
