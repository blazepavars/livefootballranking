# Contributing to FIFA LiveFootballRanking

First off, thank you for considering contributing to FIFA LiveFootballRanking! It's people like you that make this project better.

## 🚀 Quick Start for Contributors

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/livefootballranking.git
   ```

2. **Set up your development environment**
   ```bash
   cd livefootballranking
   pnpm install
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes and test them**
   ```bash
   pnpm dev
   pnpm lint
   pnpm type-check
   ```

5. **Submit a pull request**

## 📋 Types of Contributions

We're looking for help in many areas:

### 🐛 Bug Reports
- **Security vulnerabilities**: email security@minimax.com
- **Functional bugs**: Create a GitHub issue with reproduction steps
- **Performance issues**: Include benchmarks and profiling data

### ✨ Feature Requests
- **New tournaments**: Suggest adding specific competitions
- **Enhanced analytics**: Propose new data visualizations
- **UI/UX improvements**: Share design ideas and user research
- **Performance optimizations**: Propose speed improvements

### 📚 Documentation
- **API documentation**: Improve existing docs or add examples
- **Setup guides**: Make it easier for new contributors
- **Tutorial content**: Create step-by-step guides
- **Translation**: Help us reach more users globally

### 🎨 Code Contributions
- **New components**: Build React components following our design system
- **Backend improvements**: Enhance Supabase functions and database
- **Testing**: Add unit tests, integration tests, E2E tests
- **Performance**: Optimize bundles, queries, and rendering

## 🛠 Development Guidelines

### Code Style
- **TypeScript**: Use strict TypeScript for all new code
- **ESLint**: Follow our ESLint configuration
- **Prettier**: We use Prettier for consistent formatting
- **Conventional Commits**: Use conventional commit messages

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```bash
feat(frontend): add historical rankings comparison table
fix(api): resolve rate limiting issue with API-Football
docs(api): add Edge Function documentation
test(components): add unit tests for ranking modal
```

### Pull Request Process

1. **Before submitting**:
   - [ ] Code follows project style guidelines
   - [ ] All tests pass (`pnpm test`)
   - [ ] Type checking passes (`pnpm tsc --noEmit`)
   - [ ] Linting passes (`pnpm lint`)
   - [ ] Build succeeds (`pnpm build`)
   - [ ] Documentation updated if needed

2. **PR Description**:
   - Clear title explaining what the PR does
   - Detailed description of changes
   - Screenshots for UI changes
   - Links to related issues
   - Breaking changes clearly marked

3. **Review Process**:
   - At least one maintainer review required
   - All CI checks must pass
   - Address all review comments
   - Squash commits if requested

## 🏗 Architecture Guidelines

### Frontend Architecture
- **Component Structure**: One component per file
- **Custom Hooks**: Extract reusable logic into hooks
- **Type Safety**: Define interfaces for all props and data
- **Performance**: Use React.memo and useMemo appropriately

### Backend Architecture
- **Edge Functions**: Keep functions small and focused
- **Database Design**: Follow normalization principles
- **Security**: Always use Row Level Security
- **Error Handling**: Comprehensive error boundaries

### File Organization
```
src/
├── components/     # Reusable UI components
│   └── ui/        # Basic UI primitives
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── pages/         # Page components
└── types/         # TypeScript type definitions
```

## 🧪 Testing Standards

### Unit Tests
- **Components**: Test rendering and interactions
- **Hooks**: Test hook logic and state changes
- **Utilities**: Test pure functions thoroughly

### Integration Tests
- **API Integration**: Test Supabase functions and database
- **Component Integration**: Test component interactions
- **Page Flows**: Test complete user workflows

### Test Coverage
- Aim for >80% code coverage
- Focus on critical business logic
- Include edge cases and error scenarios

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test Header.test.tsx
```

## 🔍 Code Review Guidelines

### For Reviewers
- **Constructive Feedback**: Be specific and actionable
- **Security Review**: Check for security vulnerabilities
- **Performance**: Look for performance bottlenecks
- **Accessibility**: Ensure WCAG compliance
- **Documentation**: Verify docs are updated

### For Contributors
- **Respond Promptly**: Address review feedback quickly
- **Ask Questions**: Clarify unclear feedback
- **Test Changes**: Verify fixes work as expected
- **Update Docs**: Keep documentation current

## 🐛 Reporting Bugs

### Before Reporting
1. Check existing issues
2. Try the latest version
3. Test with a clean environment
4. Gather relevant information

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome 91, Firefox 89]
- Node Version: [e.g. 18.0.0]
- Project Version: [e.g. 1.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is

**Describe the solution you'd like**
A clear description of what you want to happen

**Describe alternatives you've considered**
A clear description of any alternative solutions

**Additional context**
Screenshots, mockups, or any other context

**Priority**
- High: Critical for project success
- Medium: Important improvement
- Low: Nice to have
```

## 🎯 Priority Areas

### High Priority
- **Performance**: Optimize bundle size and loading speed
- **Accessibility**: Improve WCAG compliance
- **Testing**: Increase test coverage
- **Documentation**: Complete API and setup guides

### Medium Priority
- **New Tournaments**: Add more international competitions
- **Mobile Experience**: Enhance responsive design
- **Analytics**: Add user behavior tracking
- **Internationalization**: Add multi-language support

### Low Priority
- **UI Customization**: Theme options
- **Advanced Charts**: Data visualizations
- **Social Features**: Sharing and comparisons
- **PWA Features**: Offline capability

## 🏆 Recognition

### Contributors Hall of Fame
We'll maintain a list of contributors in our README:
- **Core Contributors**: Major feature development
- **Bug Hunters**: Significant bug fixes
- **Documentation Heroes**: Improved docs significantly
- **Community Champions**: Help others in issues and discussions

### How to Get Featured
- Submit high-quality pull requests
- Help review others' contributions
- Improve documentation significantly
- Report and fix important bugs

## 📞 Getting Help

### Development Questions
- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Code Review**: Ask for help during PR review

### Community
- **Discord**: [Join our community server]
- **Twitter**: [@LiveFootballRank]
- **Email**: contributors@livefootballranking.com

## 📄 Code of Conduct

### Our Pledge
We are committed to making participation in this project a harassment-free experience for everyone.

### Our Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Enforcement
Instances of abusive behavior may be reported to the project maintainers.

## 🎉 Thank You!

Your contributions make FIFA LiveFootballRanking better for everyone. Whether you're fixing a typo or implementing a major feature, every contribution is valued and appreciated.

Welcome to the team! 🚀

---

**Questions?** Don't hesitate to ask in GitHub Discussions or reach out to the maintainers.