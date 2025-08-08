# RL Admin

A modern admin dashboard built with React, TypeScript, and shadcn/ui components.

## Features

- 🎨 Built with shadcn/ui components
- 📊 Interactive charts with Recharts
- 🔐 Authentication with Clerk
- 📱 Fully responsive design
- 🎭 Dark/Light mode support
- 📝 Form handling with React Hook Form
- 🚀 Fast development with Vite
- 💅 Styled with Tailwind CSS
- 🔍 Global search command
- 📄 10+ pre-built pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lgsf/rl-admin.git
cd rl-admin
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Copy the environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Project Structure

```
rl-admin/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities and helpers
│   ├── hooks/          # Custom React hooks
│   ├── store/          # State management (Zustand)
│   └── styles/         # Global styles
├── public/             # Static assets
└── ...config files
```

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (TailwindCSS + RadixUI)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand
- **Routing:** Tanstack Router
- **Authentication:** Clerk
- **Icons:** Tabler Icons

## License

MIT