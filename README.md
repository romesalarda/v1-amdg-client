# AMDG Client

Version 1.0.0 of the AMDG client-side application, built with Nuxt 3, Vue 3, and TypeScript.

The client provides the AMDG event management and attendee experience as a single-page application. It communicates with the AMDG API and supports event operations, attendee management, bookings, payments, products, statistics, and real-time updates.

## Technology Stack

- Nuxt 3 and Vue 3
- TypeScript with strict type checking
- Pinia for application state
- TanStack Vue Query for server state
- Nuxt UI and Tailwind CSS for the interface
- OpenAPI-generated TypeScript API client
- Stripe.js for payment flows
- Playwright and Vitest for testing

## Requirements

- Node.js 20 or later
- npm 10 or later
- Access to a running AMDG API instance

## Installation

```bash
npm install
```

## Configuration

Create a local `.env` file when the default API configuration is not suitable:

```dotenv
NUXT_PUBLIC_API_URL=https://api.amdgevents.co.uk
NUXT_PUBLIC_API_BASE_URL=https://api.amdgevents.co.uk
NUXT_PUBLIC_STRIPE_TEST_MODE=false
NUXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=
```

Only public values belong in these variables. Never add private API keys, Stripe secret keys, or other credentials to the client application.

## Development

Start the development server at `http://localhost:3000`:

```bash
npm run dev
```

## Production

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

For static hosting, generate the application and deploy the generated output according to the hosting provider's Nuxt deployment requirements:

```bash
npm run generate
```

## API Client Generation

The generated API client is based on `amdg-api.yaml`. After updating the API schema, regenerate the client:

```bash
npm run generate-api
```

Do not edit generated files in `src/api` manually. Update the OpenAPI schema or generator configuration and regenerate them instead.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Nuxt development server |
| `npm run build` | Build the application for production |
| `npm run generate` | Generate a static production deployment |
| `npm run preview` | Preview the production build locally |
| `npm run generate-api` | Regenerate the OpenAPI TypeScript client |

## License

Copyright (c) 2026 AMDG.

This project is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.