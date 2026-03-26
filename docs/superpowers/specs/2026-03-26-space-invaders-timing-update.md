# Space Invaders Timing Update Design

Update the Space Invaders theme to handle 90 enemies (15x6) instead of 56 (8x7). Change the timing strategy to adapt to shooting 90 in 2:45 (165s). Implement a "Rhythmic Burst" firing logic with a bullet limit of 3-5 and longer recharge periods.

## 1. Enemy Grid Update

- **Grid Layout:** 15 columns x 6 rows (90 enemies total).
- **Enemy Size:** Keep `ENEMY_W = 36` and `ENEMY_H = 28`.
- **Spacing:** Adjust `ENEMY_PAD_X` to ~14 and `GRID_OFFSET_X` to ~25 to fit 15 enemies across the 800px width.
- **Milestones:** Generate 90 milestones over the 2:45 (165,000ms) deadline.

## 2. Rhythmic Bursts (3-5 Bullets)

- **Firing Logic:** Instead of continuous fire, the player will fire in "bursts."
- **Burst Count:** Randomly choose 3, 4, or 5 bullets for each burst.
- **Burst Delay:** A short 200ms delay between shots within a burst.
- **Recharge Delay:** A longer ~6.5-7 second "recharge" delay between bursts. This spreads the 90 kills over the full 2:45 minutes.
- **Bullet Limit:** A maximum of 5 active bullets at any time.

## 3. Alignment & Accuracy

- **Prediction:** Keep the current bullet-arrival prediction logic for aiming.
- **Accuracy:** The player will prioritize alignment but will fire if "overdue" according to the timing milestone, ensuring the 2:45 deadline is always met.
- **Visuals:** Add a small "recharging" indicator (or color change) to the player ship to signal when it can't fire yet.

## 4. Testing & Verification

- **Verification:** Run the theme and ensure 90 enemies are destroyed by 165,000ms.
- **Verification:** Check that the firing pattern is rhythmic and consistent with the design.
- **Verification:** Confirm that the player ship does not exceed 5 active bullets.
