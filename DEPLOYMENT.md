# Deployment Guide

This guide covers deploying FIFA LiveFootballRanking to various platforms.

## 🚀 Quick Deploy Options

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/blazepavars/livefootballranking)

1. Click the Vercel button above
2. Connect your GitHub repository
3. Add environment variables (see Environment Variables section)
4. Deploy automatically

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/blazepavars/livefootballranking)

1. Connect to Netlify
2. Build settings:
   - Build command: `pnpm build`
   - Publish directory: `dist`
3. Add environment variables
4. Deploy

## 🛠 Manual Deployment

### Prerequisites
- Node.js 18+
- pnpm installed
- Supabase project created
- API-Football account (free tier available)

### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/blazepavars/livefootballranking.git
cd livefootballranking

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
```

### 2. Supabase Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db reset

# Deploy edge functions
supabase functions deploy fetch-live-international-matches
supabase functions deploy update-upcoming-matches
supabase functions deploy save-ranking-snapshot
```

### 3. Cron Jobs Setup
Configure automatic daily updates:

```bash
# Create cron job for live matches (6:00 AM UTC daily)
supabase functions deploy-cron fetch-live-matches-daily \
  --schedule "0 6 * * *" \
  --verify-jwt false

# Create cron job for upcoming matches (6:05 AM UTC daily)
supabase functions deploy-cron update-upcoming-matches-daily \
  --schedule "5 6 * * *" \
  --verify-jwt false
```

### 4. Build and Deploy
```bash
# Production build
pnpm build

# Preview locally
pnpm preview

# Deploy to your platform
# (Vercel, Netlify, AWS, etc.)
```

## 🔧 Environment Variables

### Required Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_FOOTBALL_KEY=your_api_football_key_here
```

### Getting API Keys

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy URL and anon key

#### API-Football
1. Go to [api-football.com](https://www.api-football.com)
2. Sign up for free account
3. Get your API key from dashboard
4. Free tier: 100 requests/day

## 📊 Database Setup

### Tables to Create
1. `teams` - International football teams
2. `fifa_rankings` - Current world rankings
3. `historical_fifa_rankings` - 32 years of historical data
4. `tournaments` - Tournament configuration
5. `matches` - Live and upcoming fixtures

### Sample Data
```sql
-- Insert sample tournament
INSERT INTO tournaments (name, confederation, importance_level) 
VALUES ('FIFA World Cup', 'FIFA', 4);

-- Verify setup
SELECT COUNT(*) FROM teams;
SELECT COUNT(*) FROM historical_fifa_rankings;
```

## 🔍 Testing Deployment

### Local Testing
```bash
# Development server
pnpm dev

# Build test
pnpm build

# Preview production build
pnpm preview
```

### Production Verification
- [ ] Application loads without errors
- [ ] Historical data displays correctly (327 dates available)
- [ ] Search functionality works
- [ ] Sorting options function properly
- [ ] Country flags display correctly
- [ ] API calls succeed (check browser console)

### Common Issues

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
pnpm install
pnpm build
```

#### API Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active
- Confirm API-Football key is valid

#### Database Connection
- Ensure Supabase URL and key are correct
- Check RLS policies are configured
- Verify tables exist with proper structure

## 📈 Performance Optimization

### Bundle Analysis
```bash
# Install bundle analyzer
pnpm add -D rollup-plugin-visualizer

# Analyze bundle size
pnpm build --analyze
```

### Recommended Optimizations
- Enable gzip compression on your platform
- Use CDN for static assets
- Configure proper caching headers
- Monitor Core Web Vitals

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to git
- Use platform-specific environment variable management
- Rotate API keys regularly

### Database Security
- RLS policies enabled for all tables
- API keys stored securely
- Regular security audits

## 📞 Support

- **Live Demo**: [3v8jx9k3b78e.space.minimax.io](https://3v8jx9k3b78e.space.minimax.io)
- **GitHub Issues**: [Create an issue](https://github.com/blazepavars/livefootballranking/issues)
- **Documentation**: [README.md](./README.md)

---

*For more detailed setup instructions, see the main [README.md](./README.md)*