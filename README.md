# Mentoria

Mentoria is a full-stack application built with React + TypeScript (client) and Node.js + Express + TypeScript + MySQL (server).

## 📋 Table of Contents

- [System Requirements](#-system-requirements)
- [Project Installation](#-project-installation)
- [Running the Project](#️-running-the-project)
- [Git Workflow](#-git-workflow)
- [Pull Request Guidelines](#-pull-request-guidelines)
- [Available Scripts](#-available-scripts)

## 🛠 System Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0
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

### Branch Naming

- `main`: Production branch
- `feature/feature-name`: Feature branches
- `bugfix/bug-description`: Bug fix branches
- `hotfix/issue-description`: Hotfix branches

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

## 🔧 Pull Request Guidelines

### Before Creating PR

1. **Ensure code passes all checks:**

   ```bash
   # Client
   cd client
   npm run lint
   npm run format
   npm run build

   # Server
   cd server
   npm run lint
   npm run format
   npm run build
   ```

2. **Update branch with latest changes:**

   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

### Creating Pull Request

1. **Push branch to remote:**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR with template**

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
npm run dev           # Start development server with nodemon
npm run build         # Build TypeScript to JavaScript
npm run start         # Start production server
npm run debug         # Start server in debug mode
npm run lint          # Check for linting errors
npm run lint:fix      # Fix auto-fixable linting errors
npm run format        # Check code formatting
npm run format:fix    # Auto-format code
```
