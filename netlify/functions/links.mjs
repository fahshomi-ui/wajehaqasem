import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

// One link shared by both buttons on the home page.

// Default admin password, stored as a SHA-256 hash (current password: chosen by the site owner).
// To use a different password without editing code, set ADMIN_PASSWORD in Netlify
// (Project configuration → Environment variables) — it takes priority over this default.
const DEFAULT_PASSWORD_SHA256 = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";

const sha256 = (value) => createHash("sha256").update(String(value), "utf8").digest("hex");

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const isValidUrl = (value) => {
  if (value === "") return true; // empty = buttons do nothing
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

// Constant-time string comparison to avoid leaking the password via timing.
const safeEqual = (a, b) => {
  const enc = new TextEncoder();
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
};

const getAdminPassword = () =>
  (globalThis.Netlify?.env?.get?.("ADMIN_PASSWORD") ?? process.env.ADMIN_PASSWORD ?? "").trim();

const isPasswordCorrect = (given) => {
  const fromEnv = getAdminPassword();
  if (fromEnv) return safeEqual(given, fromEnv);
  return safeEqual(sha256(given), DEFAULT_PASSWORD_SHA256);
};

const readLink = async (store) => {
  const saved = (await store.get("settings", { type: "json" })) || {};
  return typeof saved.link === "string" ? saved.link : "";
};

export default async (req) => {
  const store = getStore({ name: "site-settings", consistency: "strong" });

  if (req.method === "GET") {
    return json({ link: await readLink(store) });
  }

  if (req.method === "POST") {
    const auth = req.headers.get("authorization") || "";
    const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!given || !isPasswordCorrect(given)) {
      await new Promise((r) => setTimeout(r, 800)); // slow down guessing
      return json({ error: "unauthorized" }, 401);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "bad_request" }, 400);
    }

    // Used by the admin login screen to verify the password.
    if (body && body.checkOnly) return json({ ok: true, link: await readLink(store) });

    const link = String(body?.link ?? "").trim();
    if (link.length > 2048 || !isValidUrl(link)) {
      return json({ error: "invalid_url" }, 400);
    }

    await store.setJSON("settings", { link, updatedAt: new Date().toISOString() });
    return json({ ok: true, link });
  }

  return json({ error: "method_not_allowed" }, 405);
};

export const config = { path: "/api/links" };
