# BranchSelector Component

## Overview
A modern, card-based branch selector component that replaces the traditional dropdown with an interactive grid layout.

## Features
- **Responsive Grid Layout**: Automatically adjusts from 1 to 4 columns based on screen size
- **Interactive Cards**: Hover effects with smooth transitions and scale animations
- **Visual Feedback**: Selected branch is highlighted with primary color border and background
- **Dark Theme Compatible**: Gradient backgrounds with backdrop blur effects
- **Phone Display**: Shows phone number with icon, or "No phone" if not available

## Usage

```tsx
import BranchSelector from '@/components/tables/BranchSelector';

function MyComponent() {
  const [selectedBranch, setSelectedBranch] = useState('');
  const branches = [
    { id: '1', address: '123 Main Street, City Center', phone: '555-0123' },
    { id: '2', address: '456 West Avenue, Westside', phone: null },
  ];

  return (
    <BranchSelector
      branches={branches}
      selectedBranch={selectedBranch}
      onSelectBranch={setSelectedBranch}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `branches` | `Branch[]` | Array of branch objects |
| `selectedBranch` | `string` | ID of the currently selected branch |
| `onSelectBranch` | `(branchId: string) => void` | Callback when a branch is selected |

## Branch Interface

```typescript
interface Branch {
  id: string;
  address: string;
  phone?: string | null;
}
```

## Design Details

### Card States
1. **Default**: Subtle border, gradient background
2. **Hover**: Elevated shadow, slight scale up, border color change
3. **Selected**: Primary border, primary background tint, animated indicator dot

### Responsive Breakpoints
- Mobile (< 768px): 1 column
- Tablet (768px - 1024px): 2 columns
- Desktop (1024px - 1280px): 3 columns
- Large Desktop (> 1280px): 4 columns

### Animations
- Card hover: 300ms transition with scale and translate
- Selected indicator: Pulse animation
- Border glow: Smooth color transition

## Integration

The component is integrated into:
- `frontend/src/pages/Tables.tsx` - Main table management page
- `frontend/src/components/tables/ManagerTableManagementEnhanced.tsx` - Enhanced table management

Both pages now use the card-based selector instead of the dropdown.
