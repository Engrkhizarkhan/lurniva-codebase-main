# Lurniva — Library, Teachers & AI Study Implementation

You are working inside the existing **Lurniva** production codebase.

Implement the requested Library, Teachers, AI Study, and upload UX improvements as **real production features**, not isolated mockups.

## CRITICAL — USE THE DESIGN MCP

Use the **Claude Design MCP** to import and inspect the existing design reference:

`https://api.anthropic.com/v1/design/mcp`

Authenticate through `/design-login`.

Import this project:

`https://claude.ai/design/p/540b12bb-df3c-4bfd-affb-d459cc5a03c7?file=AI+Study+Prep.dc.html`

Use the existing **AI Study Prep** design as the primary visual/UX reference.

Focus especially on:

`Canvas-2.dc.html` — Library UI

Copy/adapt the **Library UI patterns, visual language, spacing, hierarchy, interactions, and component treatment** from the design reference.

Do not blindly copy markup. Recreate the design using the application's existing component/code patterns.

The rest of the functionality described below must be implemented in the existing application.

---

# 1. CODEBASE IS THE SOURCE OF TRUTH

Before coding:

- Inspect the existing architecture.
- Inspect routing.
- Inspect sidebar/navigation.
- Inspect Library implementation.
- Inspect upload implementation.
- Inspect Teachers implementation, if present.
- Inspect existing API/service patterns.
- Inspect hooks.
- Inspect TanStack Query usage.
- Inspect reusable components.
- Inspect TypeScript types.
- Inspect loading/error/empty patterns.
- Inspect authentication patterns.

**Strictly follow existing project conventions.**

Do NOT introduce:

- New UI libraries
- New state-management libraries
- New API patterns
- Duplicate components
- Duplicate hooks
- Duplicate types
- Unnecessary abstractions
- A different folder structure
- A different data-fetching approach

If an existing pattern solves the problem, reuse it.

---

# 2. UI LOGIC MUST NOT LIVE IN COMPONENTS

This is a strict architectural requirement.

**No business/data-fetching logic should live inside UI components.**

UI components should primarily:

- Render data
- Receive props
- Trigger callbacks
- Display loading/error/empty states

Move logic into appropriate:

- Custom hooks
- API functions
- Services
- Utilities

For example:

```text
UI
 ↓
Hook
 ↓
API / Service
 ↓
Backend
```

Do not place API calls, complex state transitions, pagination logic, transformation logic, or business rules directly inside page/UI components.

Follow the existing project's hook architecture.

---

# 3. TEACHERS SECTION

Create/improve the Teachers section where users can browse all available teachers.

The UI should feel consistent with the imported **AI Study Prep / Library** design.

The Teachers section must include:

- Teacher listing
- Teacher avatar
- Teacher name
- Relevant metadata already supported by the backend
- Search/filter only if existing architecture supports it
- Responsive layout

Do not invent unnecessary teacher information.

Use real backend data.

---

# 4. TEACHERS DATA FETCHING

Implement proper full-stack data fetching.

Use **TanStack Query** following the exact patterns already established in the repository.

Create/reuse appropriate:

- API function
- Query hook
- Type/interface

The UI should consume the hook rather than directly calling the API.

Example architecture:

```text
TeachersPage
   ↓
useTeachers()
   ↓
teachersApi
   ↓
Backend endpoint
```

Do not put fetching logic inside `TeachersPage`.

---

# 5. TEACHERS INFINITE SCROLL

Teachers should support an **infinite-scroll experience** using TanStack Query.

Use the project's existing TanStack Query version and conventions.

Requirements:

- Initial loading state
- Proper pagination
- Fetch next page when appropriate
- Prevent duplicate requests
- Loading-more state
- End-of-results state
- Error state
- Empty state

If the backend already uses cursor pagination, preserve it.

If it uses page/offset pagination, follow the existing pattern rather than introducing cursor pagination unnecessarily.

Use the correct TanStack Query infinite-query API for the project's installed version.

Do not implement infinite scroll with ad-hoc manual API calls.

---

# 6. LIBRARY UI

Use the imported **Canvas-2.dc.html / Library UI** as the primary design reference.

Recreate and improve the existing Library UI inside the actual application.

The Library should feel:

- Premium
- Clean
- Organized
- Easy to scan
- Content-focused
- Consistent with Lurniva

Preserve the existing Library functionality.

Improve hierarchy and usability rather than redesigning the product unnecessarily.

---

# 7. LIBRARY STATES

The Library must have intentional states for every asynchronous operation.

Implement proper:

### Loading

Use a **real skeleton UI**, not a spinner-only screen.

Skeletons should match the final content structure.

For example:

- Content card skeleton
- Thumbnail/document skeleton
- Title skeleton
- Metadata skeleton

Avoid layout shifts.

### Empty

Create a helpful empty state explaining that the Library has no content yet.

Include an obvious next action such as:

**Upload Content**

### Error

Show a clear, recoverable error state.

Provide an appropriate action such as:

**Try Again**

Do not expose raw API errors to users.

### Pagination

Library pagination must support the backend's existing pagination model.

Use TanStack Query where it is already the application's standard.

Show appropriate loading-more behavior.

Do not fetch the entire Library at once.

---

# 8. LIBRARY UPLOAD UX

Improve the existing Library content-upload experience.

The upload experience should feel like a premium SaaS workflow.

Support the existing supported content types.

Do not introduce unsupported formats simply for the UI.

The user should clearly understand:

1. What they are uploading
2. What is being processed
3. How much progress has been made
4. Whether processing is complete
5. Whether something failed
6. What they can do next

---

# 9. UPLOAD PROGRESS

While content is uploading/processing, show meaningful progress.

Do not simply display:

> Uploading...

Provide useful system information.

Examples:

> Preparing your file...

> Uploading `biology-notes.pdf`...

> Upload complete. Processing content...

> Extracting text...

> Generating searchable content...

> Almost ready...

Only display processing stages that actually exist in the backend.

**Do not fake progress or fake processing stages.**

If the backend only provides upload progress, represent that honestly.

The UI should distinguish:

**Upload progress**

from

**Content processing status**

when the backend supports both.

---

# 10. UPLOAD STATUS UI

Each uploaded item should have clear states where applicable:

- Queued
- Uploading
- Uploaded
- Processing
- Ready
- Failed

Use subtle status indicators.

The user should be able to understand the state at a glance.

For failures, provide a useful recovery action:

**Retry**

Do not force the user to restart the entire Library workflow unnecessarily.

---

# 11. UPLOAD SYSTEM MESSAGES

Use small contextual system messages during upload/processing.

Examples:

> Your file is securely uploading.

> Upload complete. We're preparing this content for AI study.

> This may take a moment while we process the document.

> Your content is ready to use with AI.

Messages should reassure the user and explain what the system is doing.

Avoid fake technical details.

Avoid overwhelming users with implementation-specific information.

---

# 12. AI STUDY DESIGN REFERENCE

Use the imported **AI Study Prep** design as the reference for:

- AI workspace
- Chat layout
- Study mode controls
- Content hierarchy
- Cards
- Inputs
- Buttons
- Spacing
- Visual states
- Premium interaction patterns

The existing design reference should influence the final product strongly, but the implementation must remain native to the current Lurniva codebase.

---

# 13. EXISTING AI STUDY FUNCTIONALITY

Preserve and extend the previously defined AI Study requirements:

- Dedicated AI Study route
- Chat with AI
- Learning mode
- Assessment mode
- MCQs
- Flashcards
- Short Questions
- Mock Exam
- Conversation history
- New AI sessions
- Selected topic/context
- Response style
- Study Mode dropdown
- AI response UX
- Auto-focus after AI response

Do not rebuild existing functionality if it already exists.

Extend it.

---

# 14. AI RESPONSE UX

Improve AI responses so they feel like a premium educational assistant.

Prioritize:

- Readability
- Strong hierarchy
- Scannability
- Proper spacing
- Structured content
- Clear key takeaways
- Useful educational formatting

Avoid raw markdown-wall presentation.

Reuse the existing markdown/rendering implementation where available.

---

# 15. RESPONSE STYLE

The user should be able to select how AI responds:

- Summary
- Revision Notes
- Detailed Guide
- Last-Minute Revision Notes

The selected response style must be visible in the UI.

Pass it through the existing API/service architecture.

Do not implement this as frontend-only behavior.

---

# 16. SELECTED TOPIC

Clearly show the currently selected topic/context.

Example:

`Mathematics → Algebra → Quadratic Equations`

The topic should be part of the actual AI session/request context wherever supported.

Do not rely only on frontend state.

---

# 17. STUDY MODE

The Study Mode dropdown must always show the current mode:

- Learning
- Assessment

When changed:

- Update the UI immediately
- Update the relevant behavior
- Preserve existing state architecture
- Avoid duplicated state

Follow the existing dropdown implementation.

---

# 18. ASSESSMENT MODES

Support:

1. MCQs
2. Flashcards
3. Short Questions
4. Mock Exam

Use a shared assessment architecture where possible.

Each mode should have polished UI and proper:

- Loading
- Empty
- Error
- Success
- Selected
- Disabled
- Progress
- Completion states

---

# 19. CODE SIZE CONSTRAINT

**Do not exceed the existing project's reasonable code-size conventions.**

Keep implementation concise.

Do not create huge files or giant components.

However, if the existing project convention explicitly requires a feature to remain in **one file**, keep that feature in one file.

Do not split a simple component into numerous unnecessary files.

At the same time, do not sacrifice maintainability merely to artificially reduce line count.

Prioritize:

**existing project convention → readability → maintainability → brevity.**

---

# 20. FULL-STACK REQUIREMENT

Where functionality requires backend support, implement it end-to-end.

Follow the existing architecture:

```text
UI
→ Hook
→ API/Service
→ Controller/Route
→ Service
→ Database
```

Use the application's existing conventions for:

- Authentication
- Validation
- Errors
- Database access
- AI services
- API responses

Do not introduce a parallel architecture.

---

# 21. FINAL QUALITY BAR

The finished implementation should feel like a polished feature from a well-funded SaaS company.

The design reference should provide the visual foundation, while the existing codebase remains the architectural source of truth.

The final experience must have:

- Premium UI
- Strong UX hierarchy
- Real backend integration
- TanStack Query for server state where appropriate
- Proper hooks
- No business logic in UI
- Proper skeleton loading
- Proper empty states
- Proper error states
- Proper pagination/infinite scrolling
- Excellent upload feedback
- Honest system progress information
- Responsive behavior
- No unnecessary dependencies
- No duplicated architecture
- No fake/mock functionality where real functionality is required

**First inspect. Then plan. Then implement.**

Do not start by blindly generating code.

The goal is to **extend the existing Lurniva product**, not create a separate application inside it.
