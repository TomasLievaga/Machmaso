# Machmaso

Machmaso is a shared project developed by Agamir and Tomas on separate computers.

The repository currently contains only a small Python test scaffold (`hello.py` and
`test_hello.py`). The application stack and product requirements are not yet
decided; these files do not establish the application's architecture. The agreed
application stack and setup commands will be documented here once decided.

## Collaboration workflow

1. Start with a clean working tree, switch to `main`, and update it with `git pull --ff-only origin main`. If updating fails, resolve the divergence together without discarding work.
2. Create a separate task branch, for example `git switch -c codex/agamir-task-name` or `git switch -c codex/tomas-task-name`.
3. Implement the focused change and run appropriate checks.
4. Review the diff and commit the intended files with an English commit message.
5. Push the task branch with `git push -u origin <task-branch>`.
6. Open a pull request into `main` and obtain the other collaborator's review.
7. Merge the reviewed pull request, then update local `main` before starting another task.

Follow [AGENTS.md](AGENTS.md) for shared collaboration rules. Communicate with
Codex and write code, comments, commit messages, and shared documentation in English.
