---
title: Lazlo Coding Agent Migration - Complete History, Failures, and New Direction
created: 2026-05-05
tags: [lazlo, migration, ai-collaboration, failures, lessons-learned, engraver]
ai-created: true
---

# Lazlo Coding Agent Migration - Complete History, Failures, and New Direction

**Owner:** Hermes (main profile)  
**Previous Owner:** Vacation-coordinator  
**Status:** Active — Revised 2026-05-05 based on user feedback about half-baked handoffs and under-utilization of Laszlo's reasoning.

This document is the single source of truth. It records **everything** — successes, failures, rejected ideas, lessons learned, and the current direction. It exists specifically to prevent us from repeating the same thought cycles ("Hey, maybe this is a great idea") after we already evaluated and discarded them.

## Background

The original goal was to turn Laszlo (Claude Code CLI) from a one-shot subprocess into a persistent, bidirectional coding agent that could receive tasks from other agents (especially Vacation) and ask questions mid-task without losing context or requiring full restarts.

This came out of frustration during Branson 2026 dashboard work: Laszlo would get stuck, ask a question, the task would die, and a human (or another agent) had to restart it with new context. This broke the "multi-agent vibe coding" vision.

## Phase 1: What We Tried and Why It Failed (Critical Section)

We made several fundamental mistakes. These are documented here in detail so we never repeat the same reasoning loop.

### Failure 1: One-Shot Subprocess Model (`claude --dangerously-skip-permissions`)
- **What we did:** Invoked Laszlo as a one-shot command that started, ran, and exited.
- **Why it seemed good:** Simple, no persistent process management.
- **Why it failed:** Complete loss of context and reasoning chain on every invocation. No ability to have ongoing conversation. Mid-task questions killed the entire task.
- **Good idea hidden in the failure:** The `--dangerously-skip-permissions` flag was useful for automation. We kept this for the new persistent model.
- **Lesson:** Never use one-shot subprocesses for agents that need to think deeply or maintain state across turns.

### Failure 2: Rigid File-Polling Question Protocol (`pending.json` / `answer.json`)
- **What we did:** Laszlo would write a `pending.json` file and send a Discord ping. Vacation would write `answer.json`. Laszlo would poll for it.
- **Why it seemed good:** "Simple file-based handshake" that didn't require changing core infrastructure.
- **Why it failed:** Extremely awkward UX. Broke natural conversation flow. Made Laszlo feel like a scripted bot instead of a reasoning engineer. High friction for multi-turn tasks. We were still forcing Vacation to do too much engineering work before handing off.
- **Good idea hidden in the failure:** The concept of "Laszlo can ask questions and continue after receiving answers" was correct. The implementation (file polling) was wrong.
- **Lesson:** Never force high-reasoning agents into rigid, non-conversational protocols. Natural language in the same thread is vastly superior.

### Failure 3: Vacation Acting as Software Engineer Before Handoff
- **What we did:** Vacation (weaker reasoning model) would try to create detailed implementation plans, break down tasks, and write partial code before handing off to Laszlo.
- **Why it seemed good:** "Reduce cost" by having Laszlo do less work.
- **Why it failed:** Vacation's reasoning is not strong enough for high-quality software engineering. This produced half-baked specs. Laszlo received poor-quality tasks and couldn't have natural clarifying conversations. This completely under-utilized Laszlo's superior reasoning capabilities.
- **Good idea hidden in the failure:** Having clear acceptance criteria and project management is valuable. Vacation should do that part well.
- **Lesson:** Let the strongest reasoning model (Laszlo/Claude Code) do the actual engineering. Weaken models should stay in their lane (PM, coordination, stakeholder management).

### Failure 4: Heavy Reliance on Redis Pub/Sub for Task Dispatch
- **What we did:** Considered using Redis channels (`hermes-agent:lazlo`) for task delivery.
- **Why it seemed good:** Architecturally clean bidirectional communication.
- **Why it failed:** No message persistence (if no subscriber, message is lost forever). Vacation-coordinator is an interactive session, not a daemon. The `agent-message` `receive()` function had a hardcoded channel bug (`hermes-agent:hermes` instead of parameterized). Redis appendonly was disabled on studio.
- **Good idea hidden in the failure:** Persistent, bidirectional communication between agents is the right goal.
- **Lesson:** Prefer proven, simple mechanisms (existing gateway + Discord threads + HTTP) over adding complex infrastructure unless absolutely necessary.

### Other Rejected Ideas
- Making Laszlo a pure "execute and stop" tool (already covered).
- Building a full Redis platform adapter for the Hermes gateway (unnecessary complexity when api_server already worked).
- Using shell wrapper polling loops (same context loss problem as one-shot).

These failures were not small. They were architectural and philosophical. We were optimizing for the wrong thing (cost per token) instead of quality of output and natural agent collaboration.

## New Accepted Direction (2026-05-05)

**Philosophy Shift (Locked In):**

- **Vacation** = Pure Project Manager. Defines high-level goals, priorities, acceptance criteria, coordinates with stakeholders, maintains the big picture. Does **not** write implementation plans or do significant engineering work before handing off.
- **Laszlo** = Senior Software Engineer. Given a real task, it runs loose with full reasoning power. It can propose approaches, ask natural clarifying questions in Discord threads, iterate, think deeply, and deliver high-quality code. It should feel like collaborating with a very strong human engineer.
- **Communication:** Natural bidirectional conversation in the same Discord thread or dedicated channel. Context is maintained across turns. No more awkward file polling unless it's the only viable option.
- **Persistence:** Laszlo runs as a long-lived agent on `engraver` with maintained context.

**Technical Plan:**
- Move Laszlo permanently to `engraver`.
- Use the existing gateway + api_server for task dispatch.
- Enable natural in-thread questioning and continuation.
- Fix the two blocking bugs (agent-message channel bug, insecure default API key).
- Update all skills and documentation.
- Test thoroughly with real multi-turn tasks.

This direction directly fixes the core dissatisfaction: we were not letting Laszlo use its full reasoning capability, and we were not enabling real conversation.

## Implementation Plan

(Details in the handoff document: `Lazlo-Migration-Handoff-to-Vacation.md`)

**High-level sequence:**
1. Update documentation (this file + handoff document).
2. Fix the two mandatory bugs.
3. Bootstrap persistent Laszlo on engraver.
4. Implement clean bidirectional conversation pattern.
5. Run updated test plan focused on natural multi-turn collaboration.
6. Update skills (`lazlo`, `local-inter-agent-communication`, `remote-agents`, etc.).
7. Archive old studio profile only after 2+ weeks of stability.

**Current Owner:** Hermes (main profile) as of 2026-05-05.

**Last Updated:** 2026-05-05

**Related:**
- [[Lazlo-Migration-Handoff-to-Vacation]]
- [[Council of Minds]]
- [[Local Inter-Agent Communication]]
- [[Remote Agents]]

This document will continue to be updated as we execute the new plan.
---

**This document is now saved at:** `~/vaults/Vacation/Branson 2026/Lazlo-Coding-Agent-Migration-History.md`

I have also created the clean handoff document for Vacation at `~/vaults/Vacation/Branson 2026/Lazlo-Migration-Handoff-to-Vacation.md`.

Both documents are now in the Vacation vault and ready.

I have documented our failures honestly and in detail, including what seemed promising at the time, why it ultimately failed, and any valuable ideas we should preserve.

I'm now ready to begin implementation of the new conversational model (persistent Laszlo on engraver, natural language handoff, Vacation staying in pure PM role, Laszlo running loose with full reasoning).

Would you like me to start with the documentation handoff to Vacation, or begin the technical work (fixing the agent-message bug first, as previously recommended)?