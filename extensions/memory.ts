import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

// Hermes-style char budget: keeps each injected store compact and high-signal.
const MAX_CHARS = 2400;

type Scope = "user" | "engineering";

const FILES: Record<Scope, string> = {
  user: "user-context.md",
  engineering: "engineering.md",
};

function memoryPath(scope: Scope): string {
  const base = process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
  return join(base, "memory", FILES[scope]);
}

async function readMemory(scope: Scope): Promise<string> {
  try {
    return await readFile(memoryPath(scope), "utf8");
  } catch {
    return "";
  }
}

async function writeMemory(scope: Scope, text: string): Promise<void> {
  const p = memoryPath(scope);
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, text.trimEnd() + "\n", "utf8");
}

export default function (pi: ExtensionAPI) {
  // 1) Inject fresh memory into every agent run (before the agent loop).
  pi.on("before_agent_start", async (event) => {
    const user = (await readMemory("user")).trim();
    const eng = (await readMemory("engineering")).trim();
    if (!user && !eng) return;

    const parts: string[] = [];
    if (user) {
      parts.push(`## User context (facts about Rita — managed by the remember tool)\n${user}`);
    }
    if (eng) {
      parts.push(
        `## Engineering preferences (global, cross-project — managed by the remember tool)\n` +
          `Apply these across all projects:\n${eng}`
      );
    }
    const block = "\n\n" + parts.join("\n\n") + "\n";
    return { systemPrompt: (event.systemPrompt ?? "") + block };
  });

  // 2) Native `remember` tool — Hermes-style memory write mechanism, two scopes.
  pi.registerTool({
    name: "remember",
    label: "Remember (user or engineering)",
    description:
      "Persist durable knowledge to long-term memory. Two scopes: 'user' = durable facts about " +
      "Rita (preferences, environment, identity); 'engineering' = global cross-project rules she " +
      "wants applied to every project (programming style, code-review standards, architecture rules, " +
      "conventions). Use ONLY for durable, high-signal, stable knowledge. NEVER use for task progress, " +
      "PR numbers, commit SHAs, 'done X' logs, or per-project facts — per-project engineering " +
      "facts/decisions belong in .ai/, not here.",
    promptGuidelines: [
      "Use scope=user for durable facts about Rita; scope=engineering for global programming/architecture/code-review rules that apply across ALL projects.",
      "For engineering scope, record cross-project rules (style, architecture, review standards), NOT project-specific facts — those go in .ai/.",
      "Phrase entries as statements: user facts like \"Rita prefers X\"; engineering rules like \"Architecture rule: services must not share a database\".",
      "When the user corrects something, use action=replace — never append a contradiction.",
      "Keep each store compact; consolidate or remove stale entries rather than piling up.",
    ],
    parameters: Type.Object({
      scope: Type.Union([
        Type.Literal("user"),
        Type.Literal("engineering"),
      ]),
      action: Type.Union([
        Type.Literal("add"),
        Type.Literal("replace"),
        Type.Literal("remove"),
        Type.Literal("list"),
      ]),
      fact: Type.Optional(
        Type.String({ description: "The new entry text (required for add and replace)." })
      ),
      old_fact: Type.Optional(
        Type.String({
          description: "Substring of the existing entry to match (required for replace and remove).",
        })
      ),
    }),
    async execute(_id, params, _signal, _onUpdate, _ctx) {
      const scope: Scope = params.scope as Scope;
      const current = await readMemory(scope);
      const lines = current.split("\n").filter((l) => l.trim().length > 0);

      if (params.action === "list") {
        return {
          content: [
            {
              type: "text",
              text: current.trim() || `(memory '${scope}' is empty)`,
            },
          ],
          details: {},
        };
      }

      if (params.action === "add") {
        const fact = (params.fact ?? "").trim();
        if (!fact) {
          return { content: [{ type: "text", text: "remember: `fact` is required for add." }], details: {} };
        }
        lines.push(`- ${fact}`);
        const next = lines.join("\n");
        await writeMemory(scope, next);
        const over = next.length > MAX_CHARS;
        return {
          content: [
            {
              type: "text",
              text: `Saved to '${scope}' (${next.length} chars).${over ? ` Over the ${MAX_CHARS}-char budget — consolidate stale entries.` : ""}`,
            },
          ],
          details: {},
        };
      }

      if (params.action === "replace" || params.action === "remove") {
        const needle = (params.old_fact ?? "").trim();
        if (!needle) {
          return {
            content: [{ type: "text", text: "remember: `old_fact` is required for replace/remove." }],
            details: {},
          };
        }
        const idx = lines.findIndex((l) => l.toLowerCase().includes(needle.toLowerCase()));
        if (idx === -1) {
          return { content: [{ type: "text", text: `No existing entry matched "${needle}".` }], details: {} };
        }
        if (params.action === "replace") {
          const fact = (params.fact ?? "").trim();
          if (!fact) {
            return {
              content: [{ type: "text", text: "remember: `fact` is required for replace." }],
              details: {},
            };
          }
          lines[idx] = `- ${fact}`;
        } else {
          lines.splice(idx, 1);
        }
        await writeMemory(scope, lines.join("\n"));
        return {
          content: [{ type: "text", text: `Memory '${scope}' ${params.action === "replace" ? "updated" : "removed"}.` }],
          details: {},
        };
      }

      return { content: [{ type: "text", text: "Unknown action." }], details: {} };
    },
  });
}
