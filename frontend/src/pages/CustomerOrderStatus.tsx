/**
 * Customer Order Status Page - Track Order Progress
 * URL: /customer/order-status?table=:tableId&qr_token=:qrToken
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  ChefHat,
  UtensilsCrossed,
  Home,
  ShoppingCart,
  FileText,
  Bell,
  HelpCircle,
  Plus
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string | null;
  notes?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  items: OrderItem[];
  created_at: string;
}

export default function CustomerOrderStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tableId = searchParams.get('table');
  const qrToken = searchParams.get('qr_token');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);

  // Format table display - extract number or use last 2 chars
  const getTableDisplay = () => {
    console.log('tableInfo:', tableInfo); // Debug
    if (tableInfo?.table_number) {
      return tableInfo.table_number;
    }
    // If no table info yet, show loading or extract from ID
    if (loading) {
      return '...';
    }
    // Try to extract meaningful number from tableId
    // tableId is UUID, so just show a placeholder
    return 'N/A';
  };

  const getAreaDisplay = () => {
    if (tableInfo?.area_name) {
      return tableInfo.area_name;
    }
    return loading ? '...' : 'Area';
  };

  const getLatestOrder = () => {
    return orders.length > 0 ? orders[0] : null;
  };

  const getTotalItems = () => {
    const order = getLatestOrder();
    return order ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  };

  const getSubtotal = () => {
    const order = getLatestOrder();
    return order ? order.total * 0.9 : 0; // Assuming 10% service charge
  };

  const getTax = () => {
    const order = getLatestOrder();
    return order ? order.total * 0.08 : 0;
  };

  useEffect(() => {
    if (!tableId || !qrToken) {
      setError('Invalid access');
      setLoading(false);
      return;
    }

    loadOrders();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [tableId, qrToken]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Get orders for this table
      const response = await fetch(`http://localhost:3000/api/v1/customer-orders/table/${tableId}?qr_token=${qrToken}`);
      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      
      if (data.success) {
        console.log('Table Info:', data.data.table); // Debug log
        setTableInfo(data.data.table);
        setOrders(data.data.orders);
      } else {
        setError(data.message || 'Failed to load orders');
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      'PENDING': { label: 'Order Received', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
      'PREPARING': { label: 'Preparing', color: 'bg-indigo-100 text-indigo-700', icon: ChefHat },
      'READY': { label: 'Ready to Serve', color: 'bg-green-100 text-green-700', icon: UtensilsCrossed },
      'SERVED': { label: 'Served', color: 'bg-gray-100 text-gray-700', icon: CheckCircle2 },
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const getEstimatedTime = () => {
    return '12-15 mins';
  };

  const handleGoBack = () => {
    navigate(`/t/${qrToken}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Only show on mobile */}
      <div className="bg-white shadow-sm sticky top-0 z-20 md:hidden">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={handleGoBack} variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold">Order Status</h1>
            </div>
            <Button variant="ghost" size="sm" className="text-indigo-600">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-6 space-y-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600">The Digital Concierge</h2>
          </div>

          {/* Table Info */}
          <div>
            <h3 className="text-xl font-bold mb-1">Table {getTableDisplay()}</h3>
            <p className="text-sm text-gray-600">{getAreaDisplay()}</p>
            <p className="text-sm text-gray-600">EST. 15-20 MINS</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-600 font-medium">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              Live Status
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <FileText className="h-5 w-5" />
              Order Summary
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <Bell className="h-5 w-5" />
              Call Server
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <Plus className="h-5 w-5" />
              Add Items
            </button>
          </nav>

          {/* Call Server Button */}
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl mt-auto">
            <Bell className="h-5 w-5 mr-2" />
            Call Server
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Tracking & Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Live Order Tracking */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">Live Order Tracking</h1>
                  <p className="text-gray-600 mb-6">
                    {getLatestOrder() ? (
                      <>Order ID: {getLatestOrder()!.order_number} • Estimated arrival at {new Date(getLatestOrder()!.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</>
                    ) : (
                      'No active orders'
                    )}
                  </p>

                  {/* Status Steps */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm font-semibold">Order Received</p>
                      <p className="text-xs text-gray-500">7:40 PM</p>
                    </div>
                    <div className="flex-1 h-1 bg-indigo-600 mx-4" />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-2">
                        <ChefHat className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-indigo-600">Preparing</p>
                      <p className="text-xs text-indigo-500">IN PROGRESS</p>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 mx-4" />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                        <UtensilsCrossed className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-400">Ready to Serve</p>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 mx-4" />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-400">Served</p>
                    </div>
                  </div>
                </div>

                {/* Items Details */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Items Details</h2>
                    {getLatestOrder() ? (
                      <div className="space-y-6">
                        {getLatestOrder()!.items.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                            ) : (
                              <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                                <UtensilsCrossed className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-bold">{item.name}</h3>
                                  {item.description && (
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                  )}
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">Qty: {item.quantity}</Badge>
                                    {item.customizations && (
                                      <Badge variant="outline" className="text-xs">+ {item.customizations}</Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xl font-bold text-indigo-600">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No items in this order</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Summary & Actions */}
              <div className="space-y-6">
                {/* Current Table Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-700 text-white overflow-hidden">
                  <CardContent className="p-6">
                    <p className="text-xs text-indigo-200 uppercase mb-2">Current Table</p>
                    <h2 className="text-4xl font-bold mb-2">Table {getTableDisplay()}</h2>
                    <p className="text-sm text-indigo-200 mb-4">{getAreaDisplay()}</p>
                    <div className="border-t border-indigo-400 pt-4">
                      <p className="text-xs text-indigo-200 uppercase mb-1">Est. Completion</p>
                      <p className="text-2xl font-bold">12-15 mins</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({getTotalItems()} items)</span>
                        <span>${getSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Service Charge (10%)</span>
                        <span>${(getSubtotal() * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax (8%)</span>
                        <span>${getTax().toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm uppercase text-gray-600">Total Paid</span>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold">${(getLatestOrder()?.total || 0).toFixed(2)}</span>
                            <Badge className="bg-green-100 text-green-700 border-0">CONFIRMED</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Need Something Else */}
                <Card className="border-0 shadow-sm bg-indigo-50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Need something else?</h3>
                    <p className="text-sm text-gray-600 mb-4">Our staff is ready to assist you. Call for extra cutlery, water, or to add more dishes to your order.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="bg-white">
                        <UtensilsCrossed className="h-4 w-4 mr-2" />
                        Water
                      </Button>
                      <Button variant="outline" className="bg-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Extra
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Table & Time Info */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm bg-indigo-50">
            <CardContent className="p-4">
              <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">Table Number</p>
              <p className="text-2xl font-bold text-indigo-700">Table {getTableDisplay()}</p>
              <p className="text-xs text-gray-600 mt-1">{getAreaDisplay()}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-indigo-600">
            <CardContent className="p-4">
              <p className="text-xs text-indigo-100 font-semibold uppercase mb-1">Est. Time</p>
              <p className="text-2xl font-bold text-white">{getEstimatedTime()}</p>
            </CardContent>
          </Card>
        </div>

        {orders.length === 0 ? (
          /* No Orders Yet */
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start ordering to see your order status here</p>
              <Button
                onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${searchParams.get('branch')}&qr_token=${qrToken}`)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start Ordering
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Live Tracking */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                  <h2 className="font-bold text-lg">Live Tracking</h2>
                </div>

                {/* Status Timeline */}
                <div className="space-y-6">
                  {/* Order Received */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="w-0.5 h-12 bg-indigo-600" />
                    </div>
                    <div className="flex-1 pb-4">
                      <h3 className="font-bold text-base">Order Received</h3>
                      <p className="text-sm text-gray-600">12:40 PM • Confirmed by kitchen</p>
                    </div>
                  </div>

                  {/* Preparing */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <ChefHat className="h-5 w-5 text-white" />
                      </div>
                      <div className="w-0.5 h-12 bg-gray-200" />
                    </div>
                    <div className="flex-1 pb-4">
                      <h3 className="font-bold text-base text-indigo-600">Preparing</h3>
                      <p className="text-sm text-gray-600">Chef is working on your meal...</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-indigo-600 h-2 rounded-full w-2/3" />
                      </div>
                    </div>
                  </div>

                  {/* Ready to Serve */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UtensilsCrossed className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="w-0.5 h-12 bg-gray-200" />
                    </div>
                    <div className="flex-1 pb-4">
                      <h3 className="font-bold text-base text-gray-400">Ready to Serve</h3>
                      <p className="text-sm text-gray-400">Waiting for server</p>
                    </div>
                  </div>

                  {/* Served */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-gray-400">Served</h3>
                      <p className="text-sm text-gray-400">Pending arrival</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Order Summary</h2>
                  <span className="text-sm text-gray-600">2 Items</span>
                </div>

                <div className="space-y-4">
                  {/* Mock items */}
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Truffle Pasta</h3>
                        <span className="font-bold">×1</span>
                      </div>
                      <p className="text-sm text-gray-600">Extra parmesan, no mushrooms</p>
                      <p className="text-indigo-600 font-bold mt-1">$24.00</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Iced Caramel Latte</h3>
                        <span className="font-bold">×2</span>
                      </div>
                      <p className="text-sm text-gray-600">Oat milk, light ice</p>
                      <p className="text-indigo-600 font-bold mt-1">$13.00</p>
                    </div>
                  </div>
                </div>

                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>$37.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total Paid</span>
                    <span className="text-indigo-600">$41.50</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
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
              onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${searchParams.get('branch')}&qr_token=${qrToken}`)}
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
