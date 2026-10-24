# Machmaso collaboration rules

## Project and shared conventions

- The project name is Machmaso. Agamir and Tomas collaborate from separate computers.
- Communicate with Codex in English. Write code, comments, commit messages, and shared documentation in English.
- Inspect existing code and instructions before making changes. Keep changes focused on the requested task and preserve unrelated work.
- The existing application is a Next.js App Router prototype with TypeScript, Tailwind CSS, Leaflet/OpenStreetMap, marker clustering, Lucide icons, and EN/DE controls. The interface is currently monochrome.
- Listings load server-side from Supabase with built-in fictional samples as a fallback. Posting actions and sending requests remain local React-memory demos that reset on refresh; authentication, database writes, real messaging, and payments are not implemented. The Python files are historical test scaffolding, not the application architecture.
- Never commit credentials or real `.env` files. Use placeholder values in `.env.example` when needed.
- Keep setup instructions current when development commands change.

## Before each implementation task

- Ordinary project tasks are performed directly on `main`. Pull requests and approval from the other collaborator are not required; this supersedes the previous PR-only workflow.
- Check the current branch and working tree. Check for other local agents actively working in the same checkout before switching branches or pulling; do not automatically switch or pull while they are working.
- Fetch `origin`, safely switch to `main`, and update it from `origin/main` with `git pull --ff-only origin main` before editing.
- Never discard or silently include unrelated local changes or commits. If unrelated work or divergent history prevents safe synchronization, preserve it and resolve the situation before proceeding.
- Use a separate branch or worktree for simultaneous local tasks so they do not interfere with each other.

## After completing an implementation task

- Run checks appropriate to the change. Report what was checked and any checks that could not be run.
- Review the diff, including intended untracked files, for unintended changes and secrets. Stage and commit only the task's changes with a descriptive English commit message.
- Push directly to `origin/main` with a normal push, without routinely requesting another confirmation. Verify and report the result.
- Explicit user instructions such as "draft only", "do not commit", or "do not push" override this default.

## Concurrent work and rejected pushes

- If a push is rejected because the other collaborator pushed first, fetch and integrate the latest `origin/main` while preserving both collaborators' work.
- Rebase only the task's own unpublished commits when safe. Do not rewrite published history or unrelated commits.
- Resolve straightforward conflicts while preserving both collaborators' intent. Ask about genuinely ambiguous conflicts.
- Repeat checks affected by integration, review the resulting diff, and retry a normal push.
- Never force-push `main` or shared branches, reset away work, or discard someone else's changes.
- If repository rules reject direct pushes, report the exact restriction. Do not bypass it or change branch protection.

## Deployment and authorization

- A normal push to `main` may trigger the existing Vercel production deployment. Agamir and Tomas authorize this as part of the default workflow; no routine extra confirmation is needed.
- Do not change Vercel settings, add paid services, make purchases, or perform destructive database operations without explicit authorization.
- Report deployment status or preview URLs only when verified; otherwise state that deployment could not be verified.
- Do not install background synchronization, scheduled jobs, or Git hooks as part of this workflow.
