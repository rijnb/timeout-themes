<!-- BEGIN:nextjs-agent-rules -->
This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

You have Superpowers skills. Before you do anything else, make sure read how to use the Superpowers skills at "$HOME/.junie/skills/using-superpowers".

Always use the Superpowers skills, except:
- Do not use the skill to use Git worktrees. Do not use "$HOME/.junie/skills/using-git-worktrees". Just use the current Git branch to work on.
- Do not use the skill to spawn subagents, as Junie does not support them. Do not use "$HOME/.junie/skills/subagent-driven-development" or "$HOME/.junie/skills/dispatching-parallel-agents" . Instead, if you need to use sub-agents for to execute a plan, execute the first task from the plan that is not marked as done and executed it. At the end of execution, mark it as done in the plan, stop and wait for the next task. Instruct the user they can start a new conversation to ask you to continue execution of the tasks.

Always explain which Superpowers skill you are using.
