# Contributing to Scaffold Scripts

We love your input! We want to make contributing to Scaffold Scripts as easy and transparent as possible.

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/scaffold-scripts.git
cd scaffold-scripts

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run specific test suites
npm run test:basic
npm run test:aliases
npm run test:coverage
```

## Testing

- Write tests for any new functionality
- Ensure all tests pass before submitting PR
- Test on multiple platforms when possible
- Add integration tests for CLI functionality

## Code Style

- We use TypeScript with strict mode
- Follow existing code conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/ChrisColeTech/scaffold-scripts/issues).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We welcome feature requests! Please [open an issue](https://github.com/ChrisColeTech/scaffold-scripts/issues) with:

- Clear description of the feature
- Use case / motivation
- Possible implementation approach (optional)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to [open an issue](https://github.com/ChrisColeTech/scaffold-scripts/issues) with questions about contributing.