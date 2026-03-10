# FoodStack Frontend Development Guide

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod
- **Styling**: Tailwind CSS

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin-specific components
│   │   ├── AdminLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MetricCard.tsx
│   ├── ui/              # shadcn/ui components
│   └── landing/         # Landing page components
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   ├── api-client.ts    # API client configuration
│   ├── theme.ts         # Design system tokens
│   └── utils.ts         # Utility functions
├── pages/               # Route pages
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── ...
└── hooks/               # Custom React hooks

```

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Update the API URL:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Design System

### Colors
- **Primary**: Purple (#a855f7) - Main brand color
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f59e0b)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray scale

### Border Radius
- Small: 0.375rem (6px)
- Medium: 0.75rem (12px)
- Large: 1rem (16px)
- XL: 1.25rem (20px)

### Shadows
Soft shadows for cards and elevated elements

## Component Guidelines

### Reusable Components

#### MetricCard
KPI card for dashboards
```tsx
<MetricCard
  title="Total Revenue"
  value="$12,540"
  icon={DollarSign}
  trend={{ value: 12.5, isPositive: true }}
  description="vs last month"
/>
```

#### AdminLayout
Wrapper for admin pages with sidebar and top bar
```tsx
<AdminLayout>
  <YourPageContent />
</AdminLayout>
```

## API Integration

### Using API Client
```tsx
import { apiClient } from '@/lib/api-client';

// Login
const response = await apiClient.login(email, password);

// Get menu items
const items = await apiClient.getMenuItems();
```

### Using Auth Context
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Use auth methods
}
```

## Routing

### Protected Routes
TODO: Implement ProtectedRoute component

### Available Routes
- `/` - Landing page
- `/login` - Sign in
- `/onboarding` - Registration flow
- `/dashboard` - Admin dashboard
- `/branches` - Branch management
- `/menu-items` - Menu management
- `/categories` - Category management
- `/orders` - Order management

## Development Workflow

### 1. Create New Page
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Use `AdminLayout` for admin pages

### 2. Create New Component
1. Create component in appropriate folder
2. Export from index file if needed
3. Add TypeScript types

### 3. API Integration
1. Add method to `api-client.ts`
2. Use React Query for data fetching
3. Handle loading and error states

## Best Practices

1. **TypeScript**: Always use proper types
2. **Components**: Keep components small and focused
3. **Styling**: Use Tailwind utility classes
4. **State**: Use React Query for server state
5. **Forms**: Use React Hook Form + Zod validation
6. **Accessibility**: Follow WCAG guidelines

## Next Steps

### Phase 1: Core Admin (Current)
- ✅ Design system setup
- ✅ Auth context
- ✅ API client
- ✅ Admin layout
- ✅ Login page
- ✅ Dashboard

### Phase 2: Business Features
- [ ] Branch management pages
- [ ] Menu item CRUD
- [ ] Category CRUD
- [ ] Staff management
- [ ] Order list

### Phase 3: Mobile Customer App
- [ ] QR scan flow
- [ ] Menu browsing
- [ ] Cart & checkout
- [ ] Order tracking
- [ ] Service requests

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [React Query](https://tanstack.com/query)
