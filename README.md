This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Setup Guide for Clients

This guide provides step-by-step instructions to set up and run the project on a local development environment.

### Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Node.js**: We recommend using the latest LTS (Long-Term Support) version. You can download it from [nodejs.org](https://nodejs.org/).
*   **pnpm**: This project uses `pnpm` as its package manager. If you don't have `pnpm` installed, follow the installation instructions on the [official pnpm website](https://pnpm.io/installation).
*   **PostgreSQL**: A running PostgreSQL database instance is required. You can download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/). Please ensure your PostgreSQL server is running before proceeding with the database setup steps below.

### Environment Setup

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    If you have received the project files as an archive, extract them to your desired location. If you are cloning from a Git repository, use the following command:
    ```bash
    git clone <YOUR_REPOSITORY_URL_IF_APPLICABLE>
    cd <PROJECT_DIRECTORY>
    ```
    Replace `<PROJECT_DIRECTORY>` with the name of the project folder.

2.  **Install dependencies:**
    Navigate to the project's root directory in your terminal and run:
    ```bash
    pnpm install
    ```
    This will install all the necessary project dependencies.

3.  **Set up environment variables:**
    Create a new file named `.env.development` in the root directory of the project. Copy and paste the following template into this file, then replace the placeholder values with your actual credentials and settings.

    ```env
    # PostgreSQL Database Connection
    # ------------------------------
    # Ensure you have created a PostgreSQL database and a user for this project.
    # Replace YOUR_DB_USER, YOUR_DB_PASSWORD, YOUR_DB_HOST, YOUR_DB_PORT, and YOUR_DB_NAME
    # with your actual PostgreSQL database credentials.
    POSTGRES_PRISMA_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:YOUR_DB_PORT/YOUR_DB_NAME?schema=public"
    POSTGRES_URL_NON_POOLING="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:YOUR_DB_PORT/YOUR_DB_NAME?schema=public"

    # JWT (JSON Web Token) Secret
    # -----------------------------
    # This is a secret key used for signing and verifying authentication tokens.
    # Replace with a long, random, and strong string for security.
    JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY_PLEASE_CHANGE_ME"

    # GitHub OAuth Application Credentials (for development/testing)
    # -----------------------------------------------------------
    # You will need to create your own GitHub OAuth Application for authentication.
    # Go to GitHub -> Settings -> Developer settings -> OAuth Apps -> New OAuth App.
    # - Application name: (e.g., ProjectName Dev)
    # - Homepage URL: http://localhost:3000
    # - Authorization callback URL: http://localhost:3000/api/auth/github/callback
    # After creating the app, GitHub will provide you with a Client ID and Client Secret.
    GITHUB_CLIENT_ID="YOUR_GITHUB_OAUTH_CLIENT_ID"
    GITHUB_CLIENT_SECRET="YOUR_GITHUB_OAUTH_CLIENT_SECRET"

    # Frontend URL
    # ------------
    # The base URL where the frontend of the application will be accessible.
    FRONTEND_URL="http://localhost:3000"

    # Public API URL
    # --------------
    # The base URL for the backend API endpoints. For local development, this is usually
    # the frontend URL followed by /api.
    NEXT_PUBLIC_API_URL="http://localhost:3000/api"
    ```

4.  **Run database migrations:**
    This command sets up the database schema based on the project's Prisma schema definition.
    Ensure your PostgreSQL server is running and the connection details in `.env.development` are correct.
    ```bash
    pnpm prisma migrate dev
    ```
    This command will also typically create the database if it doesn't exist, based on the connection string (behavior might vary slightly depending on PostgreSQL setup).

5.  **Seed the database (optional but recommended for initial setup):**
    This command populates the database with initial data, which can be helpful for development and testing.
    ```bash
    pnpm db:seed
    ```

### Running the Application

Once the environment setup is complete, you can start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to see the application.

The page auto-updates as you edit files in the `app/` directory.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More (For Developers)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel (For Developers)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
