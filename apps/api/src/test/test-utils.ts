import request from "supertest";
import { createApp } from "../app.js";

export function createTestRequest() {
  return request(createApp());
}

export function getCookieValue(setCookieHeader: string[] | undefined, cookieName: string) {
  const cookie = setCookieHeader?.find((value) => value.startsWith(`${cookieName}=`));

  if (!cookie) return null;

  return cookie.split(";")[0]?.slice(cookieName.length + 1) ?? null;
}
