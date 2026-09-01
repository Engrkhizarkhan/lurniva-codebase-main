# Lurniva — AI Study & Assessment Full-Stack Implementation

You are working on an existing production application called **Lurniva**.

Your task is to implement and improve the AI Study experience and related navigation, assessment flows, AI conversations, and study-planning interactions.

The goal is to deliver a **production-ready, premium SaaS experience** comparable to a well-funded $100M+ startup.

However, **do not rewrite or restructure the existing application unnecessarily.**

The existing codebase, architecture, components, patterns, APIs, state management, styling conventions, and folder structure are the source of truth.

---

## design mcp and references, implement these

Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/540b12bb-df3c-4bfd-affb-d459cc5a03c7?file=AI+Study+Prep.dc.html

Focus on these files (the whole project is readable):

- `AI Study Prep.dc.html`
- "

# 1. CRITICAL RULE — FOLLOW THE EXISTING CODEBASE

Before writing any code:

1. Inspect the existing project structure.
2. Identify the current routing architecture.
3. Identify the existing sidebar/navigation implementation.
4. Identify the existing AI chat implementation.
5. Identify the existing Learning/Assessment mode implementation.
6. Identify existing reusable UI components.
7. Identify existing API/service patterns.
8. Identify existing state-management patterns.
9. Identify existing data-fetching patterns.
10. Identify existing TypeScript types/interfaces.
11. Identify existing form/validation patterns.
12. Identify existing loading/error/empty-state patterns.
13. Identify existing authentication/user patterns.

**Strictly follow the patterns already established in the repository.**

Do NOT introduce:

- A new state-management library
- A new routing library
- A new UI library
- A new styling architecture
- A second API abstraction
- A duplicate component system
- Unnecessary global state
- Duplicate utilities
- Duplicate types
- A new folder structure just because you prefer it

If the project already uses a pattern for something, **reuse that pattern.**

Before implementing anything, understand how the existing feature works and extend it.

---

# 2. DO NOT BREAK EXISTING FUNCTIONALITY

All existing functionality must continue working.

Before changing a component:

- Understand its current consumers.
- Check whether it is shared.
- Preserve existing props unless there is a strong reason to modify them.
- Avoid breaking existing routes.
- Avoid changing unrelated components.
- Avoid unnecessary database/API changes.

If an existing component can be extended cleanly, extend it instead of replacing it.

---

# 3. SIDEBAR INFORMATION ARCHITECTURE

Refactor the sidebar navigation into three clear groups:

## Learning

Items related to studying and academic work.

Examples:

- Dashboard
- Study Planner
- AI Study
- Subjects / Courses
- Notes
- etc.

Use the **actual existing navigation items from the codebase**.

Do not invent unnecessary pages.

---

## Community

Items related to social/community functionality.

Use the existing community-related navigation items.

If there are currently no community items, do not fabricate functionality just to populate the section.

---

## Account

Items related to the user's account and settings.

Examples:

- Profile
- Settings
- etc.

Again, reuse existing functionality.

### Sidebar UX

The grouping should make the sidebar:

- Easier to scan
- Less visually crowded
- More hierarchical
- More predictable
- Less distracting

Use subtle group labels and spacing.

Do not over-design the grouping.

The sidebar should still feel like a premium modern SaaS product.

---

# 4. CREATE A DEDICATED AI ROUTE

Create a complete dedicated route for:

**AI Study / Chat with AI**

Follow the existing routing conventions in the repository.

Do not invent a new routing pattern.

This route should be treated as a **focused AI workspace**, not merely another dashboard page.

The user should be able to:

- Start a conversation with AI
- Continue previous conversations
- Create a new AI session
- Select a study t
- Select the desired AI response format
- Switch between Learning and Assessment
- Start an assessment
- View assessment history/results

The experience should feel cohesive rather than like multiple unrelated features.

---

# 5. CHAT WITH AI

The AI Study route should support a dedicated:

**Chat with AI**

experience.

The user should be able to ask questions about the currently selected study material/topic.

The chat interface should use the **existing AI chat implementation** wherever possible.

Do not create a second chat system if one already exists.

Improve the existing implementation instead.

---

# 6. AI RESPONSE UX

Improve the presentation of AI responses.

The AI response should be:

- Easy to scan
- Well spaced
- Structured
- Comfortable to read
- Optimized for studying

Support appropriate formatting such as:

- Headings
- Subheadings
- Paragraphs
- Bullet points
- Numbered lists
- Code/math where already supported
- Important concepts
- Examples
- Key takeaways

Avoid making every response look like a giant wall of text.

Where appropriate, visually distinguish:

**Key Concept**

**Important**

**Example**

**Remember**

**Summary**

But do not overuse callout boxes.

The AI response should feel like a premium educational assistant, not raw markdown rendered onto the screen.

---

# 7. AI RESPONSE FORMAT

The user should be able to tell AI **how they want the response delivered**.

Provide a response-style selector.

Possible options:

1. Summary
2. Revision Notes
3. Detailed Guide
4. Last-Minute Revision Notes

The selected response style should be clearly visible in the UI.

Example:

**Response style**
`Revision Notes`

The AI should receive this preference as part of the request/session configuration.

Do not hardcode the behavior only in the frontend.

Follow the existing backend/API architecture and pass the selected mode through the appropriate API/service layer.

---

# 8. SELECTED TOPIC CONTEXT

The AI interface should clearly communicate:

**What topic is currently being studied?**

For example:

`Mathematics → Algebra → Quadratic Equations`

The selected topic should be visible near the AI input/header.

The user should never have to guess what context AI is currently using.

The selected topic should be passed to the AI/backend wherever the existing architecture supports contextual AI requests.

Do not rely solely on frontend display state.

---

# 9. STUDY MODE DROPDOWN

Improve the existing **Study Mode** dropdown.

The dropdown should always clearly show the user's currently selected mode.

Example:

**Study Mode**
`Learning`

or

**Study Mode**
`Assessment`

When the user changes the mode:

- Update the visible selected value immediately.
- Update the relevant UI.
- Preserve the existing mode-switching architecture.
- Do not duplicate state unnecessarily.

The selected state should be visually obvious.

Use the existing dropdown/menu component conventions in the project.

---

# 10. LEARNING MODE

Learning mode should focus on conversational studying.

The user should be able to:

- Ask questions
- Request explanations
- Ask for examples
- Request summaries
- Generate revision notes
- Ask follow-up questions
- Continue the same conversation

The interface should feel like a personal AI tutor.

---

# 11. ASSESSMENT MODE

Assessment mode should support four assessment types:

### 1. MCQs

Multiple-choice questions.

### 2. Flashcards

Recall-based learning.

### 3. Short Questions

Open-ended short-answer questions.

### 4. Mock Exam

A combined assessment containing:

- MCQs
- Short Questions
- Flashcards

These should be implemented as a **coherent assessment system**, not four completely separate experiences.

Reuse shared components wherever possible.

---

# 12. ASSESSMENT MODE SELECTOR

Create a premium assessment-type selector.

The user should be able to easily switch between:

- MCQs
- Flashcards
- Short Questions
- Mock Exam

Each option should communicate its purpose using:

- Icon
- Name
- Short description where useful
- Selected state

Do not make the interface visually crowded.

Use progressive disclosure.

---

# 13. MCQ CONFIGURATION

When MCQs are selected, ask:

**How many questions?**

Provide sensible presets.

For example:

- 5
- 10
- 20
- 30
- Custom

Allow custom values if the existing architecture supports it.

Show useful context:

`20 questions · ~15 min`

The primary CTA should communicate the exact action:

**Start 20 MCQs**

---

# 14. FLASHCARD CONFIGURATION

When Flashcards are selected:

**How many flashcards?**

Presets:

- 10
- 20
- 30
- 50
- Custom

Show an estimated duration if this can be calculated reliably.

CTA:

**Start 20 Flashcards**

---

# 15. SHORT QUESTION CONFIGURATION

When Short Questions are selected:

**How many questions?**

Presets:

- 5
- 10
- 15
- 20
- Custom

CTA should dynamically communicate the selected amount.

Example:

**Start 10 Questions**

---

# 16. MOCK EXAM CONFIGURATION

Mock Exam requires a different configuration experience.

The user must configure:

### MCQs

Number of MCQs

### Short Questions

Number of short questions

### Flashcards

Number of flashcards

Example:

```text
Mock Exam

MCQs                 10
Short Questions       5
Flashcards           10

────────────────────────

25 questions
~25 min

[ Start Mock Exam ]
```

The total should update dynamically.

Do not ask the user for one generic question count.

Make it obvious that these components form **one mock exam**.

---

# 17. ASSESSMENT INTERFACE

After configuration, take the user into the appropriate assessment interface.

Each assessment type should have a dedicated, polished UI while sharing common assessment infrastructure.

Common elements:

- Progress indicator
- Question number
- Total count
- Current question
- Answer area
- Navigation
- Previous/Next where appropriate
- Completion state
- Loading state
- Error state

The user should always understand:

**What am I answering?**

**How far am I?**

**What should I do next?**

---

# 18. MCQ UI

Create a premium MCQ experience.

Structure:

- Question
- Optional supporting context
- Answer choices
- Clear selected state
- Next action
- Progress

Answer choices should have strong interaction states:

- Default
- Hover
- Selected
- Correct
- Incorrect
- Disabled

Do not reveal correct/incorrect feedback prematurely if the intended assessment flow is designed to reveal it after submission.

Follow the existing product logic.

---

# 19. FLASHCARD UI

Create a focused flashcard experience.

Prioritize:

- Question/front
- Reveal interaction
- Answer/back
- Progress
- Previous/next
- Completion

The card should feel tactile and premium.

Avoid unnecessary animation.

---

# 20. SHORT QUESTION UI

The user should receive:

- Question
- Optional context
- Large answer input
- Character/input feedback if useful
- Submit action

After submission, use the existing AI assessment logic to evaluate the answer.

Do not build a completely separate AI evaluation architecture.

Reuse existing services where possible.

---

# 21. MOCK EXAM UI

Mock Exam should feel more serious than the individual modes.

Show:

- Exam title
- Overall progress
- Current section/type
- Question
- Answer interface
- Remaining questions
- Optional timer if supported

Clearly indicate transitions between:

**MCQ → Short Question → Flashcard**

without making the user feel like they have entered three separate applications.

---

# 22. CONVERSATION HISTORY

The AI Study experience must support viewing previous conversations.

Add a conversation/history section using the existing application patterns.

Users should be able to identify sessions easily.

Each conversation should have useful metadata such as:

- Conversation title
- Topic
- Mode
- Last activity
- Assessment type where applicable

Do not show unnecessary metadata.

Prioritize scanability.

---

# 23. NEW AI SESSION

Provide a clear action:

**New Session**

When clicked:

- Create/reset the appropriate conversation state.
- Start a fresh AI session.
- Do not accidentally overwrite the existing conversation.
- Preserve previous sessions in history.

Follow the existing persistence architecture.

If conversations are persisted on the backend, create/use the appropriate backend endpoint rather than maintaining everything only in frontend state.

---

# 24. AUTO-FOCUS AI INPUT

After the AI finishes generating a response:

**Automatically focus the AI chat input.**

This should allow the user to immediately continue the conversation without manually clicking the input.

Important:

- Do not steal focus while the AI is still generating.
- Focus only after the response has completed.
- Do not break keyboard navigation.
- Do not repeatedly trigger focus because of unrelated React renders.
- Handle route/session changes safely.

Use React refs/effects according to the project's existing patterns.

---

# 25. FULL-STACK AI IMPLEMENTATION

This is not only a UI task.

Deliver the complete full-stack AI feature.

That means implementing whatever is required across:

### Frontend

- Routes
- Components
- State
- API calls
- Loading states
- Error handling
- UI states

### Backend

- Routes/controllers
- Services
- AI integration
- Validation
- Persistence
- Conversation/session handling
- Assessment generation
- Assessment submission/evaluation

### Database

Only introduce schema/model/migration changes where actually required.

Follow the existing ORM/model/migration conventions.

Do not redesign the existing database architecture unnecessarily.

---

# 26. API / BACKEND RULES

Follow the existing backend structure exactly.

If the project already has:

- Controllers
- Services
- Routes
- Validators
- Middleware
- AI service abstraction
- Error handlers

reuse them.

Do not put business logic directly inside route handlers if the existing architecture separates it.

Do not put backend logic into frontend components.

Maintain clear separation of concerns.

---

# 27. VALIDATION

Validate all user-controlled assessment configuration.

Examples:

- Question counts must be valid.
- Negative values must not be accepted.
- Zero should only be allowed if explicitly supported.
- Custom values should respect reasonable limits.
- Mock exam totals should be validated.
- Required topic/context must be validated where necessary.

Use the project's existing validation library/pattern.

Do not introduce another validation solution.

---

# 28. LOADING / ERROR / EMPTY STATES

Every async interaction should have intentional states.

Include appropriate UX for:

- AI generating
- Conversation loading
- Conversation history loading
- Assessment generation
- Assessment submission
- Failed AI response
- Failed assessment generation
- Empty conversation history
- Empty state for unavailable topics

Never leave the user staring at a blank screen.

---

# 29. DAY ASSIGNMENT UI

There is already a calendar design for assigning study days.

Do NOT redesign the calendar from scratch.

Improve the **visual interaction for assigning days**.

The experience should make it extremely clear:

- Which days are selected
- Which days are available
- Which days contain assigned topics
- Which day is currently being edited
- How the topic/subtopic relates to the selected day

Prioritize visual clarity over adding more controls.

The calendar should feel lightweight and easy to manipulate.

---

# 30. DAY ASSIGNMENT UX

The interaction should ideally communicate:

**Topic**

→ **Subtopic**

→ **Assigned days**

The user should immediately understand the relationship between the content and schedule.

Use visual hierarchy rather than adding extra explanatory text.

Do not create duplicate rows for information that can already be represented inside the existing calendar/topic structure.

Reuse the current calendar implementation.

---

# 31. DESIGN SYSTEM

Follow the application's existing design system.

Do not introduce random styling.

Maintain consistency for:

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Buttons
- Inputs
- Dropdowns
- Tabs
- Cards
- Modals
- Icons

Use existing components wherever available.

If the application uses Mantine, Shadcn, Tailwind, Lucide, etc., follow the existing implementation rather than mixing multiple approaches.

---

# 32. VISUAL QUALITY

The final UI should feel like a serious, well-funded SaaS product.

Target:

**Linear × Perplexity × modern premium education software**

Prioritize:

- Strong spacing
- Excellent hierarchy
- Minimal cognitive load
- Clear states
- Fast interactions
- Consistent components
- Subtle animations
- Excellent typography
- Clean responsive behavior

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Neon effects
- Decorative clutter
- Giant empty spaces
- Generic AI-dashboard layouts
- Excessive rounded cards
- Too many competing CTAs

The product should look premium because of **design discipline**, not decoration.

---

# 33. RESPONSIVE UX

Everything must work across:

- Desktop
- Laptop
- Tablet
- Mobile

Do not simply scale down desktop components.

Define intentional responsive behavior.

For example:

- Sidebar collapses appropriately.
- Conversation history becomes a drawer on smaller screens.
- Assessment controls remain accessible.
- AI input remains prominent.
- Configuration cards stack naturally.
- No horizontal overflow.

---

# 34. ACCESSIBILITY

Maintain good accessibility practices.

Ensure:

- Keyboard navigation
- Visible focus states
- Appropriate button semantics
- Accessible labels
- Reasonable contrast
- Screen-reader-friendly controls
- No interaction dependent only on color

Do not sacrifice accessibility for visual polish.

---

# 35. PERFORMANCE

Avoid unnecessary re-renders.

Pay particular attention to:

- AI streaming/generation
- Conversation history
- Assessment state
- Large conversation messages
- Calendar interactions
- Auto-focus behavior

Use the project's existing data-fetching and caching patterns.

Do not add premature optimization or unnecessary abstractions.

---

# 36. CODE QUALITY

Write code that looks like it belongs in the existing repository.

Follow:

- Existing naming conventions
- Existing file organization
- Existing component conventions
- Existing TypeScript patterns
- Existing API patterns
- Existing error-handling patterns
- Existing import conventions

Prefer small reusable components over giant components.

But do NOT over-engineer simple UI.

Create abstractions only when there is a real reuse case.

---

# 37. IMPLEMENTATION PROCESS

Follow this process strictly.

### Phase 1 — Inspect

First inspect the repository and understand:

- Architecture
- Routes
- Sidebar
- AI implementation
- Assessment implementation
- Calendar
- Backend
- Database
- Existing reusable components

### Phase 2 — Plan

Identify:

- What already exists
- What can be reused
- What must be modified
- What must be created
- What backend changes are required
- What database changes are required

Do not implement duplicate functionality.

### Phase 3 — Implement

Implement incrementally.

Start with the underlying architecture/data flow where required, then build the UI on top of it.

### Phase 4 — Integrate

Connect:

Frontend → API → Backend → AI → Database

where required.

Do not mock functionality that is expected to be real.

### Phase 5 — Validate

Test:

- Existing flows
- New AI route
- New session
- Conversation history
- Learning mode
- Assessment mode
- All four assessment types
- Assessment configuration
- Mock exam
- AI responses
- Auto-focus
- Loading states
- Error states
- Responsive layouts
- Calendar/day assignment

---

# 38. IMPORTANT — DO NOT FAKE COMPLETION

Do not claim a feature is complete if only the UI exists.

If a feature requires backend support, implement the backend.

If it requires persistence, implement persistence.

If it requires an API, connect the API.

If something genuinely cannot be implemented because the repository is missing required infrastructure, clearly identify the blocker rather than creating fake/mock behavior.

---

# 39. FINAL ACCEPTANCE CRITERIA

The feature is complete only when:

- Sidebar navigation is logically grouped into Learning, Community, and Account.
- A dedicated AI Study route exists.
- Users can chat with AI.
- AI responses have improved study-friendly UX.
- Users can select the study topic/context.
- Users can select AI response style.
- Study Mode clearly displays the selected mode.
- Learning mode works with the existing AI architecture.
- Assessment mode supports MCQs.
- Assessment mode supports Flashcards.
- Assessment mode supports Short Questions.
- Assessment mode supports Mock Exam.
- MCQs support configurable question counts.
- Flashcards support configurable counts.
- Short Questions support configurable counts.
- Mock Exam supports independent counts for each question type.
- Users can create new AI sessions.
- Users can view previous conversations/history.
- AI input automatically focuses after AI response generation completes.
- Loading, empty, error, and success states are handled.
- AI functionality is connected end-to-end.
- Existing application functionality is not broken.
- Calendar/day assignment visuals are improved without unnecessarily replacing the existing calendar.
- The implementation follows the repository's existing code patterns.
- No unnecessary libraries or architectural patterns are introduced.
- The final interface feels cohesive with the existing Lurniva product.

---

# NON-NEGOTIABLE INSTRUCTION

**Do not code based only on this prompt.**

First inspect the existing codebase.

Understand the existing implementation.

Then extend it.

**The repository is the source of truth.**

When there is a conflict between your preferred implementation and an established project pattern, **follow the established project pattern.**

The objective is not to create an impressive isolated demo.

The objective is to ship a **real, maintainable, full-stack feature that looks and behaves as though it was built by the existing Lurniva engineering and product team.**
