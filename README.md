# Seesaw Balance

A simple seesaw simulation built with HTML, CSS, and JavaScript. Drop balls onto the seesaw and watch it tilt based on torque (weight × distance from pivot).

# File Breakdown

# index.html — Page Structure

| Section | Lines | Purpose |
|---------|-------|---------|
| `<head>` | 4-9 | Meta tags, title, CSS link |
| Parameters | 13-32 | Four boxes: Left Weight, Next Weight, Angle, Right Weight |
| Click hint | 33 | Instruction text ("Click anywhere to drop a ball") |
| Seesaw area | 34-42 | Main play area with preview ball, plank, pivot, scale |
| Control buttons | 43-46 | Reset and Pause buttons |
| History | 47-50 | List of dropped balls (weight + side) |
| Script | 52 | Loads `script.js` |

**Element IDs used by JavaScript:**
- `seesaw-cont` — Click detection area, mouse preview zone
- `ball-preview` — Semi-transparent ball that follows mouse
- `plank` — The seesaw plank (balls are appended here)
- `plank-scale` — Scale ticks (built in JS)
- `history-list` — History items container
- `left-weight`, `right-weight`, `next-weight`, `angle` — Display values
- `reset`, `pause` — Buttons

---

# style.css — Styling

| Section | Lines | Purpose |
|---------|-------|---------|
| Reset & body | 1-13 | Box sizing, Arial font, light gray background |
| Container | 15-17 | Max width 600px, centered |
| Parameters | 19-47 | Flexbox layout for the 4 info boxes |
| Click hint | 49-54 | Gray, centered instruction text |
| **Ball falling** | 56-99 | Animated ball during drop |
| | 56-64 | Base styles (fixed, rounded, no pointer events) |
| | 66-75 | 10 color variants (color-1 … color-10) |
| | 77-86 | Weight label below ball |
| | 88-99 | `ballDrop` animation: click position → plank |
| **Ball preview** | 101-120 | Semi-transparent ball following mouse |
| | 101-116 | Hidden by default, 36×36px, opacity 0.5 |
| | 118-120 | `.visible` shows it on mouse enter |
| Seesaw area | 122-215 | Gray box, plank, pivot, floor |
| | 131-139 | `.seesaw-wrapper` — centers plank |
| | 141-152 | `.pivot` — red circle at center |
| | 154-189 | `.plank-scale` — distance labels and ticks |
| | 191-206 | `.plank` — brown plank, rotates on tilt |
| | 208-215 | `.floor` — support under pivot |
| **Objects (balls)** | 217-243 | Balls on the plank |
| | 217-223 | `.obj` — 28×28 circles, positioned by `left` |
| | 225-233 | Weight text below each ball |
| | 235-243 | `.landing` — small scale-in animation |
| Buttons | 245-271 | Reset and Pause styles |
| History | 273-311 | White box, scrollable list |
| | 296-311 | `.side.left` (red tint), `.side.right` (green tint) |
| Ball colors | 313-318 | Same 10 colors for `.obj` on plank |

---

# script.js — Logic

# Constants (Lines 4-6)
| Name | Value | Purpose |
|------|-------|---------|
| `PLANK_LENGTH` | 400 | Plank width in px |
| `PIVOT_CENTER` | 200 | Center of plank |
| `STORAGE_KEY` | 'seesawState' | localStorage key for save/load |

# State (Lines 20-24)
| Variable | Purpose |
|----------|---------|
| `objects` | Array of { weight, position, colorClass } for balls on plank |
| `dropHistory` | Array of { weight, side } for history list |
| `currentAngle` | Current plank rotation in degrees |
| `isPaused` | Blocks new drops when true |
| `nextWeight` | Random 1–10 kg for the next ball |

# Functions

| Function | Lines | Purpose |
|----------|-------|---------|
| `getRandomWeight()` | 26-28 | Returns 1–10 |
| `getRandomColorClass()` | 30-32 | Returns `'color-'` + 1–10 |
| `buildScale()` | 34-41 | Creates ticks in `plank-scale` (every 25px) |
| `loadState()` | 43-62 | Reads from localStorage, restores objects and history |
| `saveState()` | 64-71 | Saves objects and dropHistory to localStorage |
| `renderObjects()` | 73-87 | Clears plank, creates `.obj` divs for each ball |
| `renderHistory()` | 89-110 | Clears history, shows "No balls" or list (newest first) |
| `computeTorques()` | 112-132 | Sums weight×distance per side, returns torques and weights |
| `updateTilt()` | 134-142 | Computes angle, applies `rotate()` to plank and scale |
| `updateUI()` | 144-150 | Updates Left Weight, Right Weight, Next Weight displays |
| `dropPositionToPlank(clickX)` | 152-159 | Maps screen X to plank position (0–400) using plank angle |
| `animateBallDrop(...)` | 161-184 | Creates falling ball, animates to plank, then calls onComplete |
| `addBallAtPosition(...)` | 186-212 | Adds ball to objects, DOM, history; updates tilt, UI, save |
| `handleClick(e)` | 214-236 | Validates click, gets plank position, starts drop or ignores |
| `onSeesawMouseMove(e)` | 238-245 | Moves ball-preview to mouse position, shows nextWeight |
| `onSeesawMouseEnter()` | 247-249 | Shows preview when mouse enters seesaw area |
| `onSeesawMouseLeave()` | 251-253 | Hides preview when mouse leaves |
| `resetSeesaw()` | 255-264 | Clears all state, re-renders, saves |
| `togglePause()` | 266-270 | Toggles pause state, updates button text |

# Event Listeners (Lines 272-276)
| Event | Target | Handler |
|-------|--------|---------|
| `click` | `document` | `handleClick` |
| `mousemove` | `seesaw-cont` | `onSeesawMouseMove` |
| `mouseenter` | `seesaw-cont` | `onSeesawMouseEnter` |
| `mouseleave` | `seesaw-cont` | `onSeesawMouseLeave` |
| `click` | `reset` | `resetSeesaw` |
| `click` | `pause` | `togglePause` |

# Initialization (Lines 280-284)
1. `buildScale()` — creates scale ticks  
2. `loadState()` — restores from localStorage  
3. `updateUI()` — fills parameter displays  
4. `renderHistory()` — fills history list  

---

# Flow Overview

# Drop Flow
1. User clicks inside `seesaw-cont` (not on buttons/parameters).
2. `dropPositionToPlank(clickX)` calculates plank position.
3. If position &lt; 0 or &gt; 400, the click is ignored.
4. `animateBallDrop()` shows a colored ball from click to plank.
5. After 600 ms, `addBallAtPosition()` adds the ball to the plank and updates state.

# Torque Calculation
- `torque = weight × distance` (distance from pivot).
- `angle = clamp((rightTorque - leftTorque) / 10, -30, 30)`.
- Plank and scale share the same `rotate(angle)` transform.

# Ball Position on Plank
- Plank is 400px; center is 200px.
- `position < 200` → left; `position >= 200` → right.
- Screen X to plank X uses `position = 200 + (clickX - plankCenterX) / cos(angle)`.

---

# Thought Process & Design Decisions

# Interaction: click vs drag-and-drop
- **Choice:** Click anywhere in the seesaw area to drop a ball at that horizontal position.
- **Reasoning:** Drag-and-drop from a fixed “ball source” was tried first; it was replaced with “click to drop” so the ball appears exactly where the user intends. The drop is only valid when the projected position lies on the plank (0–400 px).

# Where the ball lands
- **Choice:** Map screen X to plank position using the current plank angle: `position = 200 + (clickX - plankCenterX) / cos(angle)`.
- **Reasoning:** The plank rotates, so a vertical line at `clickX` hits the plank at one point. Projecting that point onto the plank’s local axis gives a consistent 0–400 position. However, it did not work. 

# Visual feedback
- **Preview ball:** A semi-transparent ball follows the mouse only inside the seesaw box, showing the next weight. This makes it clear where a ball would go and that the area is interactive.
- **Falling ball:** A full-size colored ball animates from the click position down to the plank. The same 10 color classes are used for both the falling ball (`.ball-falling.color-X`) and the ball on the plank (`.obj.color-X`) so the transition looks consistent.

# State and persistence
- **Choice:** One state object (objects + dropHistory) saved to `localStorage` on every change (after drop, reset).
- **Reasoning:** Keeps the logic simple and ensures refresh doesn’t lose progress. No separate “save” button; the UI is always in sync with stored state.

# Torque and angle
- **Formula:** `angle = clamp((rightTorque - leftTorque) / 10, -30, 30)`.
- **Reasoning:** The divisor 10 scales the torque difference to a reasonable tilt range; ±30° avoids extreme angles and keeps the plank visible. The plank and scale share the same `rotate()` so the ruler stays aligned with the plank.

# Trade-offs & Limitations

# No real physics
- Balls don’t roll, bounce, or collide. They’re placed at a position and the tilt is computed from torque only. The “fall” is a CSS animation to the plank, not a simulation.

# Click only on the seesaw area
- Drops are accepted only when the click is inside `seesaw-cont` and the projected position is between 0 and 400. Clicks outside the plank (e.g. in the gray margin of the box) do nothing. This avoids balls appearing at the ends when the user clearly clicked off the plank. It took a lot of time to do that. 

# Fixed plank length and scale
- Plank is 400 px; the scale and math are hardcoded to that. Making the plank responsive would require recalculating positions and possibly rethinking the scale labels.

# localStorage only
- State is stored only in the browser. Clearing site data or using another device/browser loses progress. No backend, no export/import.

# Pause only blocks new drops
- “Pause” prevents new balls from being dropped; it doesn’t freeze the current tilt or hide the preview. The plank stays as is. A stricter pause could also hide the preview and optionally dim the area.

# How to Run

Open `index.html` in a browser. No server or build step needed.

# Tech Stack

- HTML
- CSS
- JavaScript
