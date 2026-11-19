# Seed & Source

**How startups are planted, and what they're built from.** A free weekly newsletter:
one company per issue, from the first idea down to the stack.

The newsletter is researched and written by a team of Claude agents that runs **on your
computer when you type one command**. Nothing runs on a schedule, and nothing reaches
subscribers until you approve it.

```bash
npm run issue                         # agents research + write next Tuesday's issue, email you a test
# read the test email, fix anything, set approved: true in the issue file
npm run send -- 2026-11-24-supabase   # you send it to everyone (asks you to type the slug)
npm run build && git push             # publishes the web archive
```

## How it works

```
npm run issue  ──► Claude Code (headless, on your machine) reads CLAUDE.md
                    ├─ scout         picks the company (+2 backups)
                    ├─ researcher    15+ facts, each with a source link
                    ├─ analyst       business side + under the hood    ┐ in parallel
                    ├─ radar         AI Radar + Quick Hits (last 7 days) ┘
                    ├─ writer        writes issues/<slug>.md (approved: false)
                    └─ fact-checker  opens every link, fixes or removes claims
                  ──► npm run preview  → test email to you only

you            ──► read it, edit if needed, set approved: true
npm run send   ──► refuses unless approved, finished and not sent before,
                    then asks you to type the slug → Resend broadcast to all subscribers

website (Cloudflare Pages, free)
  /                landing page with signup
  /api/subscribe   emails a confirmation link (double opt-in)
  /api/confirm     adds the person to your Resend subscriber segment
  /issues/         archive of every SENT issue (drafts never go public)
```

The agents are in `.claude/agents/`, and their rules are in `CLAUDE.md`. They are blocked
from running `npm run send`, reading `.env`, or editing `sent.json` (`.claude/settings.json`).

## One-time setup (about 1–2 hours)

### 1. Tools on your computer

- **Node.js 20+:** https://nodejs.org
- **Claude Code** (uses your Claude Pro/Max subscription):
  - macOS / Linux / WSL: `curl -fsSL https://claude.ai/install.sh | bash`
  - Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`
  - Then run `claude` once and log in in the browser.
- Clone this repo and install:

```bash
git clone https://github.com/Maherimtiyaz/seed-and-source.git
cd seed-and-source
npm install
```

- **Trust the folder once:** run `claude` inside `seed-and-source`, accept the trust prompt,
  then type `/exit`. Headless runs need this so the project's agents and safety settings load.
- If `ANTHROPIC_API_KEY` is set in your shell, unset it, or runs are billed to the API instead
  of your subscription. `npm run issue` warns you.

### 2. Domain

Buy `seedandsource.com` (or your choice) at any registrar. You'll point it at Cloudflare in step 4.

### 3. Resend (email)

1. In **Domains**, add your domain and add the DNS records Resend shows. Wait until it says *Verified*.
2. In **Audience → Segments**, create a segment called `Subscribers`. Copy its ID.
3. In **API Keys**, create a key with **Full access**.
4. Copy `.env.example` to `.env` and fill in `RESEND_API_KEY`, `RESEND_SEGMENT_ID`,
   `FROM_EMAIL` (on your verified domain), `REPLY_TO`, `EDITOR_EMAIL`, `SITE_URL`
   and `MAILING_ADDRESS` (US anti-spam law requires one; a PO box or virtual address works).

Free plan: up to 1,000 subscribers for newsletters. Check https://resend.com/pricing.

### 4. Cloudflare Pages (website + signup)

1. Create a free account: **https://dash.cloudflare.com/sign-up**
2. **Workers & Pages → Create → Pages → Connect to Git**, pick `seed-and-source`.
3. Build settings: build command `npm run build`, output directory `dist`.
4. **Settings → Variables and Secrets** (Production): add `RESEND_API_KEY`,
   `RESEND_SEGMENT_ID`, `FROM_EMAIL`, `SITE_URL`, and `CONFIRM_SECRET`
   (any long random string, e.g. from `openssl rand -hex 32`).
5. **Custom domains:** add your domain and follow the DNS steps.
6. Test it: subscribe with your own email, click the confirmation link, and check that
   you appear in the Resend segment.

Every `git push` redeploys the site.

## Every week

1. `npm run issue` (optionally `-- --company "PostHog"`). It takes 15–40 minutes and shows progress.
2. Read the test email and `issues/<slug>.md`. Check `research/<slug>/factcheck.md` for anything removed or uncertain.
3. Edit anything you want. Add tools you really tried to `tools-tried.md` before the run if you want a Tools section.
4. Set `approved: true` in the issue's front matter.
5. `npm run send -- <slug>` and type the slug to confirm.
6. `npm run build`, then commit and push (publishes the archive).
7. Post the X thread and LinkedIn post from `research/<slug>/social.md`.

## Issue 01 is waiting for you

`issues/2026-11-24-supabase.md` has The Story, The Business Side, Under the Hood and the
lessons written and sourced. Fill in **AI Radar**, **Tools** (only tools you tried) and
**Quick Hits**, or delete those headings. `npm run send` refuses until it's finished and approved.

## Commands

| Command | What it does |
|---|---|
| `npm run issue` | Runs the agent team for next Tuesday's issue |
| `npm run preview -- <slug>` | Writes `previews/<slug>.html` and emails a test to `EDITOR_EMAIL` (`--no-email` to skip) |
| `npm run send -- <slug>` | Sends to all subscribers (approved + finished + typed confirmation) |
| `npm run build` | Builds `dist/` for Cloudflare Pages |
| `npm test` / `npm run typecheck` | Tests and type checks |

## Files

| Path | What it is |
|---|---|
| `CLAUDE.md` | Newsroom handbook: voice, format, sourcing rules, the pipeline |
| `.claude/agents/` | The six agents |
| `.claude/settings.json` | What agents may never do |
| `issues/` | One markdown file per issue; `_template.md` is the format |
| `research/<slug>/` | The agents' working notes, fact tables and fact-check reports |
| `ideas.md` | Backlog of companies; reader suggestions go first |
| `tools-tried.md` | Tools you actually used (the only ones the writer may feature) |
| `sent.json` | Issues already sent; prevents double sends |
| `site/` | Landing page, confirmation page, archive styles |
| `functions/api/` | Signup and confirmation endpoints (Cloudflare Pages Functions) |
| `scripts/` | The commands above |
