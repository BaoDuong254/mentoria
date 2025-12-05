# Mentoria

Mentoria is a full-stack application built with React + TypeScript (client) and Node.js + Express + TypeScript + SQL Server (server).

## 📋 Table of Contents

- [System Requirements](#-system-requirements)
- [Project Installation](#-project-installation)
- [Running the Project](#️-running-the-project)
- [Git Workflow](#-git-workflow)
- [Available Scripts](#-available-scripts)

## 🛠 System Requirements

- Node.js >= 24.11.0
- pnpm >= 10.20.0
- Git

### Install pnpm

If you don't have pnpm installed, you can install it using one of the following methods:

**Using npm:**

```bash
npm install -g pnpm
```

For more installation options, visit [pnpm installation guide](https://pnpm.io/installation).

## 🚀 Project Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd mentoria
```

### 2. Install dependencies

The project uses pnpm workspaces. Simply run from the root directory:

```bash
pnpm install
```

This will install all dependencies for root, client, and server automatically.

## 📦 Managing Packages

### Installing packages

**Install package for all workspaces (root):**

```bash
pnpm add <package-name> -w
```

**Install package for specific workspace:**

```bash
# For client
pnpm add <package-name> --filter client

# For server
pnpm add <package-name> --filter server
```

**Install dev dependencies:**

```bash
# For client
pnpm add -D <package-name> --filter client

# For server
pnpm add -D <package-name> --filter server

# For root
pnpm add -D <package-name> -w
```

**Examples:**

```bash
# Install axios for client
pnpm add axios --filter client

# Install express types for server
pnpm add -D @types/express --filter server

# Install husky for root workspace
pnpm add -D husky -w
```

### Removing packages

```bash
# Remove from client
pnpm remove <package-name> --filter client

# Remove from server
pnpm remove <package-name> --filter server

# Remove from root
pnpm remove <package-name> -w
```

### Update packages

```bash
# Update specific package
pnpm update <package-name>

# Update all packages
pnpm update

# Update packages for specific workspace
pnpm update --filter client
```

## 🏃‍♂️ Running the Project

### Development mode

The project uses Turbo for monorepo management. Run both client and server simultaneously:

```bash
# From root directory - runs both client and server in parallel
pnpm dev
```

Or run them separately:

```bash
# Terminal 1 - Run server only
cd server
pnpm dev

# Terminal 2 - Run client only
cd client
pnpm dev
```

Server will run on `http://localhost:3000`
Client will run on `http://localhost:5173`

### Production build

```bash
# Build all packages from root
pnpm build

# Or build individually
cd client
pnpm build
pnpm start       # Preview production build

cd server
pnpm build
pnpm start       # Start production server
```

## 🔧 Testing Stripe Webhooks on Localhost

To test Stripe webhooks in your local development environment, you need to install the **Stripe CLI** and forward incoming webhook events to your local API endpoint.

### Install Stripe CLI

Download and install Stripe CLI from:
[https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

### Start Listening for Webhooks

Run the following command to forward all Stripe webhook events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/pay/webhook
```

After running this command, Stripe CLI will generate a **Webhook Signing Secret**, which you must set in your environment variables:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Test Checkout using Stripe Test Card

Use the following **Stripe test card** to simulate a successful payment inside Stripe Checkout:

| Card Number             | Expiry          | CVC          | ZIP |
| ----------------------- | --------------- | ------------ | --- |
| **4242 4242 4242 4242** | Any future date | Any 3 digits | Any |

Example:

```bash
Card number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 10000
```

## 🔄 Git Workflow

### Commit Message Convention

The project uses [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Formatting changes that don't affect code logic
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding or fixing tests
- `chore`: Build tasks, package manager configs, etc.

**Examples:**

```bash
git commit -m "feat(auth): add user login functionality"
git commit -m "fix(api): resolve user data fetching issue"
git commit -m "docs: update installation guide"
git commit -m "style(client): format code with prettier"
```

### Hooks

The project has built-in git hooks to ensure code quality:

- **pre-commit**: Run lint and format code
- **commit-msg**: Check commit message format

### Branch Naming

- `main`: Production branch
- `feature/feature-name`: For new features
- `bugfix/bug-description`: For bug fixes
- `hotfix/issue-description`: For urgent production issues

### Standard Workflow

1. **Create a new branch**
   Always branch off from the latest version of `main`.

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Work on your feature**
   Make your code changes and commit them using the [Conventional Commits](https://www.conventionalcommits.org/) format:

   ```bash
   git add .
   git commit -m "feat(auth): add login functionality"
   ```

3. **Rebase with the latest main branch**
   Before pushing, make sure your branch is up to date with `main`:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Push your branch to remote**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request (PR)**
   Open a PR to merge your branch into `main` using the project’s PR template.
   Wait for review and approval before merging.

6. **After Merge — Sync and Clean Up**
   Once your PR is merged:

   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/your-feature-name     # delete local branch
   git push origin --delete feature/your-feature-name   # delete remote branch
   ```

## 📜 Available Scripts

### Root level

```bash
pnpm prepare        # Setup husky hooks
pnpm dev            # Run both client and server in development mode (parallel)
pnpm build          # Build both client and server
pnpm start          # Start both client and server (parallel)
pnpm lint           # Run linting for all packages
pnpm lint:fix       # Fix linting errors for all packages
pnpm format         # Check code formatting for all packages
pnpm format:fix     # Auto-format code for all packages
pnpm clean          # Clean build artifacts for all packages
```

### Client

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Preview production build
pnpm lint          # Check for linting errors
pnpm lint:fix      # Fix auto-fixable linting errors
pnpm format        # Check code formatting
pnpm format:fix    # Auto-format code
pnpm clean         # Clean build artifacts
```

### Server

```bash
pnpm dev            # Start development server with nodemon
pnpm build          # Build TypeScript to JavaScript
pnpm start          # Start production server
pnpm debug          # Start server in debug mode
pnpm seed           # Seed database with mock data
pnpm lint           # Check for linting errors
pnpm lint:fix       # Fix auto-fixable linting errors
pnpm format         # Check code formatting
pnpm format:fix     # Auto-format code
pnpm bundle:swagger # Bundle swagger yaml file
pnpm clean          # Clean build artifacts
```
