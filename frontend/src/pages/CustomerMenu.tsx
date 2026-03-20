/**
 * Customer Menu Page - Modern Restaurant Menu Interface
 * URL: /customer/menu?table=:tableId&branch=:branchId&qr_token=:qrToken
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  UtensilsCrossed, 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowLeft,
  Search,
  Home,
  FileText,
  Bell
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
}

interface Category {
  id: string;
  name: string;
  menu_items: MenuItem[];
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const tableId = searchParams.get('table');
  const branchId = searchParams.get('branch');
  const qrToken = searchParams.get('qr_token');

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>(location.state?.cart || []);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (!tableId || !branchId || !qrToken) {
      setError('Invalid access. Please scan the QR code again.');
      setLoading(false);
      return;
    }

    loadMenu();
  }, [tableId, branchId, qrToken]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/public/branches/${branchId}/menu`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data.categories);
      } else {
        setError(data.message || 'Failed to load menu');
      }
    } catch (err: any) {
      console.error('Error loading menu:', err);
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Please add items to your cart before ordering',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/customer/order?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`, {
      state: { cart }
    });
  };

  const handleGoBack = () => {
    navigate(`/t/${qrToken}`);
  };

  const filteredCategories = categories
    .map(category => ({
      ...category,
      menu_items: category.menu_items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(category => {
      if (category.menu_items.length === 0) return false;
      if (selectedCategory === 'all') return true;
      return category.id === selectedCategory;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button onClick={handleGoBack} variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg md:text-xl font-bold">Menu</h1>
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Badge 
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge 
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-1 rounded-full whitespace-nowrap cursor-pointer ${
                  selectedCategory === category.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-gray-600 text-lg">
              {searchQuery ? 'No items found' : 'No menu items available'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                {/* Category Header */}
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
                  {category.name}
                </h2>
                
                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {category.menu_items.map((item, index) => {
                    const quantity = getItemQuantity(item.id);
                    // Assign badges based on index for demo
                    const badges = ['POPULAR', 'BEST SELLER', '', 'HEALTHY'];
                    const badgeColors = ['bg-indigo-600', 'bg-amber-500', '', 'bg-green-600'];
                    const badge = badges[index % badges.length];
                    const badgeColor = badgeColors[index % badgeColors.length];
                    
                    return (
                      <Card key={item.id} className="overflow-hidden shadow-md rounded-2xl border-0 hover:shadow-xl transition-shadow">
                        <CardContent className="p-0">
                          {/* Item Image */}
                          <div className="relative">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-48 md:h-56 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 md:h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <UtensilsCrossed className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            
                            {/* Badge */}
                            {badge && (
                              <Badge className={`absolute top-3 left-3 ${badgeColor} text-white text-xs px-3 py-1 rounded-md`}>
                                {badge}
                              </Badge>
                            )}
                            
                            {/* Add Button */}
                            <Button
                              onClick={() => addToCart(item)}
                              size="sm"
                              className="absolute bottom-3 right-3 w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white p-0 shadow-lg"
                            >
                              <Plus className="h-5 w-5 md:h-6 md:w-6" />
                            </Button>
                          </div>
                          
                          {/* Item Details */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                            {item.description && (
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-indigo-600 font-bold text-xl">
                                ${Number(item.price).toFixed(2)}
                              </span>
                              
                              {/* Quantity Controls */}
                              {quantity > 0 && (
                                <div className="flex items-center gap-2 bg-indigo-50 rounded-full px-3 py-1">
                                  <Button
                                    onClick={() => removeFromCart(item.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="w-6 h-6 p-0 hover:bg-indigo-100"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-indigo-600 min-w-[1.5rem] text-center">
                                    {quantity}
                                  </span>
                                  <Button
                                    onClick={() => addToCart(item)}
                                    size="sm"
                                    variant="ghost"
                                    className="w-6 h-6 p-0 hover:bg-indigo-100"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Cart Bar - Mobile & Desktop */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-30">
          <div className="max-w-md md:max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">{getTotalItems()} items</span>
              <span className="text-lg font-bold text-indigo-600">${getTotalPrice().toFixed(2)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base font-bold rounded-xl"
            >
              View Order →
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 md:hidden">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-4">
            <button 
              onClick={handleGoBack}
              className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Table Hub</span>
            </button>
            <button className="flex flex-col items-center py-2 text-indigo-600">
              <div className="bg-indigo-600 rounded-full p-2 mb-1">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold">Menu</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors">
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">My Order</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Bell className="h-5 w-5 mb-1" />
              <span className="text-xs">Service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}