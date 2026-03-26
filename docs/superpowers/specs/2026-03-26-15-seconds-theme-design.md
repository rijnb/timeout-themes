# Design Spec: 15 Seconds Theme

## Overview
A new theme called "15 Seconds" for the TimeOut-Themes repository. This theme shows a countdown from 15 to 0, using large 3D-stacked neon numbers that move toward the viewer.

## Visual Style: Retro Digital / Neon
- **Color Palette:** High-contrast **random neon colors** (e.g., cyan, magenta, lime, yellow, neon orange) for each number.
- **Typography:** Bold, modern sans-serif or monospaced font. **Numbers are very large (25rem+).**
- **Neon Effect:** Multiple layers of CSS `text-shadow` to create a glowing intensity.
- **3D Corridor:** A container with **perspective: 1500px** for extreme depth. Numbers are stacked with significant spacing (**Z-axis spacing: 400px+**). To ensure all numbers are visible, each is **progressively shifted** along the X and Y axes, creating a long, receding corridor effect.

## Animation: Neon Vaporize
- **Dissolve Effect:** When a number's time is up (after 1 second), it "vaporizes" into many small glowing "particles" that drift outward and fade.
- **3D Movement:** Remaining numbers (e.g., 14, 13, ...) slide forward on the Z-axis AND adjust their X/Y offset to move into the "primary" position as they reach the front.

## Implementation Details
- **Location:** `Themes/15 Seconds.totheme/`
- **File Structure:**
    - `Info.json`: Metadata (Name, Author, identifier).
    - `Documents/index.html`: Main structure and canvas/container for the countdown.
    - `Documents/assets/css/style.css`: All visual styling, neon effects, and 3D scene setup.
    - `Documents/assets/js/script.js`:
        - Countdown logic (starts from 15).
        - Particle generation system for the vaporize effect.
        - Transition management for the 3D stack.

## Success Criteria
- The theme correctly identifies as "15 Seconds."
- The countdown starts at 15 and ends at 0 (or resets/loops as per application standards).
- Each second, the front-most number vaporizes and the stack shifts forward smoothly.
- The neon glow and 3D depth are visually distinct and clear.
