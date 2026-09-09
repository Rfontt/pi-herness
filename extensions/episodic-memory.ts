import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, readdir, readFile, writeFile, rename, stat } from "node:fs/promises";

// Cross-project, transient, TTL'd lessons.
// NOTE: automatic deletion of expired episodes is done by a Hermes cron job
// (no_agent) running purge_pi_episodes.py daily. This extension only injects a
// filtered index (expired episodes are never shown to the agent) and exposes
// the `episode` tool.

function baseDir(): string {
  return process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
}
const EPISODES_DIR = join(baseDir(), "episodes");
const ARCHIVE_DIR = join(EPISODES_DIR, ".archive");

function parseFrontmatter(text: string): { data: Record<string, string>; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { data, body: m[2] };
}

function serialize(data: Record<string, string>, body: string): string {
  const fm = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
  return `---\n${fm}\n---\n\n${body.trim()}\n`;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "episode";
}

function firstLine(s: string): string {
  return s.trim().split("\n")[0].slice(0, 120);
}

function today(): string { return new Date().toISOString().slice(0, 10); }

type Ep = { slug: string; data: Record<string, string>; body: string };

async function listEpisodes(): Promise<Ep[]> {
  await mkdir(EPISODES_DIR, { recursive: true });
  const files = await readdir(EPISODES_DIR);
  const eps: Ep[] = [];
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const text = await readFile(join(EPISODES_DIR, f), "utf8");
    const { data, body } = parseFrontmatter(text);
    eps.push({ slug: f.slice(0, -3), data, body });
  }
  return eps;
}

function isExpired(ep: Ep): boolean {
  if (ep.data.permanent === "true") return false;
  if (!ep.data.expires_at) return false;
  return new Date(ep.data.expires_at + "T23:59:59Z") < new Date();
}

function indexBlock(eps: Ep[]): string {
  if (!eps.length) return "";
  const lines = eps
    .sort((a, b) => (a.data.expires_at ?? "9999").localeCompare(b.data.expires_at ?? "9999"))
    .map((e) => {
      const sig = e.data.signature ? ` [sig: ${e.data.signature}]` : "";
      const ttl = e.data.permanent === "true" ? "permanent" : `expires ${e.data.expires_at ?? "?"}`;
      return `- ${e.slug}${sig} (${ttl}) — ${firstLine(e.body)}`;
    });
  return `\n\n<episodic-memory>\n${lines.join("\n")}\n</episodic-memory>`;
}

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => {
    const active = (await listEpisodes()).filter((e) => !isExpired(e));
    const block = indexBlock(active);
    if (!block) return;
    return { systemPrompt: (event.systemPrompt ?? "") + block };
  });

  pi.registerTool({
    name: "episode",
    label: "Episodic memory",
    description:
      "Store and recall transient, cross-project lessons that auto-expire (unless permanent=true). " +
      "Use for time-boxed knowledge: a version bump that will be resolved everywhere, an intermittent " +
      "error, a temporary migration quirk. NOT for durable facts (use remember) or per-project facts (.ai/).",
    promptGuidelines: [
      "Capture a transient lesson with action=add: content = the reusable fix/logic, signature = a tag grouping related episodes (e.g. 'bump:lib-v2'), expires_at = when it should stop being consulted.",
      "Set permanent=true ONLY when a lesson turns out durable. Otherwise always give expires_at so it auto-cleans.",
      "Before re-solving a problem, check for an existing episode with action=search (signature or keyword) and reuse the logic.",
      "Do not store secrets, credentials, PR numbers, or task progress here.",
    ],
    parameters: Type.Object({
      action: Type.Union([
        Type.Literal("add"), Type.Literal("list"), Type.Literal("read"),
        Type.Literal("search"), Type.Literal("renew"), Type.Literal("remove"),
      ]),
      name: Type.Optional(Type.String({ description: "Episode slug (for read/renew/remove)." })),
      content: Type.Optional(Type.String({ description: "Lesson body (required for add)." })),
      signature: Type.Optional(Type.String({ description: "Tag grouping related episodes, e.g. 'bump:lib-v2' (add)." })),
      expires_at: Type.Optional(Type.String({ description: "YYYY-MM-DD when this stops being useful (add/renew)." })),
      permanent: Type.Optional(Type.Boolean({ description: "True to keep forever (add)." })),
    }),
    async execute(_id, params, _signal, _onUpdate, _ctx) {
      const action = params.action as string;
      const name = (params.name ?? "").trim();
      const content = (params.content ?? "").trim();
      const signature = (params.signature ?? "").trim();
      const expiresAt = (params.expires_at ?? "").trim();
      const permanent = params.permanent === true;
      const out = (text: string) => ({ content: [{ type: "text", text }], details: {} });

      if (action === "add") {
        if (!content) return out("episode add requires 'content'.");
        if (!permanent && !expiresAt) return out("episode add requires 'expires_at' (or permanent=true). Episodes must not live forever by default.");
        const slug = slugify(name || content);
        const existing = await listEpisodes();
        if (existing.some((e) => e.slug === slug)) return out(`episode '${slug}' already exists — use action=renew or a different name.`);
        const data: Record<string, string> = { created: today() };
        if (signature) data.signature = signature;
        if (permanent) data.permanent = "true";
        else data.expires_at = expiresAt;
        await mkdir(EPISODES_DIR, { recursive: true });
        await writeFile(join(EPISODES_DIR, slug + ".md"), serialize(data, content), "utf8");
        return out(`episode '${slug}' saved (${permanent ? "permanent" : `expires ${expiresAt}`}).`);
      }

      if (action === "list") {
        const eps = await listEpisodes();
        if (!eps.length) return out("no episodes.");
        return out(eps.map((e) => {
          const ttl = e.data.permanent === "true" ? "permanent" : `expires ${e.data.expires_at ?? "?"}`;
          const sig = e.data.signature ? ` (sig: ${e.data.signature})` : "";
          return `- ${e.slug}${sig} [${ttl}] — ${firstLine(e.body)}`;
        }).join("\n"));
      }

      if (action === "read") {
        if (!name) return out("episode read requires 'name'.");
        const ep = (await listEpisodes()).find((e) => e.slug === name);
        if (!ep) return out(`episode '${name}' not found.`);
        return out(serialize(ep.data, ep.body));
      }

      if (action === "search") {
        const q = (name || signature).toLowerCase();
        if (!q) return out("episode search requires 'name' or 'signature'.");
        const terms = q.split(/\s+/);
        const eps = (await listEpisodes()).filter((e) => !isExpired(e)).filter((e) => {
          const hay = `${e.slug} ${e.data.signature ?? ""} ${e.body}`.toLowerCase();
          return terms.every((t) => hay.includes(t));
        });
        if (!eps.length) return out(`no episode matching '${q}'.`);
        return out(eps.map((e) => `- ${e.slug} — ${firstLine(e.body)}`).join("\n"));
      }

      if (action === "renew") {
        if (!name) return out("episode renew requires 'name'.");
        const ep = (await listEpisodes()).find((e) => e.slug === name);
        if (!ep) return out(`episode '${name}' not found.`);
        if (!expiresAt) return out("episode renew requires 'expires_at'.");
        ep.data.expires_at = expiresAt;
        delete ep.data.permanent;
        await writeFile(join(EPISODES_DIR, name + ".md"), serialize(ep.data, ep.body), "utf8");
        return out(`episode '${name}' renewed until ${expiresAt}.`);
      }

      if (action === "remove") {
        if (!name) return out("episode remove requires 'name'.");
        const src = join(EPISODES_DIR, name + ".md");
        try {
          await stat(src);
        } catch {
          return out(`episode '${name}' not found.`);
        }
        await mkdir(ARCHIVE_DIR, { recursive: true });
        await rename(src, join(ARCHIVE_DIR, name + ".md"));
        return out(`episode '${name}' removed.`);
      }

      return out("Unknown action — use add | list | read | search | renew | remove.");
    },
  });
}
