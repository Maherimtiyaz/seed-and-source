/**
 * GET /api/confirm?t=<token>
 * Step 2 of double opt-in: verifies the signed link, adds the person to the
 * subscriber segment in Resend, and sends them to the confirmation page.
 */

import { subscribeContact } from "../../scripts/lib/resend.ts";
import type { PagesContext } from "../_lib/env.ts";
import { verifyToken } from "../_lib/token.ts";

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  const url = new URL(request.url);
  const site = env.SITE_URL.replace(/\/$/, "");
  const email = await verifyToken(url.searchParams.get("t") ?? "", env.CONFIRM_SECRET);
  if (!email) return Response.redirect(`${site}/confirmed.html?status=expired`, 303);

  try {
    await subscribeContact(env.RESEND_API_KEY, email, env.RESEND_SEGMENT_ID);
  } catch (error) {
    console.error("confirm: could not add contact", error instanceof Error ? error.message : error);
    return Response.redirect(`${site}/confirmed.html?status=error`, 303);
  }
  return Response.redirect(`${site}/confirmed.html`, 303);
}
