import { Resend } from "resend";
import { getEnv } from "@/lib/env";

let _client: Resend | null = null;

export function resend() {
  if (_client) return _client;
  _client = new Resend(getEnv().RESEND_API_KEY);
  return _client;
}
