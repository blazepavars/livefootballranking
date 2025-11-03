# FIFA LiveFootballRanking.com

A comprehensive FIFA ranking analysis platform providing real-time international football rankings, historical data analysis, and live match tracking across 25+ tournaments worldwide.

![LiveFootballRanking](https://img.shields.io/badge/LiveFootball-Ranking-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.78.0-3ECF8E?style=for-the-badge&logo=supabase)

## 🚀 Live Demo

**[View Live Application →](https://3v8jx9k3b78e.space.minimax.io)**

## ✨ Features

### 📊 Live Rankings
- Real-time FIFA world rankings for 216+ countries
- Automatic daily updates at 6:00 AM UTC
- 99.86% API cost optimization

### 🏆 Tournament Coverage
- **25+ International Tournaments** across 6 confederations:
  - FIFA World Cup
  - UEFA Champions League & Europa League
  - Copa Libertadores & Copa Sudamericana
  - AFC Champions League & CAF Champions League
  - CONCACAF Champions League & OFC Champions League
  - Continental qualifiers and international friendlies

### 📈 Historical Analysis
- **32 years of FIFA rankings** (1992-2023)
- **66,000+ historical records** from official FIFA data
- Compare rankings across 327 official ranking dates
- Track team performance evolution over time

### 🔍 Advanced Features
- **Search functionality** - Find any country instantly
- **Smart sorting** - Default, Highest Jumper, Lowest Mover
- **Country flags** - Visual identification with flag emojis
- **Rank change tracking** - Historical vs Current position differences
- **Bloomberg Terminal aesthetic** - Professional financial data display

### 🎯 FIFA SUM Formula
- Official FIFA point calculation system: `P = P_before + I × (W − W_e)`
- Match importance factors (Friendly, World Cup Finals, etc.)
- Automatic point change predictions

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Edge Functions** - Serverless API endpoints
- **Cron Jobs** - Automated daily updates
- **Row Level Security** - Secure data access

### External APIs
- **API-Football** - Live match data and fixtures
- **Historical FIFA Data** - Kaggle dataset integration

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- API-Football account (free tier available)

### 1. Clone Repository
```bash
git clone https://github.com/blazepavars/livefootballranking.git
cd livefootballranking
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_FOOTBALL_KEY=your_api_football_key
```

### 4. Database Setup
```bash
# Initialize Supabase
supabase init

# Start local development
supabase start

# Run migrations
supabase db reset
```

### 5. Deploy Edge Functions
```bash
supabase functions deploy fetch-live-international-matches
supabase functions deploy update-upcoming-matches
supabase functions deploy save-ranking-snapshot
```

### 6. Setup Cron Jobs
Configure daily updates (6:00 AM UTC):
```bash
supabase functions deploy-cron fetch-live-matches-daily --schedule "0 6 * * *"
```

### 7. Start Development
```bash
pnpm dev
```

Visit `http://localhost:5173` to see your application!

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_API_FOOTBALL_KEY` | API-Football key | ✅ |

## 🗄️ Database Schema

### Core Tables
- `teams` - International football teams
- `fifa_rankings` - Current world rankings
- `historical_fifa_rankings` - 32 years of historical data
- `tournaments` - Tournament configuration
- `matches` - Live and upcoming fixtures

### Key Features
- **Historical Data**: 66,000+ records spanning 1992-2023
- **Performance Indexes**: Optimized for fast queries
- **Row Level Security**: Secure data access policies

## 🏃‍♂️ Deployment

### Production Build
```bash
pnpm build
pnpm preview
```

### Deploy to Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Deploy to Netlify
1. Build: `pnpm build`
2. Publish: `dist/` directory
3. Configure environment variables

## 📊 API Endpoints

### Edge Functions
- `fetch-live-international-matches` - Live match data
- `update-upcoming-matches` - Fixture updates  
- `save-ranking-snapshot` - FIFA ranking storage
- `update-match-results` - Match result processing

### Supabase RPC Functions
- `get_distinct_historical_dates()` - All 327 ranking dates
- `calculate_fifa_points()` - Point calculation engine

## 🎨 Design System

### Bloomberg Terminal Theme
- **Color Palette**: Dark theme with accent colors
- **Typography**: Monospace fonts for data display
- **Layout**: Professional financial data presentation
- **Components**: Clean, minimal, data-focused

### Country Flag System
- Unicode flag emojis for all 216+ countries
- Consistent visual identification
- Fallback handling for unknown flags

## 📈 Performance Optimizations

- **API Cost Reduction**: 99.86% improvement (1,440 → 2 calls/day)
- **Bundle Size**: 513.97 KB JS (119.51 KB gzipped)
- **Database**: Optimized indexes for fast historical queries
- **Client-side**: React useMemo for filtering/sorting

## 🧪 Testing

```bash
# Run linting
pnpm lint

# Type checking
pnpm type-check

# Build verification
pnpm build
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FIFA** - Official ranking data source
- **API-Football** - Live match data provider
- **Kaggle Dataset** - Historical FIFA rankings (cashncarry/fifaworldranking)
- **Supabase** - Backend infrastructure
- **React Community** - Frontend ecosystem

## 📞 Support

- **Live Application**: [3v8jx9k3b78e.space.minimax.io](https://3v8jx9k3b78e.space.minimax.io)
- **GitHub Issues**: [Create an issue](https://github.com/blazepavars/livefootballranking/issues)
- **Documentation**: [Full docs](./docs/)

---

**Built with ❤️ by the MiniMax Agent**

*Professional FIFA ranking analysis for football enthusiasts worldwide*