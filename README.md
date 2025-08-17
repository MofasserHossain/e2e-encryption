# Next.js Boilerplate Template

A modern, production-ready Next.js boilerplate with a complete development workflow setup including Husky, Commitlint, ESLint, Prettier, and shadcn/ui components.

> **Repository**: [https://github.com/MofasserHossain/next-husky-commitlint-eslint-prettier-boilerplate](https://github.com/MofasserHossain/next-husky-commitlint-eslint-prettier-boilerplate)

## ✨ Features

- **🚀 Next.js 15** with App Router and Turbopack
- **🔧 Development Workflow** with Husky, Commitlint, and Lint-staged
- **📝 Code Quality** with ESLint and Prettier
- **🎨 UI Components** with shadcn/ui and Tailwind CSS
- **🌙 Theme Support** with next-themes
- **📱 Responsive Design** with mobile-first approach
- **⚡ Performance** optimized with modern tooling

## 📦 Package Information

**Package Name**: `next-husky-commitlint-eslint-prettier-boilerplate`

**Keywords**: nextjs, boilerplate, husky, commitlint, eslint, prettier, shadcn/ui

**Author**: [Mofasser Hossain](https://github.com/MofasserHossain)

**License**: MIT

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.11.1
- pnpm >= 9.15.0

### Installation

```bash
# Clone the repository
git clone https://github.com/MofasserHossain/next-husky-commitlint-eslint-prettier-boilerplate
cd next-husky-commitlint-eslint-prettier-boilerplate

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

**Alternative**: You can also use this as a template directly from GitHub by clicking the "Use this template" button on the repository page.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Development Workflow

This project uses a streamlined development workflow with automated tools:

### Interactive Commit Command

Use the interactive commit command to easily create conventional commit messages:

```bash
# Full command
pnpm run commit
```

The interactive commit tool will:

1. **Select commit type** from predefined options (feat, fix, docs, style, etc.)
2. **Select commit scope** from predefined options (setup, config, feature, bug, etc.)
3. **Enter commit description** for your changes
4. **Optionally add commit body and footer** for more detailed commits
5. **Automatically stage and commit** your changes

### Example Commit Messages

- `feat(feature): add user authentication system`
- `fix(bug): resolve login form validation issue`
- `docs(setup): update project documentation`
- `style(refactor): improve code formatting and structure`
- `chore(deps): update dependencies to latest versions`

### Automated Workflow

- **Pre-commit**: Automatically formats code and runs linting on staged files
- **Commit-msg**: Validates commit messages follow conventional commit format
- **Code Quality**: ESLint and Prettier ensure consistent code style

## ⚙️ Configuration Files

### Package Manager

- **pnpm** is the primary package manager
- Lock file: `pnpm-lock.yaml`
- Engine requirements specified in `package.json`

### Package Metadata

- **Name**: `next-husky-commitlint-eslint-prettier-boilerplate`
- **Description**: Comprehensive Next.js boilerplate with development tools
- **Keywords**: Optimized for discoverability on npm and GitHub
- **Author**: Mofasser Hossain with GitHub profile link
- **License**: MIT License
- **Repository**: Direct links to GitHub repository and homepage

### Scripts

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "lint:staged": "lint-staged",
  "format": "prettier . --write",
  "format:check": "prettier . --check",
  "commit": "node scripts/commit.mjs",
  "prepare": "husky"
}
```

## 📚 Dependencies Overview

### Production Dependencies

- **Next.js 15.4.6** with React 19.1.0
- **shadcn/ui Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS utilities and merge functions
- **Theme**: Next-themes for dark/light mode support
- **Development Tools**: Husky and Lint-staged for workflow automation

### Development Dependencies

- **Code Quality**: ESLint 9, Prettier, TypeScript 5
- **Commit Standards**: Commitlint with conventional commit rules
- **Build Tools**: PostCSS, Autoprefixer, Tailwind CSS
- **Type Safety**: Comprehensive TypeScript types for all packages

## 🔧 Tool Configurations

### 1. Husky - Git Hooks

**Files**: `.husky/pre-commit`, `.husky/commit-msg`

**Pre-commit Hook**:

```bash
pnpm run lint:staged --concurrent false
```

**Commit-msg Hook**:

```bash
npx --no -- commitlint --edit $1
```

**Setup**:

```bash
npx husky init
chmod +x .husky/pre-commit .husky/commit-msg
```

### 2. Commitlint - Conventional Commits

**File**: `commitlint.config.ts`

**Features**:

- Enforces conventional commit format
- 11 commit types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- 13 commit scopes: setup, config, deps, feature, bug, docs, style, refactor, test, build, ci, release, other

## Installation

Simply install the dependencies:

```bash
pnpm install
```

## Adding shadcn/ui Components

To add more components from shadcn/ui:

```bash
pnpm dlx shadcn@latest add [component-name]
```

**Examples:**

```bash
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
```

## Commit Instructions

This project uses conventional commits. You have two ways to commit:

### Option 1: Interactive Commit (Recommended)

Use the interactive commit script for easy conventional commit creation:

```bash
pnpm commit
```

This will guide you through:

1. Selecting commit type (feat, fix, docs, etc.)
2. Choosing commit scope (setup, config, feature, etc.)
3. Writing commit description
4. Adding optional commit body and footer

### Option 2: Manual Commit

Follow this format manually:

```bash
git commit -m "type(scope): description"
```

**Available Types:**

- `feat`: ✨ New feature
- `fix`: 🐛 Bug fix
- `docs`: 📚 Documentation changes
- `style`: 💄 Code style changes (formatting, etc.)
- `refactor`: ♻️ Code refactoring
- `perf`: ⚡ Performance improvements
- `test`: 🧪 Adding or updating tests
- `build`: 🔨 Build system or dependency changes
- `ci`: 👷 CI/CD configuration changes
- `chore`: 🔧 Other changes (maintenance)
- `revert`: ⏪ Revert previous commit

**Available Scopes:**

- `setup`, `config`, `deps`, `feature`, `bug`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `release`, `other`

**Examples:**

```bash
git commit -m "feat(auth): add login functionality"
git commit -m "fix(nav): resolve mobile menu issue"
git commit -m "docs(readme): update installation guide"
```

## Commit and Push to Repository

After making your changes, commit and push to the repository:

```bash
# Stage all changes
git add .

# Commit with conventional format
git commit -m "type(scope): description"

# Push to remote repository
git push origin main
```

**Quick Example:**

```bash
git add .
git commit -m "fix(readme): update commit instructions"
git push origin main
```

**Note:** Replace `main` with your branch name if you're working on a different branch.

## 🎯 What's Included

This boilerplate comes with everything you need to start building modern Next.js applications:

- **🚀 Next.js 15** with App Router and Turbopack for fast development
- **🔧 Complete Development Workflow** with Git hooks and automated tools
- **🎨 Modern UI Components** with shadcn/ui and Tailwind CSS
- **🌙 Theme System** with next-themes for dark/light mode
- **📱 Responsive Design** with mobile-first approach
- **⚡ Performance Optimized** with modern tooling and best practices
- **🔒 Type Safety** with comprehensive TypeScript configuration
- **📝 Code Quality** with ESLint, Prettier, and automated formatting

## 📁 Project Structure

```
next-husky-commitlint-eslint-prettier-boilerplate/
├── .husky/                 # Git hooks
├── .next/                  # Next.js build output
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
├── src/
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── theme/        # Theme components
│   │   └── layout/       # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── styles/           # Global styles
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── .lintstagedrc.json    # Lint-staged configuration
├── commitlint.config.ts  # Commitlint configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Available Commands

### Development Commands

```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
```

### Code Quality Commands

```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
```

### Git Workflow Commands

```bash
pnpm commit           # Interactive commit message generator
pnpm run lint:staged  # Run linters on staged files
```

### Setup Commands

```bash
pnpm prepare          # Setup Husky git hooks
```

## 📋 Package.json Highlights

The `package.json` has been optimized for:

- **📦 Clear Package Identity**: Descriptive name and comprehensive description
- **🔍 Discoverability**: Strategic keywords for npm and GitHub search
- **👤 Author Information**: Professional author details with GitHub profile
- **📄 Licensing**: MIT License for maximum adoption
- **🔗 Repository Links**: Direct links to source code and homepage
- **⚙️ Engine Requirements**: Clear Node.js and pnpm version requirements
- **📚 Dependencies**: Well-organized production and development dependencies

## 🔄 Git Workflow

1. **Make Changes**: Edit your code
2. **Stage Files**: `git add .` or use specific files
3. **Interactive Commit**: `pnpm run commit`
4. **Automatic Checks**:
   - Pre-commit: Code formatting and linting
   - Commit-msg: Conventional commit validation
5. **Push**: `git push origin main`

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Conventional Commits](https://www.conventionalcommits.org)
- [Husky Documentation](https://typicode.github.io/husky)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Use the interactive commit: `pnpm run commit`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Follow the conventional commit format for any commits

---

**Built with ❤️ using Next.js, Tailwind CSS, and shadcn/ui**
