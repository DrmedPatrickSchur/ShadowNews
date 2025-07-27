# Contributing to ShadowNews

Thank you for your interest in contributing to ShadowNews! This guide will help you get started.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ShadowNews.git
   cd ShadowNews
   ```
3. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. **Set up development environment** (see [Development Setup](docs/setup/development.md))

## 🛠️ Development Workflow

### Creating a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### Making Changes
1. Make your changes in the appropriate files
2. Write or update tests as needed
3. Update documentation if necessary
4. Follow the existing code style and conventions

### Testing
```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run E2E tests
npm run cypress:run
```

### Committing Changes
We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new email repository feature"
git commit -m "fix: resolve email parsing issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for karma system"
```

### Submitting a Pull Request
1. Push your changes to your fork
2. Create a pull request on GitHub
3. Fill out the pull request template
4. Wait for code review

## 📝 Code Style

### Backend (Node.js)
- Use ESLint configuration provided
- Follow existing patterns for error handling
- Write JSDoc comments for functions
- Use async/await over promises

### Frontend (React/TypeScript)
- Use TypeScript strictly
- Follow React best practices
- Use Tailwind CSS for styling
- Write reusable components

### Email Integration
- Test email functionality thoroughly
- Consider deliverability implications
- Document email command formats
- Handle edge cases gracefully

## 🧪 Testing Requirements

- **Unit Tests**: Required for new functions and bug fixes
- **Integration Tests**: Required for API endpoints
- **E2E Tests**: Required for user-facing features
- **Email Tests**: Required for email-related functionality
- **Coverage**: Maintain minimum 80% code coverage

## 📚 Documentation

When contributing, please update:

- **README.md**: For user-facing changes
- **API Documentation**: For API changes
- **Setup Guides**: For configuration changes
- **Architecture Docs**: For structural changes
- **Feature Docs**: For new features

## 🐛 Bug Reports

Use the Bug Report template and include:
- Clear reproduction steps
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## 💡 Feature Requests

Use the Feature Request template and include:
- Clear problem statement
- Proposed solution
- Use cases and examples
- Technical considerations

## 📧 Email-Specific Guidelines

When working with email features:

1. **Test with Multiple Clients**: Gmail, Outlook, Apple Mail
2. **Consider Deliverability**: SPF, DKIM, DMARC compliance
3. **Handle Bounces**: Implement proper bounce handling
4. **Rate Limiting**: Respect email service provider limits
5. **Privacy**: Be mindful of email privacy implications

## 🎯 Areas We Need Help With

- [ ] Mobile app development (React Native)
- [ ] Advanced email client integrations
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)
- [ ] Documentation improvements
- [ ] Test coverage expansion
- [ ] DevOps and deployment automation

## 💬 Getting Help

- **Discord**: [Join our server](https://discord.gg/shadownews)
- **Email**: shadownews@artofdigitalshadow.org
- **Issues**: Use the Question template for help

## 📋 Pull Request Guidelines

- Fill out the PR template completely
- Link related issues
- Update documentation
- Add tests for new features
- Ensure CI passes
- Request review from maintainers

## 🏆 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Invited to our contributor Discord channel
- Eligible for contributor swag (when available)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, helps make ShadowNews better. Thank you for taking the time to contribute!

---

For questions about contributing, feel free to reach out via [email](mailto:shadownews@artofdigitalshadow.org) or [Discord](https://discord.gg/shadownews).
