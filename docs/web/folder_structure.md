# Folder Structure (Hybrid: Routes + Features)

This structure lets you understand of the folder strucutureed used in our /app/web and “where does X live?”

- **URL?** → `routes/`
- **Feature logic?** → `features/<feature>/`
- **Generic UI/util?** → `shared/`

## At a glance

apps/web/src/
routes/ # TanStack Start file-based routes
features/ # Feature logic, components, hooks
shared/ # Cross-feature primitives
app.tsx
router.tsx

## Why hybrid?

- Understand code by feature
  All logic for a feature (components, hooks, data fetching) lives in `features/<feature>`.  
  New devs can open one folder and see “everything about billing” or “everything about reports”.

- Convention-based routing
  Routes live in a single `routes/` folder following TanStack Start conventions.  
  This makes URL → file mapping obvious (`/dashboard/analytics` → `routes/dashboard/analytics.tsx`) without scattering route files across multiple `features/*/routes` folders.

Together, this gives clear feature boundaries and predictable navigation.

## Top-level layout

apps/web/src/
├── routes/ # TanStack Start file-based routing
│ ├── __root.tsx # Root layout
│ ├── index.tsx # /
│ ├── dashboard/
│ │ ├── route.tsx # /dashboard layout
│ │ ├── index.tsx # /dashboard
│ │ └── analytics.tsx# /dashboard/analytics
│ └── auth/
│ ├── login.tsx # /auth/login
│ └── signup.tsx # /auth/signup
│
├── features/ # Feature-based modules
│ ├── dashboard/
│ │ ├── components/ # Dashboard-specific components
│ │ ├── hooks/ # Dashboard-specific hooks
│ │ └── widgets/ # KPI widgets, charts, etc.
│ ├── auth/
│ ├── billing/
│ └── reports/
│
├── shared/ # Cross-feature utilities
│ ├── components/ # Generic UI (tables, forms, pagination)
│ ├── hooks/ # Generic hooks
│ ├── lib/ # Utils, formatters, validators
│ └── types/ # Shared TypeScript types
│
├── app.tsx
└── router.tsx

## How to navigate as a new dev

1. Adding a page?
   - Create/update a file in `routes/` (e.g., `routes/billing/plans.tsx` for `/billing/plans`).
   - Implement UI/logic in `features/billing/` and import it into the route file.

2. Adding feature logic/UI?
   - Work inside `features/<feature>/`:
     - `components/` for UI specific to that feature.
     - `hooks/` for data fetching (TanStack Query) and business logic.
     - `widgets/` for reusable dashboard widgets.

3. Adding a shared component?
   - If used by multiple features, put it in `shared/components/`.
   - If used only in one feature, keep it in that feature’s `components/`.

## Rules of thumb

- Routes = navigation & layout only.  
  They should not contain heavy logic; they import from `features/`.

- Features = business domain.
  Each feature owns its components, hooks, and data logic.

- Shared = truly generic.
  Only put something in `shared/` if multiple features will use it.
