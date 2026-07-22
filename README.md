# Next.js Starter Template

Production-ready Next.js 13 starter with:

- 🌐 **i18n** — next-translate + next-translate-routes (ka, en, ru)
- 🎨 **Styled Components** — with typed theme
- 🔐 **NextAuth.js** — authentication ready
- 📦 **SWR** — data fetching
- 📱 **Responsive** — react-grid-system
- 🗺️ **Maps** — MapLibre/Mapbox ready
- 📊 **Charts** — Chart.js ready
- 🔔 **Toasts** — react-toastify
- 🖼️ **SVG** — @svgr/webpack
- 🐳 **Docker** — production Dockerfile
- 📦 **Bundle Analyzer** — @next/bundle-analyzer

## Getting Started

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env.local

# Run development server
yarn dev

# Build for production
yarn build:prod
yarn start
```

## Scripts

| Command            | Description                 |
| ------------------ | --------------------------- |
| `yarn dev`         | Dev server (default env)    |
| `yarn dev:test`    | Dev server (Test env)       |
| `yarn dev:preprod` | Dev server (Preprod env)    |
| `yarn dev:prod`    | Dev server (Production env) |
| `yarn build`       | Build                       |
| `yarn build:prod`  | Build (Production env)      |
| `yarn lint`        | ESLint                      |
| `yarn analyze`     | Bundle analyzer             |

## Project Structure

```
├── API_Client/        # API client (OpenAPI generated)
├── components/
│   ├── shared/        # Shared components (Header, Footer, etc.)
│   └── ui/            # Atomic UI components
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── locales/           # i18n translation files
├── pages/             # Next.js pages
├── public/            # Static assets
├── styles/            # Global CSS
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Configuration

1. Edit `.env.local` with your values
2. Update `theme.ts` with your design tokens
3. Add your API client in `API_Client/`
4. Configure auth providers in `pages/api/auth/[...nextauth].ts`
5. Add locales in `locales/` and update `i18n.json`

## Docker

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

## Notes

- `cross-env` is used for cross-platform env variable setting
- Add `cross-env` to devDependencies: `yarn add -D cross-env`
- Font files are in `fonts/` — replace with your project fonts
