# LuminaLib (LibOS) — Architecture, Design System & UI Component Specification

> Comprehensive technical documentation for the **LuminaLib Frontend Application**, built on Next.js 16, React 19, Redux Toolkit, and Tailwind CSS v4.

---

## Table of Contents

1. [Executive Summary & Brief Understanding](#1-executive-summary--brief-understanding)
   - [Core Purpose & Value Proposition](#core-purpose--value-proposition)
   - [Role-Based Access Control (RBAC) Architecture](#role-based-access-control-rbac-architecture)
   - [Core Functional Workflows](#core-functional-workflows)
   - [Technology Stack Matrix](#technology-stack-matrix)
2. [Overall Project Structure](#2-overall-project-structure)
   - [Directory Tree](#directory-tree)
   - [Directory & File Descriptions](#directory--file-descriptions)
   - [Key Configuration Files](#key-configuration-files)
3. [Design System & Visual Language](#3-design-system--visual-language)
   - [Design Philosophy](#design-philosophy)
   - [Color Palette & Semantic Tokens](#color-palette--semantic-tokens)
   - [Typography System](#typography-system)
   - [Elevation, Radii, & Glassmorphism](#elevation-radii--glassmorphism)
   - [Micro-Interactions & Animation Patterns](#micro-interactions--animation-patterns)
   - [Dark Mode Architecture](#dark-mode-architecture)
4. [UI Component Catalog & Deep-Dive Specification](#4-ui-component-catalog--deep-dive-specification)
   - [Foundational UI Primitives](#foundational-ui-primitives)
     - [ConfirmationModal](#confirmationmodal)
     - [ToastProvider](#toastprovider)
   - [Layout & Navigation Components](#layout--navigation-components)
     - [DashboardLayoutShell](#dashboardlayoutshell)
     - [Header](#header)
     - [Sidebar](#sidebar)
     - [RootLayout](#rootlayout)
     - [DashboardLayout](#dashboardlayout)
   - [Administrative Dashboard Components](#administrative-dashboard-components)
     - [BookFormModal](#bookformmodal)
     - [CSVImportModal](#csvimportmodal)
     - [StatsDashboard](#statsdashboard)
     - [SuspensionModal](#suspensionmodal)
   - [User Dashboard & Catalog Components](#user-dashboard--catalog-components)
     - [BookCard](#bookcard)
     - [BookDetailModal](#bookdetailmodal)
     - [UserDashboardClient](#userdashboardclient)
   - [Specialized Sub-Components & Data Views](#specialized-sub-components--data-views)
     - [AdminScopeToggle](#adminscopetoggle)
     - [AdminLedgerTable](#adminledgertable)
     - [UserLedgerList](#userledgerlist)
     - [CharCounter](#charcounter)
   - [Route Pages & Application Views](#route-pages--application-views)
     - [Root Redirector (RootPage)](#root-redirector-rootpage)
     - [Authentication Views (Login, Register, Forgot Password)](#authentication-views-login-register-forgot-password)
     - [Not Found View (404)](#not-found-view-404)
     - [Admin Views (Books, Circulation, Users, Dashboard, Reports, Settings)](#admin-views-books-circulation-users-dashboard-reports-settings)
     - [User Views (Catalog, Borrowed, Fines, Profile)](#user-views-catalog-borrowed-fines-profile)
5. [State Management & Data Architecture](#5-state-management--data-architecture)
   - [Redux Store Composition](#redux-store-composition)
   - [Authentication Slice (`authSlice`)](#authentication-slice-authslice)
   - [Books Slice (`booksSlice`)](#books-slice-booksslice)
   - [Circulation Slice (`circulationSlice`)](#circulation-slice-circulationslice)
   - [Users Slice (`usersSlice`)](#users-slice-usersslice)
   - [HTTP & Interceptor Layer (`api.js`)](#http--interceptor-layer-apijs)
6. [Business Logic, Calculation Engines & Hooks](#6-business-logic-calculation-engines--hooks)
   - [Overdue & Fine Calculation Engine](#overdue--fine-calculation-engine)
   - [Debounced Search Hook (`useSearch`)](#debounced-search-hook-usesearch)
   - [Route Protection & Reverse Guarding (`proxy.js`)](#route-protection--reverse-guarding-proxyjs)
7. [System Workflows & Lifecycle Diagrams](#7-system-workflows--lifecycle-diagrams)
   - [Authentication & Session Routing Flow](#authentication--session-routing-flow)
   - [Circulation & Fine Accrual Lifecycle](#circulation--fine-accrual-lifecycle)
   - [Image Upload & Magic-Byte Verification Sequence](#image-upload--magic-byte-verification-sequence)
   - [User Suspension & Restriction Cycle](#user-suspension--restriction-cycle)

---

## 1. Executive Summary & Brief Understanding

### Core Purpose & Value Proposition
**LuminaLib** (branded as **LibOS** in navigation) is an enterprise-grade, high-performance web application designed for academic libraries, universities, and public institutions. It bridges the operational divide between **Library Administrators** (who manage book acquisitions, multi-channel circulation ledgers, inventory audits, and user clearance statuses) and **Scholars/Patrons** (who explore library catalogs, reserve or borrow assets, track due dates, and monitor financial liabilities).

### Role-Based Access Control (RBAC) Architecture
The system enforces strict boundary isolation between two primary personas:
1. **System Administrator (`admin`)**:
   - Access to global analytic telemetries and circulation statistics.
   - Comprehensive inventory catalog management (Create, Read, Update, Delete).
   - Direct file uploads with client-side magic-byte validation and signed Cloudinary integrations.
   - Bulk inventory onboarding via CSV upload with template scaffolding.
   - Master circulation desk controls: initiate returns, settle cash/digital fines.
   - Full user registry surveillance, with the ability to impose temporal or indefinite account suspensions (with audit reasons and duration doubling for repeat offenses).
2. **Standard Scholar/Patron (`user`)**:
   - Personal reading overview with metrics on active loans, overdue items, return progress, and pending fines.
   - Full catalog discovery with instant debounced search across titles, authors, and keywords.
   - Dynamic category and availability filtering.
   - Interactive book inspection modal with dynamic return-date scheduling.
   - Individual borrowing history and accountability trail.
   - Self-service profile updates (name and contact phone with phone pattern validation).

### Core Functional Workflows
- **Authentication & Secure Cookies**: Authentication tokens and user metadata are stored simultaneously in Redux state and HTTP-accessible secure cookies via `js-cookie`. The application executes pre-render cookie checks in `src/proxy.js` to ensure unauthorized requests never reach protected routes.
- **Accrual Fine Engine**: Overdue books are evaluated daily. The system applies a baseline penalty of **Rs. 20 per day overdue**, computed via `date-fns` calendar comparison.
- **Suspension Enforcement**: When a user is suspended by an administrator, the backend returns a `403` status containing structured `suspensionDetails`. The frontend automatically destroys the active session, redirects to `/login?suspended=true`, and displays an informative banner detailing the suspension reasons, effective dates, and duration.
- **Security-First Media Uploads**: Rather than blindly trusting browser MIME types, the book management engine reads the raw binary header bytes (magic numbers) of uploaded images to verify that a file is genuinely a PNG, JPEG, or WebP before transmitting it to the cloud.

### Technology Stack Matrix

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 16.2.6 | Server-Side Rendering, Client Component Hydration, Route Handling |
| **Runtime / UI** | React / React DOM | 19.2.4 | Concurrent React UI rendering engine |
| **Optimization** | Babel React Compiler | 1.0.0 | Automatic memoization of component trees without manual `useMemo` overhead |
| **Global State** | Redux Toolkit | 2.12.0 | Centralized application state management & async thunks |
| **State Bridge** | React-Redux | 9.3.0 | React bindings for Redux state subscription |
| **Styling** | Tailwind CSS (PostCSS) | v4.0.0+ | Modern tokenized utility-first styling with `@theme inline` |
| **HTTP Client** | Axios | 1.16.1 | REST API communication with request & response interceptor pipelines |
| **Icons** | Lucide React | 1.16.0 | Cohesive, accessible vector iconography |
| **Form Handling** | React Hook Form | 7.76.1 | High-performance uncontrolled form validation and state tracking |
| **Date Processing**| date-fns | 4.4.0 | Immutable calendar and date arithmetic (`differenceInCalendarDays`, `parseISO`) |
| **Data Viz** | Recharts | 2.10.0 | Responsive SVG Area charts, Bar charts, and analytic metrics |
| **Notifications** | React Hot Toast | 2.6.0 | Lightweight, non-blocking toast notifications |
| **Storage / Auth** | js-cookie | 3.0.7 | Secure cookie storage for JWT token, role, and user profiles |

---

## 2. Overall Project Structure

### Directory Tree

```
Library-Management-System-Front_End/
├── .env.local                          # Environment variables (API base URLs, keys)
├── .gitignore                          # Git file exclusion rules
├── eslint.config.mjs                   # ESLint Next.js configuration rules
├── jsconfig.json                       # Module alias path mappings (@/* -> src/*)
├── next.config.mjs                     # Next.js configuration (Remote image domains, compiler flags)
├── package.json                        # Project dependencies, scripts, and engine specifications
├── postcss.config.mjs                  # PostCSS plugins (@tailwindcss/postcss)
├── public/                             # Public static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── src/
    ├── proxy.js                        # Edge middleware / route protection proxy
    ├── app/                            # Next.js App Router root
    │   ├── globals.css                 # Tailwind v4 import & CSS custom variables
    │   ├── layout.js                   # Application root layout with Geist fonts & Redux
    │   ├── not-found.js                # Custom 404 error page with auth-aware actions
    │   ├── page.js                     # Root gateway page; redirects based on auth & role
    │   ├── (auth)/                     # Authentication route group (unauthenticated layout)
    │   │   ├── login/
    │   │   │   └── page.js             # User/Admin login form with suspension handling
    │   │   └── register/
    │   │       └── page.js             # User registration with live password strength meter
    │   ├── forgot-password/
    │   │   └── page.js                 # Password reset instruction dispatcher
    │   └── (dashboard)/                # Protected dashboard route group
    │       ├── layout.js               # Dashboard shell wrapper layout
    │       ├── admin/                  # Administrator restricted workspace
    │       │   ├── books/
    │       │   │   └── page.js         # Inventory table with Add/Edit & CSV import triggers
    │       │   ├── circulation/
    │       │   │   └── page.js         # Master circulation ledger with return & fine desk controls
    │       │   ├── dashboard/
    │       │   │   └── page.js         # Administrative executive telemetry dashboard
    │       │   ├── reports/
    │       │   │   └── page.js         # System reporting & analytics workspace
    │       │   ├── settings/
    │       │   │   └── page.js         # Library configurations & system preferences
    │       │   └── users/
    │       │       └── page.js         # User directory with suspension modal controls
    │       └── user/                   # Scholar/Patron workspace
    │           ├── books/
    │           │   └── page.js         # Catalog browser with debounced search & borrowing modal
    │           ├── borrowed/
    │           │   └── page.js         # Borrowed ledger, admin scope switcher, overdue alerts
    │           ├── dashboard/
    │           │   ├── page.js         # User dashboard SSR wrapper
    │           │   └── UserDashboardClient.jsx # User metric cards & upcoming return monitors
    │           ├── fines/
    │           │   └── page.js         # Liability ledger & overdue fine breakdowns
    │           └── profile/
    │               └── page.js         # Self-service profile settings & contact updates
    ├── components/                     # Reusable React UI component libraries
    │   ├── dashboard/                  # Domain-specific dashboard widgets
    │   │   ├── admin/
    │   │   │   ├── BookFormModal.jsx   # 980+ lines: Book create/update modal with magic-byte image upload
    │   │   │   ├── CSVImportModal.jsx  # Bulk inventory import modal via CSV
    │   │   │   ├── StatsDashboard.jsx  # Recharts area/bar charts & critical alert widgets
    │   │   │   └── SuspensionModal.jsx # Account restriction modal with history & end-date picker
    │   │   └── user/
    │   │       ├── BookCard.jsx        # Catalog item presentation card with availability badges
    │   │       └── BookDetailModal.jsx # Full-detail book modal with return date picker & borrow action
    │   ├── layout/                     # Persistent layout chrome components
    │   │   ├── DashboardLayoutShell.jsx# Collapsible dual-drawer responsive scaffold
    │   │   ├── Header.jsx              # Top bar with search input, notifications, user badge
    │   │   └── Sidebar.jsx             # Role-aware expandable/collapsible vertical navigation
    │   └── ui/                         # Atomic, generic UI elements
    │       ├── ConfirmationModal.jsx   # Generic danger/warning confirmation dialogue
    │       └── ToastProvider.jsx       # react-hot-toast theme & mounting wrapper
    ├── hooks/
    │   └── useSearch.js                # Custom hook for debounced search terms & multi-select filters
    ├── redux/                          # Redux Toolkit application state architecture
    │   ├── ReduxProvider.js            # Client-side React-Redux Provider wrapper
    │   ├── store.js                    # Store configuration registering 4 primary slices
    │   └── slices/
    │       ├── authSlice.js            # Authentication state, token storage, and session clearance
    │       ├── booksSlice.js           # Book inventory state & async CRUD thunks
    │       ├── circulationSlice.js     # Rentals, returns, and fine settlement thunks
    │       └── usersSlice.js           # User directory, suspension mutation, and profile thunks
    ├── services/
    │   └── api.js                      # Axios instance with auth headers & global response interceptors
    └── utils/
        ├── calculations.js             # Overdue day differences and penalty calculations
        └── fineCalculator.js           # Temporal anchor evaluation and fine pool metrics
```

### Directory & File Descriptions

#### 1. Configuration & Root Infrastructure
- [`package.json`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/package.json): Defines dependencies such as Next.js 16, React 19, Redux Toolkit, Axios, date-fns, Recharts, and Tailwind CSS v4. Configures build scripts (`dev`, `build`, `start`, `lint`).
- [`next.config.mjs`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/next.config.mjs): Enables the React Compiler (`reactCompiler: true`) and defines `remotePatterns` for external image hosting (Unsplash, OpenLibrary, and Cloudinary domains).
- [`jsconfig.json`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/jsconfig.json): Establishes the `@/*` path mapping pointing directly to `src/*`, eliminating deep relative imports.
- [`src/proxy.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/proxy.js): Custom route protection layer. Inspects cookies for `token` and `role`. Directs unauthenticated guests to `/login`, prevents non-admin users from accessing `/admin/*`, and redirects authenticated users away from `/login` or `/register` to their respective dashboards.

#### 2. Next.js App Router (`src/app/`)
- [`src/app/globals.css`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/globals.css): Declares `@import "tailwindcss";` and defines inline theme variables (`--color-background`, `--color-foreground`, `--font-sans`, `--font-mono`).
- [`src/app/layout.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/layout.js): Root layout. Injects Google fonts (Geist Sans, Geist Mono), mounts the `ReduxProvider` and `ToastProvider`, and configures standard body styling.
- [`src/app/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/page.js): The entry route `/`. Monitors Redux `auth` state. While loading, displays a pulsing spinner; upon resolution, immediately performs client-side redirection to `/admin/dashboard`, `/user/dashboard`, or `/login`.
- [`src/app/not-found.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/not-found.js): A 404 page featuring glowing radial gradients, contextual back navigation, and conditional redirect buttons based on user authentication status.

#### 3. State Management (`src/redux/`)
- [`src/redux/store.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/redux/store.js): Configures the Redux store with 4 core slice reducers: `auth`, `users`, `books`, and `circulation`.
- [`src/redux/ReduxProvider.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/redux/ReduxProvider.js): Client component wrapping children in `<Provider store={store}>`.

#### 4. Networking & Utilities (`src/services/` & `src/utils/`)
- [`src/services/api.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/services/api.js): Central Axios instance configured with `process.env.NEXT_PUBLIC_API_URL`. Injects bearer tokens from cookies in both browser and server environments. Intercepts `401 Unauthorized` and `403 Forbidden` (suspensions), automatically purging cookies and triggering login redirection.
- [`src/utils/calculations.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/utils/calculations.js): Evaluates difference in calendar days between expected due dates and actual return dates, calculating accrued fines at Rs. 20/day.
- [`src/utils/fineCalculator.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/utils/fineCalculator.js): Evaluates ISO date strings against current calendar time to return `{ daysOverdue, fineAmount }`.

---

## 3. Design System & Visual Language

### Design Philosophy
The visual identity of **LuminaLib** is clean, academic, modern, and data-dense. It balances administrative clarity with an engaging browsing experience for scholars:
- **Clarity & Readability**: Content is prioritized through subtle border separators (`border-slate-200` / `border-slate-800`) and high-contrast typography.
- **Glassmorphism & Depth**: Surfaces utilize soft backdrop blurs (`backdrop-blur-md`, `bg-white/80 dark:bg-slate-900/80`) to provide depth while keeping users grounded in their current context.
- **Accessibility & State Feedback**: Interactive elements feature clear hover, active, focus-visible, and disabled states. Buttons incorporate spinner feedback during async mutations.

### Color Palette & Semantic Tokens

```
Semantic Color Tokens:
├── Primary / Brand:      Blue     [#2563eb (blue-600), #3b82f6 (blue-500), #eff6ff (blue-50)]
├── Positive / Available:  Emerald  [#059669 (emerald-600), #10b981 (emerald-500), #ecfdf5 (emerald-50)]
├── Cautionary / Warning:  Amber    [#d97706 (amber-600), #f59e0b (amber-500), #fffbeb (amber-50)]
├── Critical / Danger:     Red      [#dc2626 (red-600), #ef4444 (red-500), #fef2f2 (red-50)]
├── Administrative Accent: Purple   [#9333ea (purple-600), #f3e8ff (purple-50)]
└── Neutral / Surfaces:    Slate    [slate-50 (light bg) ... slate-900 / slate-950 (dark bg)]
```

#### Detailed Token Mapping

| Token Name | Light Mode Value | Dark Mode Value | Usage / Semantic Role |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `bg-slate-50` (`#f8fafc`) | `dark:bg-slate-950` (`#020617`) | Main application viewport backdrop |
| **Card / Surface** | `bg-white` (`#ffffff`) | `dark:bg-slate-900` (`#0f172a`) | Modals, tables, cards, stat panels |
| **Subtle Fill** | `bg-slate-50` / `bg-slate-100` | `dark:bg-slate-800/50` | Input backgrounds, disabled elements, headers |
| **Border Normal** | `border-slate-200` | `dark:border-slate-800` | Standard component separation lines |
| **Border Accent** | `border-blue-500` | `dark:border-blue-400` | Focus outlines, active nav items |
| **Text Primary** | `text-slate-900` | `dark:text-slate-50` | Page headings, book titles, key metrics |
| **Text Muted** | `text-slate-500` | `dark:text-slate-400` | Subtitles, helper text, author names, timestamps |
| **Brand Accent** | `text-blue-600` / `bg-blue-600`| `dark:text-blue-400` / `dark:bg-blue-600` | Primary action buttons, brand logo, active tabs |
| **Success Badge** | `bg-emerald-50 text-emerald-600` | `dark:bg-emerald-950/30 text-emerald-400` | "Available", "In Stock", "Returned Safely" |
| **Danger Badge** | `bg-red-50 text-red-600` | `dark:bg-red-950/30 text-red-400` | "Overdue", "Suspended Lock", "Out of Stock" |

### Typography System
The typography is driven by Vercel’s **Geist** font family loaded via `next/font/google`:
- **Sans Serif**: `Geist` (bound to `--font-geist-sans`), providing geometric clarity for numerical tables and metadata.
- **Monospace**: `Geist_Mono` (bound to `--font-geist-mono`), used for ISBNs, system keys, and technical IDs.

#### Typographic Hierarchy

```
Heading 1 (Page Title):      text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50
Heading 2 (Section Title):   text-2xl font-bold text-slate-900 dark:text-slate-50
Heading 3 (Card / Modal):    text-xl / text-lg font-bold text-slate-900 dark:text-slate-50
Body Regular:                text-sm text-slate-600 dark:text-slate-300
Body Muted:                  text-sm text-slate-500 dark:text-slate-400
Metadata / Small:            text-xs font-medium text-slate-400
Micro-Badges:                text-[10px] font-bold uppercase tracking-wider
Big Metric Digits:           text-4xl / text-3xl font-extrabold tracking-tight
```

### Elevation, Radii, & Glassmorphism
- **Border Radii**:
  - `rounded-lg` (8px): Inputs, table buttons, dropdown selectors.
  - `rounded-xl` (12px): Standard cards, stat widgets, search toolbars.
  - `rounded-2xl` (16px): Large dialogs, user summary panels, login wrappers.
  - `rounded-3xl` (24px): Metric display tiles in user dashboard.
  - `rounded-full` (9999px): Avatar icons, notification badges, pill indicators.
- **Glassmorphism**:
  - `Header.jsx`: `sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md`
  - Modal Backdrops: `fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm`
  - Book Card Availability Tag: `backdrop-blur-md bg-emerald-500/90 text-white`
- **Shadows**:
  - `shadow-sm`: Basic cards and table wrappers.
  - `shadow-md`: Hovered action cards.
  - `shadow-xl` / `shadow-2xl`: Modals and floating sheets.

### Micro-Interactions & Animation Patterns
- **Hover Transitions**: `transition-all duration-200 ease-in-out` applied across all navigational items, action buttons, and card containers.
- **Scale Effects**: Book cards subtly zoom their cover image on hover: `group-hover:scale-105 transition-transform duration-500`.
- **Entrance Animations**: Modals use Tailwind entry animations: `animate-in fade-in zoom-in-95 duration-200`.
- **Attention Grabbers**: Overdue account warnings feature a pulsing red orb: `w-2 h-2 rounded-full bg-red-500 animate-pulse`.
- **Loading State Indicators**: Asynchronous buttons mount `Loader2` from Lucide: `animate-spin w-4 h-4`.

### Dark Mode Architecture
Dark mode styling uses Tailwind’s `dark:` variant system. The body tag establishes the baseline:
```jsx
<body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
```
All cards, inputs, borders, and textual elements are paired with their inverse dark counterpart (`bg-white dark:bg-slate-900`, `border-slate-200 dark:border-slate-800`, `text-slate-700 dark:text-slate-300`).

---

## 4. UI Component Catalog & Deep-Dive Specification

This section documents all primary and secondary UI components across the codebase.

---

### Foundational UI Primitives

#### `ConfirmationModal`
- **File Path**: [`src/components/ui/ConfirmationModal.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/ui/ConfirmationModal.jsx)
- **Purpose**: A generic, reusable modal dialogue that halts execution until the user explicitly confirms or cancels an action (e.g., logging out, deleting books, or processing loan returns).
- **Props Interface**:
  ```typescript
  interface ConfirmationModalProps {
    isOpen: boolean;            // Controls visibility
    onClose: () => void;        // Triggered when clicking backdrop or Cancel
    onConfirm: () => void;      // Callback invoked upon pressing confirm button
    title: string;              // Dialog header text
    message: string;            // Body descriptive message
    confirmText?: string;       // Text on confirmation button (default: "Confirm")
    cancelText?: string;        // Text on dismissal button (default: "Cancel")
    isDanger?: boolean;         // When true, styles confirm button with red background
  }
  ```
- **Visual Design**: Uses a `bg-slate-900/50 backdrop-blur-sm` overlay and a centered `max-w-md` card with `rounded-xl shadow-xl`. If `isDanger` is true, the button renders `bg-red-600 hover:bg-red-700`, otherwise `bg-indigo-600 hover:bg-indigo-700`.

---

#### `ToastProvider`
- **File Path**: [`src/components/ui/ToastProvider.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/ui/ToastProvider.jsx)
- **Purpose**: A client-side wrapper configuring the global notification toaster powered by `react-hot-toast`.
- **Props**: None (Mounts once at root in `src/app/layout.js`).
- **Configuration**:
  - Position: `top-right`
  - Duration: `4000ms`
  - Custom Styles: Dark charcoal background (`#333`) with white text. Success toasts use `#22c55e` (Emerald), error toasts use `#ef4444` (Red).

---

### Layout & Navigation Components

#### `DashboardLayoutShell`
- **File Path**: [`src/components/layout/DashboardLayoutShell.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/layout/DashboardLayoutShell.jsx)
- **Purpose**: The master structural shell that frames all dashboard views. Coordinates desktop sidebar expansion/collapse and the mobile off-canvas drawer overlay.
- **State Managed**:
  - `isCollapsed` (`boolean`): Toggles desktop sidebar width between 256px (`w-64`) and 80px (`w-20`).
  - `isMobileOpen` (`boolean`): Controls mobile drawer visibility with backdrop overlay (`bg-slate-900/40 backdrop-blur-sm lg:hidden`).
- **Responsive Padding**: The main viewport dynamically adjusts its left padding:
  ```jsx
  className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
    isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
  }`}
  ```

---

#### `Header`
- **File Path**: [`src/components/layout/Header.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/layout/Header.jsx)
- **Purpose**: Sticky navigation header providing global search, notification alerts, mobile menu toggles, and user identity credentials.
- **Props**:
  - `setIsMobileOpen`: Function allowing mobile users to trigger the slide-out navigation menu.
- **Key Features**:
  - **Hydration Safe**: Implements a `hasMounted` state to prevent SSR mismatch when reading user data from cookies/Redux.
  - **Global Search Bar**: Embedded search input with left-aligned `Search` icon.
  - **Activity Ping**: Notification bell icon with a pulsing red alert badge (`span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ping"`).
  - **User Identity Pill**: Displays user name and role in desktop mode, paired with a circular initial avatar (e.g., "A" for Admin).

---

#### `Sidebar`
- **File Path**: [`src/components/layout/Sidebar.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/layout/Sidebar.jsx)
- **Purpose**: Persistent vertical navigation bar with role-aware menu routing, collapse capabilities, and session logout.
- **Props**:
  - `isCollapsed`, `setIsCollapsed`: Desktop width toggle state.
  - `isMobileOpen`, `setIsMobileOpen`: Mobile drawer toggle state.
- **Role-Aware Navigation Matrix**:
  - **Admin Navigation (`role === 'admin'`)**:
    1. Dashboard (`/admin/dashboard` - `LayoutDashboard`)
    2. User Management (`/admin/users` - `Users`)
    3. Book Inventory (`/admin/books` - `Library`)
    4. Circulation (`/admin/circulation` - `ArrowLeftRight`)
    5. Fine Controls (`/admin/fines` - `DollarSign`)
    6. Reports & Stats (`/admin/reports` - `BarChart3`)
    7. Settings (`/admin/settings` - `Settings`)
  - **User Navigation (`role === 'user'`)**:
    1. My Dashboard (`/user/dashboard` - `LayoutDashboard`)
    2. Browse Catalog (`/user/books` - `Library`)
    3. My Borrowed Items (`/user/borrowed` - `ArrowLeftRight`)
    4. Fine Overviews (`/user/fines` - `DollarSign`)
    5. Profile Configuration (`/user/profile` - `Settings`)
- **Integrated Actions**:
  - Expand/Collapse chevron toggle button (`ChevronLeft` / `ChevronRight`).
  - Red-themed Logout trigger that opens a `ConfirmationModal` before clearing cookies and invalidating tokens via `api.post('/auth/logout')`.

---

#### `RootLayout`
- **File Path**: [`src/app/layout.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/layout.js)
- **Purpose**: Topmost HTML document wrapper. Applies Geist Sans and Geist Mono variables, mounts Redux provider and ToastProvider, and sets metadata for "LuminaLib - Advanced Library Management System".

---

#### `DashboardLayout`
- **File Path**: [`src/app/(dashboard)/layout.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/layout.js)
- **Purpose**: Layout wrapper specifically for the `(dashboard)` route group, nesting all child views inside `DashboardLayoutShell`.

---

### Administrative Dashboard Components

#### `BookFormModal`
- **File Path**: [`src/components/dashboard/admin/BookFormModal.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/dashboard/admin/BookFormModal.jsx)
- **Size**: ~980 lines of production-grade code.
- **Purpose**: Comprehensive modal dialog for creating new book titles or modifying existing inventory records.
- **Key Features & Implementation Details**:
  1. **Dual Mode Operation**: Detects whether `book` prop is provided (`isEditing = !!book`). Pre-populates all inputs upon edit mode and resets to defaults on create mode.
  2. **Binary Magic-Byte Image Validation**:
     - Inspects file headers to prevent spoofed file extensions.
     - Supports `PNG` (`89 50 4E 47`), `JPEG` (`FF D8 FF`), and `WEBP` (`RIFF....WEBP`).
     - Rejects files over 4 MB with formatted byte messaging.
  3. **Multi-Channel Media Input**:
     - Traditional file selection via hidden input.
     - Drag-and-drop zone with active dragging indicator (`isDragging`).
     - **Clipboard Paste Listener**: Intercepts `paste` events directly on the modal container to allow pasting images directly from the clipboard.
  4. **Signed Cloudinary Pipeline**: Features upload stages (`idle`, `validating`, `requesting-signature`, `uploading`, `done`, `error`), complete with upload progress percentage and cancellation via `AbortController`.
  5. **Category Tagging**: Multi-selection of categories (`Fiction`, `Non-Fiction`, `Science`, `History`, `Technology`, `Other`) with dynamic tag chips.
  6. **Character Limits & Real-Time Counters**: Uses custom `CharCounter` component for Title (max 200), Author (max 100), and Description (max 1000) with color-shifting visual progress bars.
  7. **Accessibility (a11y)**: ARIA live announcements for screen readers reporting upload stages and file acceptance.

---

#### `CSVImportModal`
- **File Path**: [`src/components/dashboard/admin/CSVImportModal.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/dashboard/admin/CSVImportModal.jsx)
- **Purpose**: Allows administrators to import bulk book inventory via CSV file uploads.
- **Props Interface**:
  ```typescript
  interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
  }
  ```
- **Features**:
  - Drag-and-drop upload zone with dashed border hover styling.
  - Template download hyperlink: `/templates/books-import-template.csv`.
  - Sends a multipart `FormData` payload containing the file to `api.post('/books/bulk-import', formData)`.
  - Provides visual success and error banners.

---

#### `StatsDashboard`
- **File Path**: [`src/components/dashboard/admin/StatsDashboard.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/dashboard/admin/StatsDashboard.jsx)
- **Purpose**: Interactive executive analytics cockpit providing library operational intelligence.
- **Sub-Sections**:
  1. **Key Metric Matrix**: 6 metric tiles (Total Members, Book Catalog, Currently Issued, Overdue Rotations, Pending Fines, System Health) with percentage changes and color-coded icons.
  2. **Circulation Area Chart**: Visualizes monthly checkout vs. return volumes using dual-gradient Recharts Area layers (`#3b82f6` for Issued, `#10b981` for Returned).
  3. **High Velocity Titles Bar Chart**: Horizontal bar chart visualizing top-5 most borrowed books with custom bar colors.
  4. **Critical Overdue Risk Register**: Table highlighting severe overdue accounts with borrower identity, late days, and accrued liabilities.
  5. **Depleted Stock Watchlist**: Identifies low-stock items (0 copies or 1-2 copies remaining) with category badges and restock actions.

---

#### `SuspensionModal`
- **File Path**: [`src/components/dashboard/admin/SuspensionModal.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/dashboard/admin/SuspensionModal.jsx)
- **Purpose**: Administrative interface to suspend or restore user account access.
- **Props**:
  - `isOpen`: Modal visibility state.
  - `onClose`: Dismissal handler.
  - `user`: Target user object containing suspension state and history.
  - `onConfirm`: Callback passing `{ suspensionReason, suspensionEndDate }`.
  - `isProcessing`: Indicates pending network mutation.
- **Features**:
  - **Dynamic Mode**: Toggles between "Suspend User Access" (Destructive / Red) and "Restore User Access" (Positive / Emerald).
  - **Previous Suspension Audit**: If the user has prior suspensions, lists all historical reasons. Displays a warning that repeated infractions double the suspension duration.
  - **Temporal Controls**: Datetime-local picker allowing administrators to define an exact expiration timestamp or leave blank for an indefinite ban. Minimum selectable time is restricted to tomorrow.

---

### User Dashboard & Catalog Components

#### `BookCard`
- **File Path**: [`src/components/dashboard/user/BookCard.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/dashboard/user/BookCard.jsx)
- **Purpose**: Visual presentation tile displaying catalog book items in a responsive grid.
- **Props**:
  - `book`: Book data object (title, author, category, rating, available copies, total copies, image source).
  - `onClick`: Triggers the opening of the `BookDetailModal`.
- **Visual Features**:
  - Fixed-height cover container (192px) with `next/image` object-cover styling and zoom-on-hover effect.
  - Fallback icon badge if no cover image URL is available.
  - Glassmorphic availability badge in top-right corner: `Available` (Emerald) vs. `Out of Stock` (Red).
  - Star rating with amber filled star icon.
  - Line-clamping for title and author to prevent card height irregularities.
  - Footer displaying available copy counter (`X of Y copies`).

---

#### `BookDetailModal`
- **File Path**: [`src/components/dashboard/user/BookDetailModal.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/dashboard/user/BookDetailModal.jsx)
- **Purpose**: Deep inspection modal enabling users to read book synopses, verify publisher metadata, and initiate borrow requests.
- **Props**:
  - `book`: The active book record.
  - `isOpen`: Modal visibility toggle.
  - `onClose`: Dismissal callback.
  - `onBorrowed`: Optional callback to notify parent pages of inventory decrement.
- **Borrowing Logic**:
  - Default loan period is initialized to 15 days (`addDays(new Date(), 15)`).
  - Date input enforces minimum date as today.
  - Displays dynamic calculations: loan period duration and Rs. 20/day overdue rate notice.
  - Dispatches `borrowBook({ bookId, returnDate })` with ISO string payload.
  - Includes a secondary `ConfirmationModal` before issuing the final API transaction.

---

#### `UserDashboardClient`
- **File Path**: [`src/app/(dashboard)/user/dashboard/UserDashboardClient.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/dashboard/UserDashboardClient.jsx)
- **Purpose**: Client-side dashboard home for students and scholars.
- **Metrics Calculated**:
  1. **Active Loans**: Count of books currently checked out.
  2. **Overdue Items**: Count of books whose due date has passed.
  3. **Outstanding Fines**: Cumulative monetary liability across returned unpaid fines and active overdue books.
  4. **Return Progress**: Percentage ratio of successfully returned items against all-time borrows.
- **Upcoming Returns Grid**: Displays the top-4 closest due items with remaining days counter or overdue warning alerts.

---

### Specialized Sub-Components & Data Views

#### `AdminScopeToggle`
- **Location**: [`src/app/(dashboard)/user/borrowed/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/borrowed/page.js#L197-L226)
- **Purpose**: Contextual pill switch visible exclusively to administrators accessing the circulation ledger, allowing them to toggle between "All Records" (global library ledger) and "My Borrowed" (personal account history).

#### `AdminLedgerTable`
- **Location**: [`src/app/(dashboard)/user/borrowed/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/borrowed/page.js#L319-L428)
- **Purpose**: Data table presenting circulation records with direct operational controls: "Process Return" (clears loan) and "Clear Fine" (settles outstanding monetary liabilities).

#### `UserLedgerList`
- **Location**: [`src/app/(dashboard)/user/borrowed/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/borrowed/page.js#L231-L314)
- **Purpose**: Patron-friendly list view detailing borrowed assets, due dates, return statuses, and accrued fines.

#### `CharCounter`
- **Location**: [`src/components/dashboard/admin/BookFormModal.jsx`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/components/dashboard/admin/BookFormModal.jsx#L158-L175)
- **Purpose**: Character limit tracker featuring tabular number displays and dynamic progress bars that change from blue to amber at 85% capacity, and red when exceeding the limit.

---

### Route Pages & Application Views

| Route | File Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | [`src/app/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/page.js) | Public | Evaluates auth state and performs instant role-based redirection. |
| `/login` | [`src/app/(auth)/login/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28auth%29/login/page.js) | Public | Sign-in form with email/password validation, password reveal toggle, remember me, and suspension alert handling. |
| `/register` | [`src/app/(auth)/register/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28auth%29/register/page.js) | Public | Account registration featuring real-time 4-point password strength meter and phone format validation. |
| `/forgot-password`| [`src/app/forgot-password/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/forgot-password/page.js) | Public | Self-service password recovery email submission. |
| `/*` (404) | [`src/app/not-found.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/not-found.js) | Public | Context-aware 404 page redirecting back to user/admin dashboard. |
| `/admin/dashboard`| [`src/app/(dashboard)/admin/dashboard/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/admin/dashboard/page.js) | Admin Only | Mounts `StatsDashboard` with charts, metrics, and risk registers. |
| `/admin/books` | [`src/app/(dashboard)/admin/books/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/admin/books/page.js) | Admin Only | Full book inventory table with edit/delete actions, search filtering, and CSV bulk import trigger. |
| `/admin/circulation`| [`src/app/(dashboard)/admin/circulation/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/admin/circulation/page.js) | Admin Only | Master circulation desk monitoring borrowings, returns, and fine payments. |
| `/admin/users` | [`src/app/(dashboard)/admin/users/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/admin/users/page.js) | Admin Only | User directory table with role indicators and suspension/restoration actions. |
| `/admin/reports` | [`src/app/(dashboard)/admin/reports/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/admin/reports/page.js) | Admin Only | Placeholder for specialized exportable reports and audit archives. |
| `/admin/settings` | [`src/app/(dashboard)/admin/settings/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/admin/settings/page.js) | Admin Only | Administrative system parameters and preferences. |
| `/user/dashboard` | [`src/app/(dashboard)/user/dashboard/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/dashboard/page.js) | User / Admin | Patron home showing active rentals, overdue alerts, and upcoming returns. |
| `/user/books` | [`src/app/(dashboard)/user/books/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/books/page.js) | User / Admin | Catalog browsing page with debounced search, category filters, and card grid. |
| `/user/borrowed` | [`src/app/(dashboard)/user/borrowed/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/borrowed/page.js) | User / Admin | Borrowing accountability ledger with admin scope toggle. |
| `/user/fines` | [`src/app/(dashboard)/user/fines/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/fines/page.js) | User / Admin | Financial ledger detailing outstanding balances and settled penalties. |
| `/user/profile` | [`src/app/(dashboard)/user/profile/page.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/app/%28dashboard%29/user/profile/page.js) | User / Admin | Self-service contact update form with automatic profile synchronization. |

---

## 5. State Management & Data Architecture

The application uses **Redux Toolkit** (`@reduxjs/toolkit`) for global client state, organized into four specialized slices.

```
Redux Store (store.js)
├── auth:        authSlice.js        -> User profile, token, auth status, session clearance
├── books:       booksSlice.js       -> Catalog inventory items, loading flags, CRUD mutations
├── circulation: circulationSlice.js -> Borrow records, return events, fine settlement
└── users:       usersSlice.js       -> User directory list, account suspension state
```

### Authentication Slice (`authSlice`)
- **File**: [`src/redux/slices/authSlice.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/redux/slices/authSlice.js)
- **State Structure**:
  ```javascript
  {
    user: Object | null,            // Populated from Cookies.get('user') on initialization
    isAuthenticated: boolean,       // Derived from !!Cookies.get('token')
    loading: boolean,
    error: string | null
  }
  ```
- **Actions**:
  - `authStart`: Sets loading state, clears errors.
  - `authSuccess`: Commits user object and token into Redux and writes `token`, `role`, and `user` to browser cookies with `{ secure: true }`.
  - `authFailure`: Sets error string, resets loading.
  - `logout`: Destroys state, purges all auth cookies, and redirects the browser to `/login`.

### Books Slice (`booksSlice`)
- **File**: [`src/redux/slices/booksSlice.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/redux/slices/booksSlice.js)
- **State Structure**:
  ```javascript
  {
    items: Book[],                  // Array of catalog items
    total: number,                  // Total count
    loading: boolean,               // Fetch spinner toggle
    actionLoading: boolean,         // Create/Update/Delete spinner toggle
    error: string | null
  }
  ```
- **Async Thunks**:
  - `fetchBooks(params)`: Calls `GET /books?search=...&category=...`
  - `addBook(bookData)`: Calls `POST /books`; unshifts the returned record to `items`.
  - `updateBook({ id, data })`: Calls `PUT /books/:id`; updates matching record in-place.
  - `deleteBook(id)`: Calls `DELETE /books/:id`; filters deleted item out of `items`.

### Circulation Slice (`circulationSlice`)
- **File**: [`src/redux/slices/circulationSlice.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/redux/slices/circulationSlice.js)
- **State Structure**:
  ```javascript
  {
    records: CirculationRecord[],   // Rental ledger records
    loading: boolean,
    actionLoading: boolean,
    error: string | null
  }
  ```
- **Async Thunks**:
  - `fetchCirculationRecords(role)`: Directs to `GET /circulation/admin/all` (for admins) or `GET /circulation/history` (for users).
  - `borrowBook({ bookId, returnDate })`: Dispatches `POST /borrow/borrow`; prepends the new loan to `records`.
  - `processBookReturn({ recordId, remarks })`: Calls `POST /circulation/return/:recordId`; updates status to `returned`.
  - `collectFinePayment(recordId)`: Calls `PUT /circulation/pay-fine/:recordId`; marks fine as paid.

### Users Slice (`usersSlice`)
- **File**: [`src/redux/slices/usersSlice.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/redux/slices/usersSlice.js)
- **State Structure**:
  ```javascript
  {
    list: User[],                   // Directory of registered users
    loading: boolean,
    actionLoading: boolean,
    error: string | null
  }
  ```
- **Async Thunks**:
  - `fetchAllUsers()`: Calls `GET /users`.
  - `toggleUserSuspension({ userId, isSuspended, suspensionReason, suspensionEndDate })`: Calls `PUT /users/:userId/suspend` and updates user state in `list`.
  - `updateSelfProfile(profileData)`: Calls `PUT /users/profile/update` to save self-service user edits.

### HTTP & Interceptor Layer (`api.js`)
- **File**: [`src/services/api.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/services/api.js)
- **Request Interceptor**: Extracts the `token` cookie dynamically. If running in a client context, reads via `js-cookie`; if in SSR, extracts via `next/headers`. Automatically appends `Authorization: Bearer <token>`.
- **Response Interceptor**:
  - On `401 Unauthorized`: Logs session expiration (except on auth routes).
  - On `403 Forbidden` with `suspensionDetails`: Immediately wipes all auth cookies (`token`, `role`, `user`) and hard-redirects the browser to `/login?suspended=true`.

---

## 6. Business Logic, Calculation Engines & Hooks

### Overdue & Fine Calculation Engine
- **Files**:
  - [`src/utils/calculations.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/utils/calculations.js)
  - [`src/utils/fineCalculator.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/utils/fineCalculator.js)
- **Mathematical Formula**:
  $$\text{Days Overdue} = \max\left(0, \, \text{differenceInCalendarDays}(\text{comparativeDate}, \, \text{dueDate})\right)$$
  $$\text{Fine Amount} = \text{Days Overdue} \times 20 \text{ PKR/INR}$$
- **Comparative Anchor**:
  - If the book has already been checked in (`actualReturnDate` is present), the calculation checks `actualReturnDate` against `dueDate`.
  - If the loan is still active, it evaluates the current calendar day (`new Date()`) against `dueDate`.

### Debounced Search Hook (`useSearch`)
- **File**: [`src/hooks/useSearch.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/hooks/useSearch.js)
- **Purpose**: Prevents excessive API calls during real-time typing in catalog searches.
- **Signature**: `useSearch(delay = 500)`
- **Returns**:
  - `searchTerm`, `setSearchTerm`: Raw immediate string bound to input element.
  - `filters`, `setFilters`: Immediate filter state (`category`, `status`).
  - `debouncedSearchTerm`: Updated only after `delay` milliseconds of inactivity.
  - `debouncedFilters`: Debounced category/status state.

### Route Protection & Reverse Guarding (`proxy.js`)
- **File**: [`src/proxy.js`](file:///d:/WORK%20SPACE/Library%20Management%20System/Library-Management-System-Front_End/src/proxy.js)
- **Matching Scope**: `matcher: ['/admin/:path*', '/user/:path*', '/login', '/register']`
- **Rule Pipeline**:
  1. **Unauthenticated Redirect**: Any attempt to access `/admin/*` or `/user/*` without a valid `token` cookie redirects to `/login`.
  2. **Role Enforcement**: Accessing `/admin/*` with `userRole !== 'admin'` redirects to `/unauthorized`.
  3. **Reverse Guarding**: Authenticated users visiting `/login` or `/register` are redirected to `/admin/dashboard` or `/user/dashboard` based on their role.

---

## 7. System Workflows & Lifecycle Diagrams

### Authentication & Session Routing Flow

```
[ Incoming Request / Navigation ]
               │
               ▼
   [ src/proxy.js Check ]
   Does request contain 'token' cookie?
       ├── NO ──► Is route /admin/* or /user/* ?
       │             ├── YES ──► Redirect to /login
       │             └── NO  ──► Allow Next.js rendering
       │
       └── YES ─► Is route /login or /register?
                     ├── YES ──► Redirect to target dashboard (/admin or /user)
                     └── NO  ──► Is route /admin/* and role !== 'admin'?
                                   ├── YES ──► Redirect to /unauthorized
                                   └── NO  ──► Allow protected page rendering
```

---

### Circulation & Fine Accrual Lifecycle

```
[ User Selects Book in Catalog ]
               │
               ▼
[ BookDetailModal Opens ] ──► User picks return date (Default: +15 days)
               │
               ▼
[ User Confirms Borrow ] ──► Dispatches borrowBook thunk
               │
               ▼
[ Backend Creates Record ] ──► Status: "borrowed", Stock decremented by 1
               │
               ▼
  [ Time Passes / Book in Possession ]
               │
               ├── Before Due Date: Status remains "borrowed", fine = 0
               │
               └── Past Due Date:
                     │
                     ▼
       [ Overdue Math Evaluated ]
       Days Overdue = differenceInCalendarDays(today, dueDate)
       Fine Pool = Days Overdue * Rs. 20 / day
                     │
                     ▼
  [ Book Returned at Admin Desk ]
         ├── Book returned, fine settled simultaneously
         │     └── Record: status = "returned", finePaid = true
         │
         └── Book returned, fine remains unpaid
               └── Record: status = "returned", finePaid = false
                     └── User remains liable until Admin executes "Clear Fine"
```

---

### Image Upload & Magic-Byte Verification Sequence

```
[ User Drops / Pastes File in BookFormModal ]
                     │
                     ▼
       [ Stage: File Inspection ]
       Size <= 4MB? Extension in [png, jpg, jpeg, webp]?
                     ├── NO ──► Reject with user-friendly error
                     └── YES
                           │
                           ▼
          [ Read First 16 Bytes (FileReader) ]
          Match binary signature with MAGIC_BYTES?
                     ├── NO ──► Reject: "File content does not match declared extension"
                     └── YES
                           │
                           ▼
          [ Request Cloudinary Signature ]
          api.post('/books/upload-signature')
                           │
                           ▼
          [ Direct Cloudinary Upload via Axios ]
          Tracks onUploadProgress (0% -> 100%)
                           │
                           ▼
          [ Save Secure Asset URL into Form ]
          Form ready to submit new/updated book
```

---

### User Suspension & Restriction Cycle

```
[ Admin Opens User Directory (/admin/users) ]
                     │
                     ▼
[ Click "Impose Lock" ] ──► [ SuspensionModal Mounted ]
                     │
                     ▼
Admin enters Reason & optional End Date
                     │
                     ▼
[ Submit Suspension ] ──► Dispatches toggleUserSuspension thunk
                     │
                     ▼
Backend sets isSuspended = true, records audit reasons
                     │
                     ▼
[ When Suspended User Next Interacts / Logs In ]:
  - Login Request: Backend returns 403 with `suspensionDetails`
  - Active Session: api.js response interceptor catches 403
  - All cookies cleared; User redirected to /login?suspended=true
  - Red suspension warning banner displays reasons and duration
```

---

## 8. Summary & Architectural Highlights

1. **Modern Foundation**: Next.js 16 App Router paired with React 19 and the Babel React Compiler provides automatic render optimization without cluttering component code with manual memoization wrappers.
2. **Unified Styling Engine**: Built on Tailwind CSS v4 using PostCSS, utilizing `@theme inline` custom variables, dark mode variants, and responsive drawer layouts.
3. **Robust Security & Data Integrity**: Includes binary magic-byte image validation, cookie-based token synchronization, and proxy route protection.
4. **Cohesive Component Architecture**: Reusable UI components (`ConfirmationModal`, `BookCard`, `BookDetailModal`, `StatsDashboard`) maintain clean separation of concerns and consistent styling across all user and administrative views.
