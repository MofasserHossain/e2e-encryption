import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowRight,
  Code2,
  Download,
  GitBranch,
  Github,
  Palette,
  Shield,
  Star,
  Type,
  Zap,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm">
            🚀 Production Ready Boilerplate
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Next.js Boilerplate
            <span className="block text-primary">
              with Complete Dev Workflow
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            A modern, production-ready Next.js 15 boilerplate with Husky,
            Commitlint, ESLint, Prettier, shadcn/ui, and TypeScript. Start
            building professional apps instantly.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group">
              <Download className="mr-2 h-4 w-4" />
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg">
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Everything You Need to Build Fast
            </h2>
            <p className="text-lg text-muted-foreground">
              This boilerplate comes with all the modern tools and best
              practices
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Next.js 15 */}
            <Card className="group transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Next.js 15</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Latest Next.js with App Router, Turbopack, and React 19. Built
                  for performance and developer experience.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Development Workflow */}
            <Card className="group transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                    <GitBranch className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Dev Workflow</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Husky, Commitlint, and Lint-staged for automated code quality
                  and conventional commits.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Code Quality */}
            <Card className="group transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Code Quality</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  ESLint and Prettier configured for consistent code style and
                  best practices.
                </CardDescription>
              </CardContent>
            </Card>

            {/* UI Components */}
            <Card className="group transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
                    <Palette className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>shadcn/ui</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Beautiful, accessible components built with Radix UI and
                  Tailwind CSS.
                </CardDescription>
              </CardContent>
            </Card>

            {/* TypeScript */}
            <Card className="group transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/20">
                    <Type className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle>TypeScript</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Full TypeScript support with strict configuration and
                  comprehensive types.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Styling */}
            <Card className="group transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-pink-100 p-2 dark:bg-pink-900/20">
                    <Code2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle>Tailwind CSS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Utility-first CSS framework with custom design system and
                  animations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Get Started in Minutes</h2>

          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Quick Installation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border bg-background p-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Clone the repository
                  </p>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    git clone
                    https://github.com/MofasserHossain/next-husky-commitlint-eslint-prettier-boilerplate
                  </code>
                </div>

                <div className="rounded-lg border bg-background p-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Install dependencies
                  </p>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    cd next-husky-commitlint-eslint-prettier-boilerplate && pnpm
                    install
                  </code>
                </div>

                <div className="rounded-lg border bg-background p-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Start development
                  </p>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    pnpm dev
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">15+</div>
              <p className="text-muted-foreground">Development Tools</p>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">100%</div>
              <p className="text-muted-foreground">TypeScript Coverage</p>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">0</div>
              <p className="text-muted-foreground">Configuration Needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Build Something Amazing?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join developers who are already using this boilerplate to ship
            faster and better code.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group">
              <Star className="mr-2 h-4 w-4" />
              Star on GitHub
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Built with ❤️ by{' '}
            <a
              href="https://github.com/MofasserHossain"
              className="text-primary hover:underline"
            >
              Mofasser Hossain
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

// Simple Terminal icon component
function Terminal({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 17l6-6-6-6M12 19h8" />
    </svg>
  )
}
