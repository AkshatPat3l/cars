# CarCostCanada

A vehicle pricing intelligence SPA for Canadian car buyers. CarCostCanada provides dealer invoice reports, MSRP comparisons, profit margin analysis, and negotiation tools — all in a mock/test-mode demo application.

> **Demo Mode:** This is a demonstration application with mock authentication and simulated subscription data. No real payment processing occurs. All user accounts and subscription states are stored in localStorage.

## Stack

- **Frontend:** React 18 + Vite
- **Mock Auth:** localStorage-based with mock user accounts
- **Mock Subscriptions:** Test-mode auto-subscribe (no payment required)
- **Vehicle Data:** 84 vehicles from Toyota, Honda, Ford, Hyundai, Kia, Nissan, Subaru, Chevrolet, BMW, Mercedes-Benz, Audi, Lexus, Mazda, Volkswagen
- **Deployment:** Docker-ready, Cloudflare Pages compatible
- **Workspace:** pnpm + Turborepo

## Run locally (Development)

Prerequisites: Node 22+, pnpm 10+.

```bash
pnpm install
pnpm --filter=@streamforge/web dev
```

Then open <http://localhost:5173>.

### Demo account

- Email: `test@example.com`
- Password: `demo123`

Pre-loaded with 12 reports and $22,200 in simulated savings.

## Run with Docker

### Quick start (production container)

```bash
docker build -t carcostcanada:latest -f apps/web/Dockerfile .
docker run -d --name carcostcanada -p 8080:80 carcostcanada:latest
```

Then open <http://localhost:8080>.

### Docker Compose (development + production)

```bash
# Production
docker-compose up web

# Development with hot reload
docker-compose --profile dev up web-dev
```

## Deployment

### Cloudflare Pages

1. Install Wrangler: `npm install -g wrangler`
2. Build the project: `cd apps/web && pnpm build`
3. Deploy: `npx wrangler pages deploy apps/web/dist`

### Docker Hub / Container Registry

```bash
# Build
docker build -t your-registry/carcostcanada:latest -f apps/web/Dockerfile .

# Push
docker push your-registry/carcostcanada:latest

# Run elsewhere
docker run -d -p 80:80 your-registry/carcostcanada:latest
```

### Automated deployment script

```bash
./deploy.sh --docker-run    # Build and run locally
./deploy.sh --docker        # Build Docker image
./deploy.sh --production    # Build static files only
```

## Features

### Authentication & Subscription
- Sign up with any email/password (stored in localStorage)
- 3 subscription tiers: Free, Unlimited Reports ($29/mo), Dealer Pro ($99/mo)
- 1-click auto-subscribe in test mode

### Vehicle Configurator
- Cascading dropdowns: Make → Model → Year → Trim
- Real-time MSRP and invoice price display
- 14 manufacturers, 84 vehicles

### Dealer Invoice Reports
- MSRP vs Dealer Invoice comparison table
- Dealer profit margin gauge
- Unadvertised rebates panel
- Interactive offer calculator with negotiation slider
- Local dealer contact cards

### Executive Dashboard
- User savings summary
- Platform-wide stats (reports run, subscribers, average savings)
- Savings range by subscription tier

## Project Structure

```
.
├── apps/
│   ├── web/                    # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── users.ts        # Mock auth & subscriptions
│   │   │   ├── vehicles.ts     # Vehicle catalog
│   │   │   ├── App.tsx         # Main application
│   │   │   └── styles.css      # Styles
│   │   ├── Dockerfile          # Multi-stage Docker build
│   │   ├── nginx.conf          # Nginx SPA configuration
│   │   └── wrangler.toml       # Cloudflare Pages config
│   └── api/                    # (Existing API - not used by CarCostCanada)
├── docker-compose.yml          # Local development orchestration
├── deploy.sh                   # Deployment automation script
└── README.md
```

## Security Notes

- This is a **demo application** — no real authentication or payment processing
- All data is stored in browser localStorage (not secure for sensitive data)
- Passwords are stored in plain text (for demo purposes only)
- Not suitable for production use without proper auth and backend
