// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Table & Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  logo_url?: string;
}

export interface Branch {
  id: string;
  name: string;
  restaurant_id: string;
  restaurant: Restaurant;
}

export interface Area {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'OutOfService';
  area?: Area;
}

export interface TableInfo {
  table: Table;
  branch: Branch;
  restaurant: Restaurant;
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  menu_items: MenuItem[];
}

export interface MenuData {
  categories: Category[];
}

// Customization Types
export interface CustomizationOption {
  id: string;
  name: string;
  price_delta: number;
  sort_order: number;
}

export interface CustomizationGroup {
  group_id: string;
  name: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  options: CustomizationOption[];
}

export interface ItemCustomizations {
  customizations: CustomizationGroup[];
}

// Order Types
export interface OrderItemCustomization {
  option_id: string;
}

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  notes?: string;
  customizations?: OrderItemCustomization[];
}

export interface OrderSession {
  session_token: string;
  table: Table;
  branch: Branch;
}

export interface Order {
  id: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Cancelled';
  payment_status: 'Pending' | 'Success' | 'Failed' | 'Refunded';
  sub_total: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  items: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  name: string;
  quantity: number;
  base_price: number;
  image_url?: string;
  notes?: string;
  customizations: {
    name: string;
    price_delta: number;
  }[];
}

// Cart Types
export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes?: string;
  selected_customizations: {
    group_id: string;
    group_name: string;
    options: CustomizationOption[];
  }[];
  total_price: number;
}

// Navigation Types
export type RootStackParamList = {
  // Splash Screen
  Splash: undefined;
  
  // Auth Screens
  Login: undefined;
  UserTypeSelection: undefined;
  Register: {
    userType?: 'customer' | 'partner';
  };
  ForgotPassword: undefined;
  EmailVerification: {
    email: string;
  };
  
  // Main App Screens
  Home: undefined;
  QRScan: undefined;
  RestaurantList: undefined;
  
  // Restaurant Management Screens (for partners)
  RestaurantDashboard: undefined;
  MenuManagement: undefined;
  OrderManagement: undefined;
  RestaurantStatistics: undefined;
  RestaurantSettings: undefined;
  AddMenuItem: {
    categoryId: string;
  };
  EditMenuItem: {
    item: any; // Define proper type later
  };
  OrderDetails: {
    order: any; // Define proper type later
  };

  // Admin Screens
  AdminDashboard: undefined;
  AdminRestaurants: undefined;
  AdminUsers: undefined;
  AdminOrders: undefined;
  AdminReports: undefined;
  AdminApprovals: undefined;
  AdminSettings: undefined;
  
  // Main App Screens
  Home: undefined;
  QRScan: undefined;
  RestaurantList: undefined;
  RestaurantSelection: undefined;
  Menu: { 
    tableInfo?: TableInfo;
    sessionToken?: string;
    restaurantId?: string;
    branchId?: string;
  };
  FoodDetail: {
    menuItem: MenuItem;
    tableInfo?: TableInfo;
    sessionToken?: string;
    restaurantId?: string;
    branchId?: string;
  };
  Cart: {
    tableInfo?: TableInfo;
    sessionToken?: string;
    restaurantId?: string;
    branchId?: string;
  };
  OrderStatus: {
    orderId: string;
    sessionToken?: string;
    tableInfo?: TableInfo;
  };
  Payment: {
    orderId: string;
    sessionToken?: string;
    tableInfo?: TableInfo;
  };
  OrderHistory: undefined;
  Profile: undefined;
  Offers: undefined;
  RestaurantDetail: {
    restaurantId: string;
  };
};

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  userType: 'user' | 'restaurant';
  // Restaurant specific fields
  restaurantName?: string;
  restaurantEmail?: string;
  restaurantAddress?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  restaurantId?: string;
  restaurant?: {
    id: string;
    name: string;
    email_verified: boolean;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}