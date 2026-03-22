/**
 * Customer Order Page - Modern Order Confirmation
 * URL: /customer/order?table=:tableId&branch=:branchId&qr_token=:qrToken
 */

import { useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  ArrowLeft, 
  Plus, 
  Minus,
  Trash2,
  Home,
  FileText,
  Bell
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  image_url?: string | null;
}

export default function CustomerOrder() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const tableId = searchParams.get('table');
  const branchId = searchParams.get('branch');
  const qrToken = searchParams.get('qr_token');
  
  const cart: CartItem[] = location.state?.cart || [];
  
  const [localCart, setLocalCart] = useState<CartItem[]>(cart);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setLocalCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setLocalCart(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setLocalCart(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: 'Item removed',
      description: 'Item has been removed from your order',
    });
  };

  const getTotalPrice = () => {
    return localCart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return localCart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return getTotalPrice();
  };

  const getTax = () => {
    return getTotalPrice() * 0.08; // 8% tax
  };

  const handleSubmitOrder = async () => {
    if (localCart.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'No items to order',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Step 1: Create session
      const sessionResponse = await fetch('http://localhost:3000/api/v1/customer-orders/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr_token: qrToken,
          customer_count: 1,
        }),
      });

      const sessionResult = await sessionResponse.json();

      if (!sessionResult.success) {
        throw new Error(sessionResult.message || 'Failed to create session');
      }

      const sessionToken = sessionResult.data.session_token;

      // Step 2: Create order
      const orderData = {
        session_token: sessionToken,
        notes: specialRequests.trim() || null,
        items: localCart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          notes: null,
          customizations: []
        }))
      };

      const orderResponse = await fetch('http://localhost:3000/api/v1/customer-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      if (orderResult.success) {
        toast({
          title: 'Order placed successfully!',
          description: 'Your order has been sent to the kitchen',
        });
        
        // Navigate to my order page
        navigate(`/customer/my-order?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`);
      } else {
        throw new Error(orderResult.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order failed',
        description: error.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`, {
      state: { cart: localCart }
    });
  };

  const handleAddMore = () => {
    navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`, {
      state: { cart: localCart }
    });
  };

  if (localCart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Empty Cart</h2>
            <p className="text-gray-600 mb-6">Please add items to your cart before placing an order</p>
            <Button onClick={handleGoBack} variant="outline">
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={handleGoBack} variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg md:text-xl font-bold">My Order</h1>
            </div>
            <Badge className="bg-indigo-100 text-indigo-600 border-0 px-3 py-1">
              Table {tableId}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout on Desktop */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Cart Items (2/3 width on desktop) */}
          <div className="md:col-span-2 space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {localCart.map((item) => (
                <Card key={item.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                          <UtensilsCrossed className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-base md:text-xl">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm md:text-base text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                            )}
                          </div>
                          <span className="text-indigo-600 font-bold text-lg md:text-2xl ml-4">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 text-sm md:text-base flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            Remove
                          </button>
                          
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 md:w-10 md:h-10 p-0 rounded-full"
                            >
                              <Minus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <span className="font-bold text-base md:text-lg min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              size="sm"
                              className="w-8 h-8 md:w-10 md:h-10 p-0 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Plus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add More Items Button */}
            <Button
              onClick={handleAddMore}
              variant="outline"
              className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 py-6 md:py-8 rounded-xl text-base md:text-lg"
            >
              <Plus className="h-5 w-5 md:h-6 md:w-6 mr-2" />
              Add more items
            </Button>
          </div>

          {/* Right Column - Summary (1/3 width on desktop, sticky) */}
          <div className="space-y-4 md:sticky md:top-24 md:self-start">
            {/* Order Summary */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg md:text-xl mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 text-base">
                    <span>Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-base">
                    <span>Tax (8%)</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl md:text-2xl pt-3 border-t-2">
                    <span>Total</span>
                    <span className="text-indigo-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-gray-700 text-base md:text-lg">Special instructions for kitchen</h3>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Please bring water first..."
                  rows={4}
                  className="resize-none text-base"
                />
              </CardContent>
            </Card>

            {/* Desktop Submit Button */}
            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || localCart.length === 0}
              className="hidden md:flex w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-bold rounded-2xl shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending Order...
                </>
              ) : (
                <>
                  <span className="flex-1 text-left">Send Order to Kitchen</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg md:hidden">
        <div className="max-w-2xl mx-auto p-4">
          <Button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || localCart.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-bold rounded-2xl shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending Order...
              </>
            ) : (
              <>
                Send Order to Kitchen
                <span className="ml-auto">${getTotalPrice().toFixed(2)}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 z-20 md:hidden">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-4">
            <button 
              onClick={() => navigate(`/t/${qrToken}`)}
              className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Table Hub</span>
            </button>
            <button 
              onClick={handleAddMore}
              className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 mb-1" />
              <span className="text-xs">Menu</span>
            </button>
            <button className="flex flex-col items-center py-2 text-indigo-600">
              <div className="bg-indigo-600 rounded-full p-2 mb-1">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold">My Order</span>
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