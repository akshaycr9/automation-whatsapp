import { http, HttpResponse } from "msw";

export const handlers = [http.get("http://localhost:4000/health", () => HttpResponse.json({ data: { status: "ok" } }))];
