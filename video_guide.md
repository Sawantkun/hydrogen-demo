# MODULE 11 — AI-Powered Refactoring with CodeRabbit Commands
## Screen Recording Overview + Steps

**VIDEO GOAL:**
Show how developers can use CodeRabbit’s `@coderabbit refactor` command to automatically improve code quality, structure, and readability without changing functionality.

**VIDEO STRUCTURE:**
1. Intro (0:00–0:45)
2. Show messy code example (0:45–2:00)
3. Trigger @coderabbit refactor (2:00–4:00)
4. Show CodeRabbit's suggestions (4:00–7:00)
5. Apply changes & show before/after (7:00–10:00)
6. Extra refactoring examples (10:00–11:30)
7. Summary (11:30–12:00)

---

### DETAILED SCREEN RECORDING STEPS

#### PART 1 — Video Introduction (0:00 – 0:45)
- **Action:** Show GitHub PR page.
- **Action:** Zoom into PR title and CodeRabbit sidebar.
- **Overlay text:** “Refactoring is one of the most powerful CodeRabbit commands.”

#### PART 2 — Show a Messy Code Example (0:45 – 2:00)
- **Action:** Open `app/routes/messy-example.jsx`.
- **Note:** It has `var` usage, poor naming, repeated logic, inline styles.
- **Action:** Slowly scroll and zoom into issues.
- **Overlay text:** “Messy function → Hard to maintain.”

#### PART 3 — Trigger @coderabbit refactor (2:00 – 4:00)
- **Action:** Add a comment on the PR or file:
  ```
  @coderabbit refactor
  ```
- **Voiceover/Explain:** CodeRabbit analyzes structure, readability, naming, repetition—without changing functionality.

#### PART 4 — Show CodeRabbit’s Suggestions (4:00 – 7:00)
- **Action:** Scroll AI response.
- **Highlight improvements:**
  - `var` → `let/const`
  - Better naming (e.g., `d` → `date`)
  - Extracted helper functions (date formatting)
  - Removed duplicate code
  - Clean structure
- **Overlay text:** “Modern syntax • No behavioral change”

#### PART 5 — Apply Changes & Before/After (7:00 – 10:00)
- **Action:** Click Apply Patch or commit changes.
- **Action:** Show diff comparison.
- **Highlight:**
  - Smaller functions
  - Clean naming
  - Reduced code size
- **Overlay text:** “Before | After”

#### PART 6 — Extra Mini Examples (10:00 – 11:30)
*Action: Show adding these comments*

**Example 1: Convert callbacks to async/await**
> `@coderabbit refactor this to async/await`

**Example 2: Remove duplication**
> `@coderabbit refactor for duplication removal`

**Example 3: Extract React components**
> `@coderabbit refactor into smaller components`

#### PART 7 — Summary (11:30 – 12:00)
- **Action:** Show PR overview.
- **Overlay bullet points:**
  - Faster reviews
  - Zero-impact refactors
  - Great for legacy cleanup
- **Closing line:** “Refactoring with CodeRabbit instantly improves code quality.”
