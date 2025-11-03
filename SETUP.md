# Developer Setup Guide

This guide will help you set up a local development environment for FIFA LiveFootballRanking.

## 🛠 Prerequisites

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **pnpm** (recommended) - Install with: `npm install -g pnpm`
- **Git** - [Download here](https://git-scm.com/)
- **Supabase CLI** - Install with: `npm install -g supabase`

### Required Accounts
- **GitHub Account** - For code repository
- **Supabase Account** - [Sign up here](https://supabase.com)
- **API-Football Account** - [Sign up here](https://www.api-football.com)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/blazepavars/livefootballranking.git
cd livefootballranking
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

### 4. Start Development
```bash
pnpm dev
```

Visit `http://localhost:5173` to see your application!

## 🔧 Detailed Setup

### Supabase Setup

#### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project name: `livefootballranking`
5. Generate strong password
6. Select region closest to you
7. Click "Create new project"

#### 2. Configure Database
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

#### 3. Run Migrations
```bash
# Reset database with all tables
supabase db reset

# Verify tables created
supabase db diff

# Check table structure
psql -h db.your-project.supabase.co -U postgres -d postgres
```

#### 4. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy fetch-live-international-matches
supabase functions deploy update-upcoming-matches
supabase functions deploy save-ranking-snapshot
supabase functions deploy update-match-results

# Verify deployment
supabase functions list
```

#### 5. Setup Cron Jobs
```bash
# Deploy cron jobs for daily updates
supabase functions deploy-cron fetch-live-matches-daily \
  --schedule "0 6 * * *" \
  --verify-jwt false

supabase functions deploy-cron update-upcoming-matches-daily \
  --schedule "5 6 * * *" \
  --verify-jwt false
```

### API-Football Setup

#### 1. Get API Key
1. Go to [api-football.com](https://www.api-football.com)
2. Sign up for free account
3. Verify email address
4. Go to Dashboard → API Key
5. Copy your API key

#### 2. Test API Key
```bash
# Test with curl
curl -H "X-API-Key: YOUR_API_KEY" \
  https://api-football.com/v1/status
```

Should return:
```json
{
  "status": "active",
  "request_today": 1,
  "request_month": 1,
  "limit_day": 100,
  "limit_month": 5000
}
```

### Environment Variables

Create `.env.local` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API-Football Configuration  
VITE_API_FOOTBALL_KEY=your_api_football_key_here

# Development Environment
NODE_ENV=development
VITE_APP_ENV=development
```

## 🗂 Project Structure

```
livefootballranking/
├── src/
│   ├── components/        # React components
│   │   ├── ErrorBoundary.tsx
│   │   └── Navigation.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── use-mobile.tsx
│   ├── lib/              # Utility libraries
│   │   ├── supabase.ts   # Supabase client
│   │   ├── utils.ts      # General utilities
│   │   └── countryFlags.ts # Flag mappings
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx  # Main rankings page
│   │   └── UpcomingMatchesPage.tsx
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── supabase/
│   ├── functions/        # Edge functions
│   ├── migrations/       # Database migrations
│   └── tables/           # Table definitions
├── public/               # Static assets
├── package.json          # Dependencies
└── README.md            # Project documentation
```

## 🔍 Development Workflow

### Daily Development
```bash
# Start development server
pnpm dev

# In another terminal, start Supabase locally (optional)
supabase start

# Run type checking
pnpm tsc --noEmit

# Run linting
pnpm lint

# Build test
pnpm build
```

### Database Operations
```bash
# View current schema
supabase db diff

# Create new migration
supabase migration new add_new_feature

# Reset database (CAUTION: Deletes all data)
supabase db reset

# Connect to database
supabase db connect
```

### Function Development
```bash
# Serve functions locally
supabase functions serve

# Test function locally
curl -X POST 'http://localhost:54321/functions/v1/your-function'

# Deploy function
supabase functions deploy your-function
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Integration Tests
```bash
# Test Supabase connection
supabase db ping

# Test API endpoints
curl -X GET 'https://your-project.supabase.co/rest/v1/fifa_rankings'

# Test edge functions
curl -X POST 'https://your-project.supabase.co/functions/v1/fetch-live-international-matches'
```

### E2E Testing
```bash
# Install Playwright
pnpm add -D @playwright/test

# Run E2E tests
pnpm exec playwright test
```

## 🐛 Debugging

### Common Issues

#### Environment Variables Not Loading
```bash
# Check if .env.local exists
ls -la .env.local

# Verify syntax (no spaces around =)
cat .env.local

# Restart dev server after changes
pnpm dev
```

#### Supabase Connection Errors
```bash
# Check project URL and key
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  "$VITE_SUPABASE_URL/rest/v1/"
```

#### API-Football Errors
```bash
# Test API key directly
curl -H "X-API-Key: $VITE_API_FOOTBALL_KEY" \
  https://api-football.com/v1/status

# Check rate limits
curl -H "X-API-Key: $VITE_API_FOOTBALL_KEY" \
  https://api-football.com/v1/status
```

#### Build Errors
```bash
# Clear all caches
rm -rf node_modules dist .vite pnpm-lock.yaml
pnpm install

# Check TypeScript errors
pnpm tsc --noEmit

# Check linting
pnpm lint
```

### Browser DevTools

#### React DevTools
- Install [React DevTools browser extension](https://react.dev/learn/react-developer-tools)
- Use Components tab to inspect React tree
- Use Profiler tab to analyze performance

#### Network Tab
- Monitor API requests and responses
- Check for failed requests (red status codes)
- Verify request/response timing

#### Console Tab
- Check for JavaScript errors
- Monitor React warnings
- Debug Supabase queries

## 🚢 Deployment

### Build for Production
```bash
# Create production build
pnpm build

# Preview production build locally
pnpm preview

# Test build on different port
pnpm preview --port 3000
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_API_FOOTBALL_KEY
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

## 📚 Learning Resources

### React
- [React Documentation](https://react.dev)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app)
- [React Hooks Reference](https://react.dev/reference/react)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [TypeScript React Tutorial](https://react-typescript-cheatsheet.netlify.app)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Guide](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind React Components](https://www.tailwindcomponents.com)

## 🤝 Contributing

### Development Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features

### Pull Request Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed and tested
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)
- [ ] Environment variables secured

## 📞 Getting Help

### Documentation
- [README.md](./README.md) - Project overview
- [API.md](./API.md) - API documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

### Community
- [GitHub Issues](https://github.com/blazepavars/livefootballranking/issues)
- [React Community](https://react.dev/community)
- [Supabase Discord](https://discord.supabase.com)

### Professional Support
- [Supabase Support](https://supabase.com/support)
- [API-Football Support](https://api-football.com/support)

---

*Happy coding! 🚀*