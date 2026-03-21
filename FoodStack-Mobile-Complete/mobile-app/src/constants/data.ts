// ─── DATA CONSTANTS ──────────────────────────────────────────────────────────

export const RESTAURANTS = [
  { 
    id: 1, 
    name: "Burger King", 
    cuisine: "Fast Food", 
    rating: 4.5, 
    distance: "0.3 km", 
    time: "15-20 min", 
    open: true, 
    img: "🍔", 
    color: "#FF6B35", 
    category: "fastfood" 
  },
  { 
    id: 2, 
    name: "Pizza Hut", 
    cuisine: "Italian", 
    rating: 4.3, 
    distance: "0.8 km", 
    time: "25-35 min", 
    open: true, 
    img: "🍕", 
    color: "#E63946", 
    category: "italian" 
  },
  { 
    id: 3, 
    name: "Ichiraku Ramen", 
    cuisine: "Japanese", 
    rating: 4.7, 
    distance: "1.2 km", 
    time: "20-30 min", 
    open: true, 
    img: "🍜", 
    color: "#F4A261", 
    category: "japanese" 
  },
  { 
    id: 4, 
    name: "Salad Stop", 
    cuisine: "Healthy", 
    rating: 4.6, 
    distance: "0.5 km", 
    time: "10-15 min", 
    open: false, 
    img: "🥗", 
    color: "#2A9D8F", 
    category: "healthy" 
  },
  { 
    id: 5, 
    name: "Sushi Palace", 
    cuisine: "Japanese", 
    rating: 4.8, 
    distance: "2.1 km", 
    time: "30-40 min", 
    open: true, 
    img: "🍣", 
    color: "#457B9D", 
    category: "japanese" 
  },
];

export const MENU_CATEGORIES = ["All", "Popular", "Main", "Sides", "Drinks", "Desserts"];

export const MENU_ITEMS = [
  // Burger King Items
  { 
    id: 1, 
    name: "Whopper Burger", 
    category: "Popular", 
    price: 8.99, 
    desc: "Flame-grilled beef patty with fresh vegetables", 
    emoji: "🍔", 
    restaurant: 1, 
    customizations: [
      { name: "Size", required: true, options: ["Regular", "Large"] }, 
      { name: "Extras", required: false, options: ["Extra Cheese", "Extra Sauce", "Bacon"] }
    ] 
  },
  { 
    id: 2, 
    name: "Double Whopper", 
    category: "Main", 
    price: 11.99, 
    desc: "Two flame-grilled patties with all the toppings", 
    emoji: "🍔", 
    restaurant: 1, 
    customizations: [] 
  },
  { 
    id: 3, 
    name: "Crispy Fries", 
    category: "Sides", 
    price: 3.49, 
    desc: "Golden crispy fries seasoned to perfection", 
    emoji: "🍟", 
    restaurant: 1, 
    customizations: [
      { name: "Size", required: true, options: ["Small", "Medium", "Large"] }
    ] 
  },
  { 
    id: 7, 
    name: "Cola", 
    category: "Drinks", 
    price: 2.99, 
    desc: "Ice cold refreshing cola", 
    emoji: "🥤", 
    restaurant: 1, 
    customizations: [
      { name: "Size", required: true, options: ["Small", "Medium", "Large"] }
    ] 
  },
  { 
    id: 8, 
    name: "Chocolate Sundae", 
    category: "Desserts", 
    price: 4.49, 
    desc: "Creamy soft serve with rich chocolate sauce", 
    emoji: "🍦", 
    restaurant: 1, 
    customizations: [] 
  },
  { 
    id: 9, 
    name: "Chicken Burger", 
    category: "Main", 
    price: 7.99, 
    desc: "Crispy chicken breast with lettuce and mayo", 
    emoji: "🍗", 
    restaurant: 1, 
    customizations: [] 
  },
  { 
    id: 10, 
    name: "Onion Rings", 
    category: "Sides", 
    price: 4.99, 
    desc: "Crispy golden onion rings", 
    emoji: "🧅", 
    restaurant: 1, 
    customizations: [] 
  },

  // Pizza Hut Items
  { 
    id: 4, 
    name: "Pepperoni Pizza", 
    category: "Popular", 
    price: 14.99, 
    desc: "Classic pepperoni with mozzarella on tomato base", 
    emoji: "🍕", 
    restaurant: 2, 
    customizations: [
      { name: "Size", required: true, options: ["Personal", "Medium", "Large"] }, 
      { name: "Crust", required: false, options: ["Thin", "Thick", "Stuffed"] }
    ] 
  },
  { 
    id: 11, 
    name: "Margherita Pizza", 
    category: "Main", 
    price: 12.99, 
    desc: "Fresh mozzarella, tomato sauce and basil", 
    emoji: "🍕", 
    restaurant: 2, 
    customizations: [
      { name: "Size", required: true, options: ["Personal", "Medium", "Large"] }
    ] 
  },
  { 
    id: 12, 
    name: "Meat Lovers Pizza", 
    category: "Popular", 
    price: 18.99, 
    desc: "Pepperoni, sausage, ham and bacon", 
    emoji: "🍕", 
    restaurant: 2, 
    customizations: [] 
  },
  { 
    id: 13, 
    name: "Garlic Bread", 
    category: "Sides", 
    price: 5.99, 
    desc: "Warm bread with garlic butter and herbs", 
    emoji: "🥖", 
    restaurant: 2, 
    customizations: [] 
  },

  // Ramen Items
  { 
    id: 5, 
    name: "Tonkotsu Ramen", 
    category: "Popular", 
    price: 13.50, 
    desc: "Rich pork bone broth with chashu and soft egg", 
    emoji: "🍜", 
    restaurant: 3, 
    customizations: [
      { name: "Spice Level", required: true, options: ["Mild", "Medium", "Hot", "Extra Hot"] }
    ] 
  },
  { 
    id: 14, 
    name: "Miso Ramen", 
    category: "Main", 
    price: 12.50, 
    desc: "Savory miso broth with vegetables and noodles", 
    emoji: "🍜", 
    restaurant: 3, 
    customizations: [] 
  },
  { 
    id: 15, 
    name: "Gyoza", 
    category: "Sides", 
    price: 6.99, 
    desc: "Pan-fried pork dumplings (6 pieces)", 
    emoji: "🥟", 
    restaurant: 3, 
    customizations: [] 
  },
  { 
    id: 16, 
    name: "Green Tea", 
    category: "Drinks", 
    price: 3.99, 
    desc: "Hot or iced Japanese green tea", 
    emoji: "🍵", 
    restaurant: 3, 
    customizations: [
      { name: "Temperature", required: true, options: ["Hot", "Iced"] }
    ] 
  },

  // Salad Stop Items
  { 
    id: 6, 
    name: "Avocado Bowl", 
    category: "Popular", 
    price: 12.50, 
    desc: "Fresh greens with avocado, seeds and lemon dressing", 
    emoji: "🥗", 
    restaurant: 4, 
    customizations: [] 
  },
  { 
    id: 17, 
    name: "Caesar Salad", 
    category: "Main", 
    price: 10.99, 
    desc: "Romaine lettuce with parmesan and croutons", 
    emoji: "🥗", 
    restaurant: 4, 
    customizations: [
      { name: "Protein", required: false, options: ["Chicken", "Salmon", "Tofu"] }
    ] 
  },
  { 
    id: 18, 
    name: "Smoothie Bowl", 
    category: "Desserts", 
    price: 8.99, 
    desc: "Acai bowl with fresh fruits and granola", 
    emoji: "🍓", 
    restaurant: 4, 
    customizations: [] 
  },
  { 
    id: 19, 
    name: "Fresh Juice", 
    category: "Drinks", 
    price: 5.99, 
    desc: "Freshly squeezed orange or apple juice", 
    emoji: "🧃", 
    restaurant: 4, 
    customizations: [
      { name: "Flavor", required: true, options: ["Orange", "Apple", "Mixed Berry"] }
    ] 
  },

  // Sushi Palace Items
  { 
    id: 20, 
    name: "Salmon Sashimi", 
    category: "Popular", 
    price: 15.99, 
    desc: "Fresh salmon slices (8 pieces)", 
    emoji: "🍣", 
    restaurant: 5, 
    customizations: [] 
  },
  { 
    id: 21, 
    name: "California Roll", 
    category: "Main", 
    price: 9.99, 
    desc: "Crab, avocado and cucumber roll", 
    emoji: "🍣", 
    restaurant: 5, 
    customizations: [] 
  },
  { 
    id: 22, 
    name: "Miso Soup", 
    category: "Sides", 
    price: 3.99, 
    desc: "Traditional soybean paste soup", 
    emoji: "🍲", 
    restaurant: 5, 
    customizations: [] 
  },
  { 
    id: 23, 
    name: "Sake", 
    category: "Drinks", 
    price: 8.99, 
    desc: "Premium Japanese rice wine", 
    emoji: "🍶", 
    restaurant: 5, 
    customizations: [
      { name: "Temperature", required: true, options: ["Hot", "Cold"] }
    ] 
  },
  { 
    id: 24, 
    name: "Mochi Ice Cream", 
    category: "Desserts", 
    price: 6.99, 
    desc: "Sweet rice cake with ice cream filling", 
    emoji: "🍡", 
    restaurant: 5, 
    customizations: [
      { name: "Flavor", required: true, options: ["Vanilla", "Green Tea", "Red Bean"] }
    ] 
  },
];

export const ORDER_HISTORY = [
  { 
    id: "ORD-001", 
    restaurant: "Burger King", 
    restaurantEmoji: "🍔", 
    date: "Oct 24, 2023", 
    time: "12:45 PM", 
    items: 2, 
    total: 24.50, 
    status: "SERVED" 
  },
  { 
    id: "ORD-002", 
    restaurant: "Pizza Hut", 
    restaurantEmoji: "🍕", 
    date: "Oct 24, 2023", 
    time: "02:15 PM", 
    items: 1, 
    total: 18.99, 
    status: "PROCESSING" 
  },
  { 
    id: "ORD-003", 
    restaurant: "Ichiraku Ramen", 
    restaurantEmoji: "🍜", 
    date: "Oct 23, 2023", 
    time: "08:30 PM", 
    items: 3, 
    total: 42.00, 
    status: "PAID" 
  },
  { 
    id: "ORD-004", 
    restaurant: "Salad Stop", 
    restaurantEmoji: "🥗", 
    date: "Oct 22, 2023", 
    time: "01:20 PM", 
    items: 1, 
    total: 12.50, 
    status: "SERVED" 
  },
];

export const OFFERS = [
  { 
    title: "Sunset Special", 
    desc: "20% off all dinners after 6PM", 
    code: "SUNSET20", 
    bg: ["#FF7A30", "#E8622A"], 
    emoji: "🌅" 
  },
  { 
    title: "First Order", 
    desc: "Free delivery on your first order", 
    code: "FIRST", 
    bg: ["#4FC3F7", "#0288D1"], 
    emoji: "🎁" 
  },
  { 
    title: "Combo Deal", 
    desc: "Buy 2 mains get 1 drink free", 
    code: "COMBO", 
    bg: ["#4DB6AC", "#00897B"], 
    emoji: "🍱" 
  },
  { 
    title: "Weekend Feast", 
    desc: "15% off orders above $30", 
    code: "WEEKEND15", 
    bg: ["#CE93D8", "#7B1FA2"], 
    emoji: "🎉" 
  },
];

export type RestaurantType = typeof RESTAURANTS[0];
export type MenuItemType = typeof MENU_ITEMS[0];
export type OrderHistoryType = typeof ORDER_HISTORY[0];
export type OfferType = typeof OFFERS[0];