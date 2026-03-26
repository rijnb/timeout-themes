# Space Invaders Exact 2:45 Shooting Pace Design

## Goal
The shooter must calculate a shooting pace such that the 56th and final enemy is destroyed exactly 2 minutes and 45 seconds (165,000 ms) after the game starts. The shooting should look random but converge on this precise deadline.

## Requirements
- Total Enemies: 56.
- Final Destruction Time ($T_{final}$): 165,000 ms.
- Shooting behavior must appear random (variable intervals, bursts).
- Must account for bullet travel time to ensure the *hit* happens at the milestone.
- The algorithm must be robust against player evasion (delays).

## Architecture

### 1. Milestone Generation
At the start of the game, a `destructionMilestones` array of 56 timestamps will be generated.
- `milestones[55] = 165000`.
- `milestones[0...54]` are generated using a random walk or segmented partition.
- To ensure a "natural" progression, the intervals between milestones will be weighted. Early game can have longer gaps; late game might speed up or have more frequent bursts.

### 2. Precise Firing
For each milestone $T_i$, the player calculates:
- $Y_{enemy}$: The current (or predicted) Y position of the target.
- $Y_{player}$: The player's Y position.
- $TravelTime = (Y_{player} - Y_{enemy}) / BulletSpeed$.
- $FireTime = T_i - TravelTime$.

The player will fire as close to $FireTime$ as possible, provided they are aligned with the target.

### 3. Drift Compensation
If the player is delayed (e.g., evading a bomb), the remaining milestones will be proportionally "squashed" into the remaining time to ensure the 165s deadline is still met.

## Components

### `generateMilestones()`
Generates 56 timestamps.
- Uses a base interval with random jitter.
- Adjusts jitter to ensure the sum is exactly 165,000.

### `updateBullets(delta, elapsed)`
- Monitors `nextEnemyIndex`.
- Fetches $T = milestones[nextEnemyIndex]$.
- Calculates required $FireTime$.
- Triggers shot when `elapsed >= FireTime`.

### `updatePlayer(delta)`
- Prioritizes moving to the X-position of the `nextTarget` to be ready for the calculated $FireTime$.

## Testing & Verification
- Log the `elapsed` time when the 56th enemy's `alive` property becomes `false`.
- Ensure it is within ±16ms (one frame) of 165,000ms.
