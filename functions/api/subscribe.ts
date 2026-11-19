/**
 * POST /api/subscribe  { email }
 * Step 1 of double opt-in: emails a signed confirmation link. Nobody is added
 * to the list until they click it, so a stranger can't subscribe someone else.
 * Always answers 200 for well-formed requests, so it never reveals who is subscribed.
 */

import { sendEmail } from "../../scripts/lib/resend.ts";
import type { PagesContext } from "../_lib/env.ts";
import { createToken, EMAIL_RE } from "../_lib/token.ts";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  let body: { email?: unknown; company_website?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json(400, { error: "Send JSON with an email field." });
  }

  // Honeypot: real people never fill this hidden field; bots often do.
  if (typeof body.company_website === "string" && body.company_website.length > 0) return json(200, { ok: true });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) return json(400, { error: "Enter a valid email address." });

  const token = await createToken(email, env.CONFIRM_SECRET);
  const link = `${env.SITE_URL.replace(/\/$/, "")}/api/confirm?t=${encodeURIComponent(token)}`;

  await sendEmail(env.RESEND_API_KEY, {
    from: env.FROM_EMAIL,
    to: email,
    subject: "Confirm your Seed & Source subscription",
    text: `Click to confirm your subscription to Seed & Source:\n\n${link}\n\nThe link works for 48 hours. If you didn't ask for this, ignore this email and nothing happens.`,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#18221b">
<p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#56625a">Seed &amp; Source</p>
<h1 style="font-family:Georgia,serif;font-size:24px;margin:8px 0 16px">One click to confirm</h1>
<p style="font-size:16px;line-height:1.6">You asked to get Seed &amp; Source, a weekly newsletter about how startups are built.</p>
<p style="margin:24px 0"><a href="${link}" style="background:#18221b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Confirm my subscription</a></p>
<p style="font-size:13px;color:#56625a">The link works for 48 hours. If you didn't ask for this, ignore this email and nothing happens.</p></div>`,
  });

  return json(200, { ok: true });
}
