# CÁCH 3: SUBFOLDER - Nhanh nhất để bắt đầu

## Cấu trúc

```
FoodStack/
├── backend/                        # Backend code
│   ├── src/
│   ├── database/
│   ├── package.json
│   └── .env
│
├── frontend/                       # Frontend code
│   ├── admin/                     # Admin Dashboard
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── customer/                  # Customer App
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── shared/                    # Shared FE code
│       ├── components/
│       ├── utils/
│       └── types/
│
├── shared/                         # Shared BE/FE code
│   ├── types/
│   ├── constants/
│   └── utils/
│
├── package.json                    # Root package.json
└── README.md
```

## Setup nhanh (5 phút)

### Bước 1: Tổ chức lại code hiện tại

```bash
# Tạo thư mục backend
mkdir backend

# Di chuyển tất cả file BE vào backend/
# (Có thể dùng Git để di chuyển giữ history)
git mv src backend/
git mv database backend/
git mv package.json backend/
git mv .env.example backend/
# ... di chuyển các file BE khác
```

### Bước 2: Tạo Frontend

```bash
# Tạo thư mục frontend
mkdir -p frontend/admin
mkdir -p frontend/customer
mkdir -p frontend/shared

# Tạo Admin app
cd frontend/admin
pnpm create vite . --template react-ts
pnpm install

# Tạo Customer app
cd ../customer
pnpm create vite . --template react-ts
pnpm install
```

### Bước 3: Tạo Shared folder

```bash
mkdir -p shared/types
mkdir -p shared/constants
mkdir -p shared/utils
```

**File: `shared/types/index.ts`**
```typescript
// Types dùng chung cho BE và FE
export interface User {
  id: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}
```

**File: `shared/constants/index.ts`**
```typescript
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  COMPLETED: 'COMPLETED',
} as const;

export const TAX_RATE = 0.1;
export const SERVICE_CHARGE_RATE = 0.05;
```

### Bước 4: Root package.json

**File: `package.json`**
```json
{
  "name": "foodstack",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:admin\" \"npm run dev:customer\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:admin": "cd frontend/admin && npm run dev",
    "dev:customer": "cd frontend/customer && npm run dev",
    
    "build": "npm run build:backend && npm run build:admin && npm run build:customer",
    "build:backend": "cd backend && npm run build",
    "build:admin": "cd frontend/admin && npm run build",
    "build:customer": "cd frontend/customer && npm run build",
    
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend/admin && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### Bước 5: Cài concurrently

```bash
npm install -D concurrently
```

### Bước 6: Chạy tất cả

```bash
# Chạy BE + FE cùng lúc
npm run dev

# Hoặc chạy riêng
npm run dev:backend
npm run dev:admin
npm run dev:customer
```

## Sử dụng Shared code

### Trong Backend (Node.js)

**File: `backend/src/controllers/menu.controller.js`**
```javascript
const { ORDER_STATUS } = require('../../shared/constants');

function createOrder(req, res) {
  const order = {
    status: ORDER_STATUS.PENDING,
    // ...
  };
}
```

### Trong Frontend (React)

**File: `frontend/admin/src/pages/Orders.tsx`**
```typescript
import { ORDER_STATUS } from '../../../shared/constants';
import type { User, MenuItem } from '../../../shared/types';

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  
  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          Status: {ORDER_STATUS[order.status]}
        </div>
      ))}
    </div>
  );
}
```

## Cấu hình TypeScript cho Shared

**File: `frontend/admin/tsconfig.json`**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../../shared/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```

**File: `frontend/admin/vite.config.ts`**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

## Ưu điểm Subfolder

✅ **Setup nhanh nhất**
- Không cần workspace config
- Không cần publish packages
- 1 repo, dễ quản lý

✅ **Share code dễ dàng**
- Import trực tiếp từ shared/
- TypeScript autocomplete work
- Refactor dễ dàng

✅ **Development experience tốt**
- Chạy tất cả với 1 command
- Hot reload cho tất cả
- Debug dễ dàng

✅ **Phù hợp team nhỏ**
- 1-5 người
- Không cần phức tạp hóa

## Nhược điểm

⚠️ **Deploy phức tạp hơn**
- Phải tách BE/FE khi deploy
- CI/CD cần config cẩn thận
- Build time lâu (build cả repo)

⚠️ **Không scale tốt**
- Repo lớn dần
- Nhiều node_modules
- Git history lớn

⚠️ **Conflict nhiều hơn**
- Team làm chung 1 repo
- Merge conflict thường xuyên

## Khi nào dùng Subfolder?

✅ Dùng khi:
- Bắt đầu project mới
- Team nhỏ (1-3 người)
- Muốn setup nhanh
- Prototype/MVP

❌ Không dùng khi:
- Team lớn (>5 người)
- Cần deploy frequency khác nhau
- Project đã lớn
