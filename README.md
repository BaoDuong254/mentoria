# Mentoria

Mentoria is a full-stack application built with React + TypeScript (client) and Node.js + Express + TypeScript + MySQL (server).

## 📋 Table of Contents

- [System Requirements](#-system-requirements)
- [Project Installation](#-project-installation)
- [Running the Project](#️-running-the-project)
- [Git Workflow](#-git-workflow)
- [Available Scripts](#-available-scripts)

## 🛠 System Requirements

- Node.js >= 22.20.0
- npm >= 11.6.1
- Git

## 🚀 Project Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd mentoria
```

### 2. Install dependencies for root project

```bash
npm install
```

### 3. Install dependencies for client

```bash
cd client
npm install
cd ..
```

### 4. Install dependencies for server

```bash
cd server
npm install
cd ..
```

## 🏃‍♂️ Running the Project

### Development mode

Run client and server in development mode:

```bash
# Terminal 1 - Run server
cd server
npm run dev

# Terminal 2 - Run client
cd client
npm run dev
```

Server will run on `http://localhost:3000`
Client will run on `http://localhost:5173`

### Production build

```bash
# Build client
cd client
npm run build
npm run preview

# Build server
cd server
npm run build
npm run start
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
npm run prepare        # Setup husky hooks
```

### Client

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Check for linting errors
npm run lint:fix      # Fix auto-fixable linting errors
npm run format        # Check code formatting
npm run format:fix    # Auto-format code
```

### Server

```bash
npm run dev            # Start development server with nodemon
npm run build          # Build TypeScript to JavaScript
npm run start          # Start production server
npm run debug          # Start server in debug mode
npm run lint           # Check for linting errors
npm run lint:fix       # Fix auto-fixable linting errors
npm run format         # Check code formatting
npm run format:fix     # Auto-format code
npm run bundle:swagger # Bundle swagger yaml file
npm run seed           # Start mock up data
```
