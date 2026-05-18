import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:4000/health", () => HttpResponse.json({ data: { status: "ok" } })),
  http.post("http://localhost:4000/api/auth/refresh", () =>
    HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "Refresh token is required." } }, { status: 401 })
  )
];
