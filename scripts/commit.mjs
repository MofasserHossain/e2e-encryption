#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'child_process'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const commitTypes = [
  { value: 'feat', description: '✨ New feature' },
  { value: 'fix', description: '🐛 Bug fix' },
  { value: 'docs', description: '📚 Documentation changes' },
  { value: 'style', description: '💄 Code style/formatting changes' },
  { value: 'refactor', description: '♻️ Code refactoring' },
  { value: 'perf', description: '⚡ Performance improvements' },
  { value: 'test', description: '🧪 Adding or updating tests' },
  { value: 'build', description: '🔨 Build system or dependency changes' },
  { value: 'ci', description: '👷 CI/CD configuration changes' },
  { value: 'chore', description: '🔧 Other changes (maintenance)' },
  { value: 'revert', description: '⏪ Revert previous commit' },
]

const commitScopes = [
  { value: 'setup', description: '🔧 Project setup' },
  { value: 'config', description: '⚙️ Configuration files' },
  { value: 'deps', description: '📦 Dependency updates' },
  { value: 'feature', description: '🚀 Feature-specific changes' },
  { value: 'bug', description: '🐛 Bug fixes' },
  { value: 'docs', description: '📚 Documentation' },
  { value: 'style', description: '💄 Code style/formatting' },
  { value: 'refactor', description: '♻️ Code refactoring' },
  { value: 'test', description: '🧪 Tests' },
  { value: 'build', description: '🔨 Build scripts or configuration' },
  { value: 'ci', description: '👷 Continuous integration' },
  { value: 'release', description: '🚀 Release related changes' },
  { value: 'other', description: '📝 Other changes' },
]

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

function displayOptions(options) {
  options.forEach((option, index) => {
    console.log(`${index + 1}. ${option.value} - ${option.description}`)
  })
}

async function selectOption(options, prompt) {
  displayOptions(options)
  const answer = await question(prompt)
  const index = parseInt(answer) - 1

  if (index >= 0 && index < options.length) {
    return options[index].value
  }

  console.log('❌ Invalid selection. Please try again.')
  return selectOption(options, prompt)
}

async function main() {
  try {
    console.log('🚀 Interactive Commit Message Generator\n')

    // Select commit type
    const type = await selectOption(
      commitTypes,
      '\nSelect commit type (1-11): ',
    )

    // Select commit scope
    const scope = await selectOption(
      commitScopes,
      '\nSelect commit scope (1-13): ',
    )

    // Get commit description
    const description = await question('\nEnter commit description: ')

    if (!description.trim()) {
      console.log('❌ Commit description is required.')
      process.exit(1)
    }

    // Get commit body (optional)
    const body = await question(
      '\nEnter commit body (optional, press Enter to skip): ',
    )

    // Get commit footer (optional)
    const footer = await question(
      '\nEnter commit footer (optional, press Enter to skip): ',
    )

    // Build commit message
    let commitMessage = `${type}(${scope}): ${description}`

    if (body.trim()) {
      commitMessage += `\n\n${body}`
    }

    if (footer.trim()) {
      commitMessage += `\n\n${footer}`
    }

    console.log('\n📝 Generated commit message:')
    console.log('─'.repeat(50))
    console.log(commitMessage)
    console.log('─'.repeat(50))

    const confirm = await question('\n❓ Proceed with this commit? (y/N): ')

    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      // Stage all changes
      execSync('git add .', { stdio: 'inherit' })

      // Commit with the generated message
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' })

      console.log('\n✅ Commit successful!')
    } else {
      console.log('\n❌ Commit cancelled.')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
