/**
 * Cloudflare Workers entry point. The site was deployed as a Worker with static
 * assets, and Workers don't run the Pages-only functions/ folder, so this file
 * routes the two signup endpoints to the same handlers and serves everything
 * else from dist/. (functions/ still works if the site is ever moved to Pages.)
 */

import { onRequestGet as confirm } from "../functions/api/confirm.ts";
import { onRequestPost as subscribe } from "../functions/api/subscribe.ts";
import type { Env } from "../functions/_lib/env.ts";

export type WorkerEnv = Env & { ASSETS: { fetch(request: Request): Promise<Response> } };

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/subscribe") {
      return request.method === "POST" ? subscribe({ request, env }) : new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
    }
    if (pathname === "/api/confirm") {
      return request.method === "GET" ? confirm({ request, env }) : new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
    }
    if (pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
