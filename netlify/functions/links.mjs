import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

// Site settings edited from /admin:
//  - link: one link shared by both buttons on the home page
//  - contact: optional phone / WhatsApp / email shown in the "تواصل معنا" section

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

// Phone-like value: digits with optional +, spaces, dashes, brackets (5–15 digits). Empty = hidden.
const isValidPhone = (value) => {
  if (value === "") return true;
  if (value.length > 25 || !/^[+\d\s\-()]+$/.test(value)) return false;
  const count = value.replace(/\D+/g, "").length;
  return count >= 5 && count <= 15;
};

const isValidEmail = (value) =>
  value === "" || (value.length <= 254 && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(value));

const EMPTY_CONTACT = { phone: "", whatsapp: "", email: "" };

const cleanContact = (raw) => {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    phone: typeof src.phone === "string" ? src.phone.trim() : "",
    whatsapp: typeof src.whatsapp === "string" ? src.whatsapp.trim() : "",
    email: typeof src.email === "string" ? src.email.trim() : "",
  };
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

const readSettings = async (store) => {
  const saved = (await store.get("settings", { type: "json" })) || {};
  return {
    link: typeof saved.link === "string" ? saved.link : "",
    contact: { ...EMPTY_CONTACT, ...cleanContact(saved.contact) },
  };
};

export default async (req) => {
  const store = getStore({ name: "site-settings", consistency: "strong" });

  if (req.method === "GET") {
    return json(await readSettings(store));
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
    if (body && body.checkOnly) return json({ ok: true, ...(await readSettings(store)) });

    const link = String(body?.link ?? "").trim();
    if (link.length > 2048 || !isValidUrl(link)) {
      return json({ error: "invalid_url" }, 400);
    }

    // If the request doesn't include contact details, keep the saved ones.
    const contact =
      body && body.contact !== undefined ? cleanContact(body.contact) : (await readSettings(store)).contact;
    if (!isValidPhone(contact.phone)) return json({ error: "invalid_phone" }, 400);
    if (!isValidPhone(contact.whatsapp)) return json({ error: "invalid_whatsapp" }, 400);
    if (!isValidEmail(contact.email)) return json({ error: "invalid_email" }, 400);

    await store.setJSON("settings", { link, contact, updatedAt: new Date().toISOString() });
    return json({ ok: true, link, contact });
  }

  return json({ error: "method_not_allowed" }, 405);
};

export const config = { path: "/api/links" };
