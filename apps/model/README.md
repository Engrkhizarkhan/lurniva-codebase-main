# @lurniva/model — AI model service

A self-contained app inside the Lurniva monorepo that brings the
[**book-to-skill**](https://github.com/virgiliojr94/book-to-skill) methodology
into the platform: user / platform content is _structured_ into a study skill
and then _used_ to build plans, answer questions, and generate assessments —
grounded on the user's actual content.

Unlike a plain chatbot, it does not dump the whole document into context. It
distills content into an **overview + on-demand chapters + glossary + patterns +
cheatsheet** (progressive disclosure), then routes every study request to the
most relevant chapter. This is the same approach the upstream `book-to-skill`
project applies to technical PDFs, here turned into a JSON/HTTP service.

## Quick start

```bash
# 1. Copy and fill in your model credentials
cp apps/model/.env.example apps/model/.env
#    OPENAI_API_KEY=sk-...
#    MODEL_NAME=gpt-4o-mini

# 2. Run the model app (port 4000)
pnpm --filter @lurniva/model dev
```

Open **http://localhost:4000** for the web UI: paste content → “Distill into a
skill” → open the skill → build a plan, chat, or generate assessments.

> No key set? The app boots fine and returns a clear `503 MODEL_NOT_CONFIGURED`
> until `OPENAI_API_KEY` + `MODEL_NAME` are provided.

## Environment variables (`apps/model/.env`)

| Variable           | Required | Default                     | Meaning                                            |
| ------------------ | -------- | --------------------------- | -------------------------------------------------- |
| `OPENAI_API_KEY`   | yes*     | –                           | OpenAI (or any compatible provider) API key        |
| `MODEL_NAME`       | yes*     | –                           | Model id, e.g. `gpt-4o-mini`, `o3-mini`            |
| `OPENAI_BASE_URL`  | no       | `https://api.openai.com/v1` | Any OpenAI-compatible gateway (OpenRouter, local…) |
| `MODEL_MAX_TOKENS` | no       | `2048`                      | Per-call output cap                                |
| `MODEL_PORT`       | no       | `4000`                      | Dev server port                                    |

\* `OPENAI_API_KEY` + `MODEL_NAME` are needed to actually talk to a model; the
app and its whole API still load without them (everything degrades gracefully).

`OPENAI_BASE_URL` exists so you can point the service at OpenRouter, a Cohere/Anthropic
compatible proxy, or a local vLLM/Ollama gateway without code changes.

## How the book-to-skill integration works

`src/features/model/services/book-to-skill.ts` ports the upstream workflow:

1. **Structure, not summary.** The model receives the raw content and is told to
   return a JSON skill: `overview`, `chapters` (each with `title`/`topics`/
   `content`), `patterns` (frameworks / principles / techniques / anti-patterns),
   `glossary`, and `cheatsheet`.
2. **Progressive disclosure.** The overview + topic index are always available;
   each chapter is dense, self-contained content loaded _on demand_ only when the
   user asks about it.
3. **Grounding (RAG).** `src/features/model/services/query-skill.ts` scores
   chapters against the user's question by keyword overlap over title/topics/
   content, pulls the top 1–3 chapters as context, and instructs the model to
   answer **only from that context** — no hallucination.

That structurized skill then drives everything else:

- `study-plan.ts` builds a day-by-day plan honouring the user's **timeline**
  selection (`auto` = spread chapters over N days; `manual` = explicit split),
  plus hours/day and days/week.
- `assessments.ts` generates **flashcards / MCQs / short-questions / mock exams**
  from chosen chapters, keeping the answer key server-side (the client payload
  never leaks `correctIndex`).

## API

Base URL for the model service: `http://localhost:4000`

| Method | Path                                 | Description                                                                    |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------ |
| GET    | `/api/model/handshake`               | Is the model configured? Reports model + base URL.                             |
| GET    | `/api/model/skills/`                 | List distilled skills (summary).                                               |
| POST   | `/api/model/skills/`                 | Distill `{ title?, content }` into a skill (201).                              |
| GET    | `/api/model/skills/{id}`             | Full skill (hood overview + chapters + glossary + …).                          |
| DELETE | `/api/model/skills/{id}`             | Delete a skill.                                                                |
| POST   | `/api/model/skills/{id}/query`       | Grounded Q&A `{ question, history? }`.                                         |
| POST   | `/api/model/skills/{id}/plan`        | Build a plan `{ timeline, hoursPerDay, daysPerWeek, totalDays, manualDays? }`. |
| POST   | `/api/model/skills/{id}/assessments` | `{ kind: flashcards\|mcqs\|short_questions\|mock_exam, chapterIds?, count? }`. |

All success responses use `{ success: true, data }`; errors use
`{ success: false, error: { message, code } }`. `503 MODEL_NOT_CONFIGURED` is
returned when the key/model are missing.

### Example — distill content

```bash
curl -X POST http://localhost:4000/api/model/skills/ \
  -H 'Content-Type: application/json' \
  -d '{"title":"Distributed Systems","content":"Your long study material here..."}'
```

```json
{ "success": true, "data": { "skill": { "id": "sl_...", "overview": "...",
  "chapters": [ { "id": "ch01-...", "title": "...", "topics": [...], "content": "..." } ],
  "patterns": [...], "glossary": [...], "cheatsheet": "...", "createdAt": "..." } } }
```

## Web UI

| Route                      | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `/`                        | Home: paste content, model status, list skills.  |
| `/skills/{id}`             | Skill overview + chapters + patterns + glossary. |
| `/skills/plan/{id}`        | Build a study plan (auto / manual timeline).     |
| `/skills/chat/{id}`        | Grounded chat against the distilled chapters.    |
| `/skills/assessments/{id}` | Generate and take assessments.                   |

## How it connects to the rest of the platform

The repository already had a single swappable AI seam for the product UI:

`apps/web/src/server/ai/index.ts` → `getAiProvider(): AiProvider`

Before this change it always returned `MockAiProvider`. It now returns:

- a **real, grounded `OpenAiAiProvider`** (`apps/web/src/server/ai/openai-provider.ts`)
  when `OPENAI_API_KEY` + `MODEL_NAME` are present in the web app env — the same
  two variables the model service uses; and
- the original **`MockAiProvider` fallback** when they are absent, so `pnpm --filter @lurniva/web dev` still works offline.

This lets the existing plan → day-study flows (summaries, revision notes,
flashcards, MCQs, short-answer grading, RAG chat) call a real model with a
`book-to-skill` style grounding prompt whenever a key+model are configured —
no other application code needed to change.

## Getting a real response without credits (local test)

Point `OPENAI_BASE_URL` at any OpenAI-compatible server. To run an offline smoke
test end-to-end, the repo's CI/demo flow uses a tiny mock gateway that returns
the right JSON shapes; the same client code works unchanged against a real
provider.

## Development

```bash
pnpm --filter @lurniva/model dev        # run the model app (port 4000)
pnpm --filter @lurniva/model typecheck  # tsc --noEmit
pnpm --filter @lurniva/model lint       # eslint (0 warnings allowed)
pnpm --filter @lurniva/model build      # vite build + typecheck
```

## Architecture notes

- **Framework:** TanStack Start (file-based routes) + React — mirrors `apps/web`
  and `apps/api` so the monorepo stays uniform.
- **AI client:** a dependency-free, fetch-based OpenAI-compatible client
  (`src/server/ai/openai-client.ts`) — no SDK pinning, works with any gateway.
- **Persistence:** an in-memory store (`src/store/model-store.ts`) keeps skills,
  plans and assessments for the life of the process. Swap `skillStore` /
  `planStore` / `assessmentStore` for Supabase/Prisma to persist across restarts.
- **Preserving prior `book-to-skill` qualities:** exact framework names, no raw
  passage copying, density over completeness, and topics-indexes per chapter so
  routing stays cheap.
