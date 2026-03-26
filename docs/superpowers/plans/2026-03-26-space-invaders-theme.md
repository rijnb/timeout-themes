# Space Invaders Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the Space Invaders theme and restrict its size to 60% of the page.

**Architecture:** Wrap the existing `<canvas>` element in a centered container using CSS Flexbox. The container will have a width and height of 60% of the viewport, and the canvas will scale to fit this container while maintaining its aspect ratio (800:600).

**Tech Stack:** HTML5, CSS3, JavaScript.

---

### Task 1: Update design spec and implementation plan

**Files:**
- Modify: `docs/superpowers/specs/2026-03-26-space-invaders-theme-design.md`
- Modify: `docs/superpowers/plans/2026-03-26-space-invaders-theme.md`

- [ ] **Step 1: Update design spec with layout changes**
- [ ] **Step 2: Update implementation plan with new task**
- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/
git commit -m "docs: update Space Invaders spec and plan for 60% centered layout"
```

### Task 2: Modify index.html for centered 60% layout

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Wrap canvas in a container and update CSS**

```html
<!-- In Themes/Space Invaders.totheme/Documents/index.html -->
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    background: #000; 
    overflow: hidden; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    width: 100vw; 
    height: 100vh; 
  }
  #game-container {
    width: 60vw;
    height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  canvas { 
    max-width: 100%; 
    max-height: 100%; 
    object-fit: contain;
    image-rendering: pixelated; /* Optional: keeps pixel art sharp if scaled */
  }
</style>
...
<body>
  <div id="game-container">
    <canvas id="game"></canvas>
  </div>
...
```

- [ ] **Step 2: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: center Space Invaders game and limit to 60% of page"
```

### Task 3: Update theme metadata

**Files:**
- Modify: `Themes/Space Invaders.totheme/Info.json`

- [ ] **Step 1: Increment version and update modified date**

```json
{
  ...
  "version": 2,
  "modified": "2026-03-27",
  ...
}
```

- [ ] **Step 2: Commit**

```bash
git add "Themes/Space Invaders.totheme/Info.json"
git commit -m "chore: update Space Invaders theme metadata"
```
