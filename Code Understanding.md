# Code Understanding

This document provides an overview of the codebase structure and key functionalities of the Learn More platform, intended to facilitate code demonstration and assessment.

## 1. Project Structure Overview

The project is a full-stack application built with Next.js, utilizing TypeScript, React for the frontend, and Prisma with PostgreSQL for the database.

*   **`/src/app`**: Contains the main application code, structured following Next.js App Router conventions.
    *   **Page Routes**: Subdirectories like `/`, `/courses`, `/dashboard`, `/educator`, `/admin`, `/profile`, `/playground`, etc., correspond directly to the application's URLs. Each typically contains a `page.tsx` file defining the page component.
    *   **`/api`**: Holds the backend API routes, organized by resource (e.g., `auth`, `courses`, `subscriptions`, `admin`). These routes handle data fetching, business logic, and database interactions.
*   **`/src/components`**: Contains reusable UI components used across different pages (e.g., Layouts, Buttons, Modals, CodeEditor).
*   **`/src/lib`**:Contains utility functions, database connection logic (Prisma client), and authentication helpers.
*   **`/prisma`**: Contains the Prisma schema (`schema.prisma`) defining the database models and migrations.

## 2. Core Concepts & Data Models

Based on `prisma/schema.prisma`.

*   **`User`**:
    *   Represents a user in the system.
    *   Fields: `id` (Int, PK), `email` (String, unique), `password` (String, hashed), `name` (String), `role` (Enum `UserRole`, default `STUDENT`), `avatar` (String, optional URL), `createdAt`, `updatedAt`.
    *   `UserRole` Enum: `STUDENT`, `EDUCATOR`, `ADMIN`.
    *   Relations:
        *   One-to-Many with `Course` (as author, `createdCourses`).
        *   One-to-Many with `UserCourse` (enrollments).
        *   One-to-Many with `Subscription`.
        *   One-to-Many with `Exercise` (exercises created by the user).
        *   One-to-Many with `Solution` (solutions submitted by the user).

*   **`Course`**:
    *   Represents an online course.
    *   Fields: `id` (Int, PK), `title` (String), `description` (String), `imageUrl` (String), `category` (String), `isPublic` (Boolean, default `false`), `createdAt`, `updatedAt`, `authorId` (Int, FK to `User`).
    *   Relations:
        *   Many-to-One with `User` (author).
        *   One-to-Many with `Section`.
        *   One-to-Many with `UserCourse` (enrollments).
        *   One-to-Many with `Lesson` (direct relation, possibly for lessons not belonging to a section, or redundancy?).

*   **`Section`**:
    *   Represents a chapter or module within a `Course`.
    *   Fields: `id` (Int, PK), `title` (String), `order` (Int, for ordering within course, default 0), `createdAt`, `updatedAt`, `courseId` (Int, FK to `Course`).
    *   Relations:
        *   Many-to-One with `Course` (`onDelete: Cascade` - deleting a course deletes its sections).
        *   One-to-Many with `Lesson`.

*   **`Lesson`**:
    *   Represents an individual lesson within a `Section`.
    *   Fields: `id` (Int, PK), `title` (String), `content` (String, optional, default ""), `order` (Int, for ordering within section), `createdAt`, `updatedAt`, `sectionId` (Int, FK to `Section`), `courseId` (Int, optional FK to `Course`).
    *   Relations:
        *   Many-to-One with `Section` (`onDelete: Cascade` - deleting a section deletes its lessons).
        *   Many-to-One with `Course` (optional, `onDelete: SetNull` - deleting a course sets lesson's `courseId` to null).

*   **`UserCourse`**:
    *   **Join Table** tracking user enrollments and progress in courses (Many-to-Many relationship between `User` and `Course`).
    *   Fields: `id` (Int, PK), `userId` (Int, FK to `User`), `courseId` (Int, FK to `Course`), `progress` (Int, percentage, default 0), `completedLessons` (Int, count, default 0), `completedLessonIds` (String, **stores JSON array of completed Lesson IDs**), `enrolledAt`, `updatedAt`.
    *   Constraints: `@@unique([userId, courseId])` - a user can only enroll in a course once.
    *   Relations:
        *   Many-to-One with `User`.
        *   Many-to-One with `Course`.

*   **`Subscription`**:
    *   Represents a user's subscription status.
    *   Fields: `id` (Int, PK), `userId` (Int, FK to `User`), `plan` (Enum `SubscriptionPlan`), `status` (Enum `SubscriptionStatus`, default `ACTIVE`), `startDate`, `endDate` (optional), `price` (Float), `billingCycle` (String - e.g., "monthly"), `features` (String, JSON), `isArchived` (Boolean, default `false`), `createdAt`, `updatedAt`.
    *   `SubscriptionPlan` Enum: `BASIC`, `STANDARD`, `PREMIUM`, `ENTERPRISE`.
    *   `SubscriptionStatus` Enum: `ACTIVE`, `PENDING`, `CANCELLED`, `EXPIRED`.
    *   Relations:
        *   Many-to-One with `User`.

*   **`Exercise`**:
    *   Represents a programming exercise (potentially used in lessons or a separate exercise area).
    *   Fields: `id` (String, UUID PK), `userId` (Int, FK to `User` - creator of the exercise), `title` (String), `description` (String, Text), `language` (String), `difficulty` (String), `category` (String, optional), `initialCode` (String, Text), `testCases` (String, **stores JSON array of test cases**), `createdAt`, `updatedAt`.
    *   Relations:
        *   Many-to-One with `User` (creator, `onDelete: Cascade`).
        *   One-to-Many with `Solution`.

*   **`Solution`**:
    *   Represents a user's submitted solution to an `Exercise`.
    *   Fields: `id` (String, UUID PK), `userId` (Int, FK to `User`), `exerciseId` (String, FK to `Exercise`), `code` (String, Text), `passed` (Boolean, default `false`), `createdAt`, `updatedAt`.
    *   Relations:
        *   Many-to-One with `User` (submitter, `onDelete: Cascade`).
        *   Many-to-One with `Exercise` (`onDelete: Cascade`).

## 3. Key Feature Implementation Examples

*(This section will detail the code flow for specific features, linking frontend components to backend API calls and database interactions.)*

### 3.1 Authentication Flow (Login, Signup, Session)

Handles user registration, login (including GitHub OAuth), session management, and logout.

**Key Files:**

*   Frontend Pages: `src/app/login/page.tsx`, `src/app/signup/page.tsx`
*   Frontend Logic: `src/utils/auth.ts`, `src/utils/api.ts`
*   Backend API Routes: `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/github/...` (presumed)
*   Backend Logic/Utils: `src/lib/auth.ts`, `src/lib/prisma.ts`

**Flow:**

1.  **Signup (`/signup`):**
    *   User submits the registration form (`signup/page.tsx`).
    *   Frontend validation (required fields, password match/length, terms agreement).
    *   `src/utils/auth.ts` -> `register()` function called.
    *   POST request sent to `/api/auth/register` via `src/utils/api.ts`.
    *   Backend (`api/auth/register/route.ts`):
        *   Validates input (required, email format, password length).
        *   Checks if email already exists using Prisma (`lib/prisma.ts`).
        *   Hashes the password (`lib/auth.ts` -> `hashPassword`).
        *   Creates a new `User` in the database (PostgreSQL via Prisma).
        *   Generates a JWT (`lib/auth.ts` -> `generateToken`).
        *   Sanitizes user data (`lib/auth.ts` -> `sanitizeUser`).
        *   Returns JSON `{ user, token }`.
    *   Frontend (`utils/auth.ts` -> `handleAuthResponse`):
        *   Stores sanitized `user` object in `localStorage`.
        *   Dispatches `AUTH_CHANGE_EVENT` to update UI state.
        *   Redirects user (e.g., to `/dashboard`).

2.  **Login (`/login`):**
    *   User submits the login form (`login/page.tsx`).
    *   Frontend validation (required fields).
    *   `src/utils/auth.ts` -> `login()` function called.
    *   POST request sent to `/api/auth/login`.
    *   Backend (`api/auth/login/route.ts`):
        *   Validates input.
        *   Finds user by email using Prisma.
        *   Verifies password using `lib/auth.ts` -> `verifyPassword`.
        *   If valid:
            *   Generates JWT (`generateToken`).
            *   Sanitizes user data (`sanitizeUser`).
            *   **Sets the JWT as an `HttpOnly`, `Secure` cookie in the response headers.**
            *   Returns JSON `{ user }` (token is *not* in the body).
    *   Frontend (`utils/auth.ts` -> `handleAuthResponse`):
        *   Stores sanitized `user` object in `localStorage`.
        *   Dispatches `AUTH_CHANGE_EVENT`.
        *   Redirects user.

3.  **GitHub Login (`/login`):**
    *   User clicks "Continue with GitHub" (`login/page.tsx`).
    *   `src/utils/auth.ts` -> `handleGitHubLogin()` redirects the browser to `/api/auth/github`.
    *   Backend (`/api/auth/github/route.ts` - presumed): Redirects to GitHub OAuth consent screen.
    *   GitHub redirects back to `/api/auth/github/callback` (presumed) with an authorization code.
    *   Backend (`/api/auth/github/callback/route.ts` - presumed):
        *   Exchanges the code for a GitHub access token.
        *   Fetches user profile from GitHub.
        *   Finds or creates a local `User` linked to the GitHub profile.
        *   Generates JWT, sets the `HttpOnly` cookie, and returns sanitized user data (similar to standard login).
        *   Likely redirects the browser back to the frontend (e.g., `/dashboard`).

4.  **Session Management:**
    *   User authentication state is primarily managed by the `HttpOnly` cookie containing the JWT, automatically sent by the browser with subsequent requests to the backend.
    *   Frontend relies on `localStorage` (`user` object) for quick UI updates and initial checks via `utils/auth.ts` (`getCurrentUser`, `isAuthenticated`).
    *   Backend API routes verify the JWT from the cookie to authenticate requests.

5.  **Logout:**
    *   Triggered typically by a UI element (e.g., button in Header).
    *   Calls `src/utils/auth.ts` -> `logout()`.
    *   Removes the `user` object from `localStorage`.
    *   Dispatches `AUTH_CHANGE_EVENT` to update UI.
    *   **Note:** This frontend-only logout does *not* invalidate the `HttpOnly` cookie on the backend/browser side immediately. A backend logout endpoint would be needed for that. The cookie expires based on its `maxAge`.

### 3.2 Course Browsing and Viewing

Allows users (guests and students) to browse publicly available courses and view the details of a specific course.

**Key Files:**

*   Frontend Pages: `src/app/courses/page.tsx` (Course Market), `src/app/course/[id]/page.tsx` (Course Detail)
*   Frontend Logic: `src/utils/api.ts`
*   Backend API Routes:
    *   `src/app/api/courses/route.ts` (Handles `GET /api/courses` for fetching course lists)
    *   **Presumed Backend Logic for `GET /api/courses/{id}`**: (Actual file path TBD - needs investigation) Handles fetching detailed information for a single course.
    *   `src/app/api/courses/[id]/enroll/route.ts`: Handles course enrollment.
    *   `src/app/api/courses/[id]/complete-lesson/route.ts` (or similar): Handles marking lessons as complete.
*   Backend Logic/Utils: `src/lib/prisma.ts`, `src/lib/auth.ts`

**Flow:**

1.  **Course Market (`/courses`):**
    *   `courses/page.tsx` mounts.
    *   `useEffect` hook triggers `fetchCourses`.
    *   Frontend calls `GET /api/courses` using `src/utils/api.ts`. **No specific `context` param is sent for public browsing.**
    *   Backend (`api/courses/route.ts` -> `GET` handler):
        *   Detects no specific `context` or the user is a guest/student.
        *   Fetches all courses where `isPublic: true` from the database using Prisma (`prisma.course.findMany`).
        *   Includes basic author info (`author: { select: { name } }`) and lesson count (`_count: { select: { lessons } }`).
        *   Formats the data (title, description, imageUrl, category, author name, lesson count, etc.).
        *   Returns the list of public courses as JSON.
    *   Frontend (`courses/page.tsx`):
        *   Receives the course list, updates state (`setCourses`).
        *   Renders the course grid using `CourseCard` components.
        *   Provides search (`searchTerm`) and category filtering (`filter`) options, which operate on the fetched client-side data (`filteredCourses`).
        *   Each `CourseCard` links to `/course/[id]`.

2.  **Course Detail (`/course/[id]`):**
    *   `course/[id]/page.tsx` mounts.
    *   Retrieves the `id` from URL parameters (`useParams`).
    *   `useEffect` hook triggers `fetchCourseData`.
    *   Frontend calls **`GET /api/courses/{id}`** (e.g., `GET /api/courses/123`) using `src/utils/api.ts`.
    *   **Backend (Presumed Logic for `GET /api/courses/{id}`):**
        *   Extracts the `courseId` from the request parameters.
        *   Fetches the specific course from the database using Prisma (`prisma.course.findUnique` or `findFirst`) where `id` matches.
        *   **Crucially, includes related data:** Sections, Lessons within Sections, Author details.
        *   Performs authorization checks:
            *   Is the course `isPublic`?
            *   If not public, is the current user (`getUserFromRequest`) the author OR enrolled in the course? (Requires checking `UserCourse` relation).
            *   If unauthorized, returns a 403 or 404 error.
        *   If authorized, checks if the current user is enrolled (`UserCourse`) and calculates progress (`progress`, `completedLessons`).
        *   Determines if the current user is the author.
        *   Formats the detailed course data, including sections, lessons (with completion status for enrolled users), author info, enrollment status (`isEnrolled`), author status (`isAuthor`), progress, etc.
        *   Returns the detailed course data as JSON.
    *   Frontend (`course/[id]/page.tsx`):
        *   Receives the detailed course data, updates state (`setCourse`).
        *   Renders the course layout: Header with title/description/image, author info, enrollment button (if applicable), sections and lesson list.
        *   Displays current lesson content based on `currentLessonIndex`.
        *   Allows enrolled users to mark lessons as complete (calls a separate API, likely `POST /api/courses/{id}/complete-lesson`).
        *   Provides a "Share" option (QR code generation).
        *   Handles potential errors (e.g., course not found, permission denied).

3.  **Enrollment (from Course Detail page):**
    *   User clicks the "Enroll" button (`course/[id]/page.tsx`).
    *   `handleEnroll` function is called.
    *   Frontend sends `POST /api/courses/{id}/enroll` using `src/utils/api.ts`.
    *   Backend (`api/courses/[id]/enroll/route.ts`):
        *   Authenticates the user (`getUserFromRequest`).
        *   Finds the course (`prisma.course.findUnique`).
        *   Checks if the user is already enrolled (`prisma.userCourse.findFirst`).
        *   If not enrolled, creates a `UserCourse` record linking the user and course, initializing progress to 0.
        *   Returns success or already enrolled message.
    *   Frontend updates the UI (`setCourse` state to reflect `isEnrolled: true`).

### 3.3 Course Creation and Editing (Educator)

Allows users with the `EDUCATOR` role to create new courses and manage their existing ones.

**Key Files:**

*   Frontend Pages: `src/app/create/page.tsx` (Create Course Wizard), `src/app/course/[id]/edit/page.tsx` (Edit Course Settings)
*   Frontend Logic: `src/utils/api.ts`, `src/components/UserAuthProvider.tsx` (or similar for user context)
*   Backend API Routes:
    *   `src/app/api/auth/me/route.ts`: Used by `/create` to verify user role.
    *   `src/app/api/courses/route.ts`: Handles `POST /api/courses` for initial course creation (basic info).
    *   **Presumed Backend Logic for `GET /api/courses/{id}`**: (File path TBD) Fetches course details for editing, performs author check.
    *   **Presumed Backend Logic for `PUT /api/courses/{id}`**: (File path TBD) Handles updating course metadata (title, description, category, image, isPublic).
    *   **Presumed Backend Logic for `DELETE /api/courses/{id}`**: (File path TBD) Handles deleting a course.
    *   `src/app/api/courses/[id]/publish/route.ts` & `unpublish/route.ts` (or similar): Likely handle changing the `isPublic` status from the edit page settings tab.
    *   **Presumed Backend Logic for Creating Structure**: (File path TBD, possibly part of `