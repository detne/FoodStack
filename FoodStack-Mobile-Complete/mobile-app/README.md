# FoodStack Mobile App

React Native mobile application for customers to scan QR codes, browse menus, and place orders at restaurants.

## 🚀 Features

- **QR Code Scanning**: Scan table QR codes to start ordering
- **Menu Browsing**: View restaurant menu with categories and items
- **Food Customization**: Select customization options for menu items
- **Cart Management**: Add, remove, and modify items in cart
- **Order Tracking**: Real-time order status updates
- **Payment Options**: Multiple payment methods (QR, Cash, Card)

## 📱 Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Query** for API state management
- **Expo Camera** for QR code scanning
- **AsyncStorage** for local data persistence

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens
│   ├── QRScanScreen.tsx
│   ├── MenuScreen.tsx
│   ├── FoodDetailScreen.tsx
│   ├── CartScreen.tsx
│   ├── OrderStatusScreen.tsx
│   └── PaymentScreen.tsx
├── navigation/         # Navigation configuration
├── services/          # API services
├── hooks/             # Custom React hooks
├── context/           # React context providers
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Install dependencies:**
   ```bash
   cd FoodStackMobile
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/emulator:**
   ```bash
   # Android
   npm run android
   
   # iOS (macOS only)
   npm run ios
   
   # Web
   npm run web
   ```

## 📡 API Configuration

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api/v1'  // Android emulator
  : 'https://your-production-api.com/api/v1';
```

For iOS simulator, use:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'  // iOS simulator
  : 'https://your-production-api.com/api/v1';
```

## 🔄 App Flow

1. **QR Scan**: Customer scans table QR code
2. **Table Validation**: App validates QR token and gets table info
3. **Session Creation**: Creates order session for the table
4. **Menu Browse**: Customer browses menu and adds items to cart
5. **Order Placement**: Customer places order with selected items
6. **Order Tracking**: Real-time status updates (Pending → Preparing → Ready → Served)
7. **Payment**: Customer chooses payment method and completes payment

## 🛠️ Development

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add route type to `RootStackParamList` in `src/types/index.ts`
3. Add screen to navigator in `src/navigation/AppNavigator.tsx`

### API Integration

All API calls are centralized in `src/services/api.ts`:

- `publicApi`: Public endpoints (no auth required)
- `orderApi`: Customer order endpoints (session-based auth)
- `storage`: Local storage utilities

### State Management

- **Cart State**: Managed by `CartContext` using `useCart` hook
- **API State**: Managed by React Query for caching and synchronization
- **Local Storage**: AsyncStorage for session tokens and table info

## 📱 Testing

### On Physical Device

1. Install Expo Go app on your device
2. Scan QR code from development server
3. Test QR scanning with actual restaurant QR codes

### On Emulator

1. Use Android Studio emulator or iOS Simulator
2. Test with mock QR codes
3. Use camera simulation for QR scanning

## 🚀 Deployment

### Build for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

### App Store Deployment

1. Configure app.json with proper bundle identifiers
2. Set up signing certificates
3. Build and submit to respective app stores

## 🔐 Security

- Session tokens stored securely in AsyncStorage
- API calls use HTTPS in production
- QR tokens validated server-side
- No sensitive data stored locally

## 🐛 Troubleshooting

### Common Issues

1. **Camera Permission**: Ensure camera permissions are granted
2. **Network Issues**: Check API base URL configuration
3. **QR Scanning**: Ensure proper lighting and QR code quality
4. **Build Errors**: Clear cache with `expo r -c`

### Debug Mode

Enable debug logging by setting `__DEV__` flag:

```typescript
if (__DEV__) {
  console.log('Debug info:', data);
}
```

## 📄 License

This project is proprietary software for FoodStack platform.