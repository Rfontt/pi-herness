import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { dirname, join, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const MAX_PROMPTS = 3;
const MAX_TOOLS = 40;
const PROMPT_TRIM = 140;
const HANDOFF_INJECT_CAP = 4000;

type SessionFacts = {
  prompts: string[];
  tools: string[];
  errors: number;
};

function projectRoot(start: string): string {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, ".ai")) || existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return resolve(start);
}

function handoffPath(cwd: string): string {
  return join(projectRoot(cwd), ".ai", "context", "handoff.md");
}

function ensureDir(p: string): void {
  mkdirSync(dirname(p), { recursive: true });
}

function readHandoff(cwd: string): string {
  const p = handoffPath(cwd);
  if (!existsSync(p)) return "";
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function hasOpenHandoff(cwd: string): boolean {
  return /^status:\s*open\s*$/m.test(readHandoff(cwd));
}

function isoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function (pi: ExtensionAPI) {
  const facts: SessionFacts = { prompts: [], tools: [], errors: 0 };

  pi.on("input", (event) => {
    if (event.source === "extension") return;
    const text = event.text.trim();
    if (!text || text.startsWith("/")) return;
    facts.prompts.push(text.length > PROMPT_TRIM ? text.slice(0, PROMPT_TRIM) + "…" : text);
    if (facts.prompts.length > MAX_PROMPTS) facts.prompts.shift();
  });

  pi.on("tool_execution_end", (event) => {
    if (!facts.tools.includes(event.toolName)) facts.tools.push(event.toolName);
    if (facts.tools.length > MAX_TOOLS) facts.tools.shift();
    if (event.isError) facts.errors += 1;
  });

  pi.on("session_before_compact", (_event, ctx) => {
    const p = join(projectRoot(ctx.cwd), ".ai", "context", "compaction-recovery.md");
    ensureDir(p);
    const body = [
      "---",
      "status: auto",
      `created: ${isoDate()}`,
      "---",
      "",
      "# Compaction recovery (auto)",
      "",
      "## Tools used this session",
      facts.tools.length ? facts.tools.map((t) => `- ${t}`).join("\n") : "(none)",
      "",
      `## Errors: ${facts.errors}`,
      "",
      "## Last prompts (topic only)",
      facts.prompts.length ? facts.prompts.map((t) => `- ${t}`).join("\n") : "(none)",
    ].join("\n");
    writeFileSync(p, body, "utf8");
  });

  pi.on("session_shutdown", (_event, ctx) => {
    if (hasOpenHandoff(ctx.cwd)) return;
    const p = handoffPath(ctx.cwd);
    ensureDir(p);
    const body = [
      "---",
      "status: open",
      "owner: pi (auto)",
      `created: ${isoDate()}`,
      "---",
      "",
      "# Handoff (auto-generated)",
      "",
      "## Done",
      facts.tools.length ? facts.tools.map((t) => `- ${t}`).join("\n") : "(no tool activity recorded)",
      "",
      `## Failed / pending: ${facts.errors} tool error(s) this session`,
      "",
      "## Next",
      "Run /handoff to replace this fallback with a proper handoff, or continue from the session transcript.",
      "",
      "## Open questions",
      facts.prompts.length ? facts.prompts.map((t) => `- ${t}`).join("\n") : "(none)",
    ].join("\n");
    writeFileSync(p, body, "utf8");
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const handoff = readHandoff(ctx.cwd);
    if (!handoff || !/^status:\s*open\s*$/m.test(handoff)) return;
    const capped = handoff.length > HANDOFF_INJECT_CAP ? handoff.slice(0, HANDOFF_INJECT_CAP) + "\n…(truncated)" : handoff;
    const block = `\n\n## Pending handoff (open — continue from here)\n${capped}\n`;
    return { systemPrompt: (event.systemPrompt ?? "") + block };
  });
}
