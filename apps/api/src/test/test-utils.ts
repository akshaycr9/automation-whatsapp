import request from "supertest";
import { createApp } from "../app.js";

export function createTestRequest() {
  return request(createApp());
}
