/**
 * Kitchen Display System (KDS)
 * Dashboard cho bếp
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockOrders = [
  {
    id: 'ORD-001',
    table: 'T01',
    type: 'Dine In',
    elapsed: '5 min',
    items: [
      { name: 'Margherita Pizza', qty: 2, mods: [] },
      { name: 'Caesar Salad', qty: 1, mods: ['No croutons'] },
    ],
    status: 'pending',
    priority: 'normal',
  },
  {
    id: 'ORD-002',
    table: 'T05',
    type: 'Dine In',
    elapsed: '12 min',
    items: [
      { name: 'Burger', qty: 1, mods: ['Extra cheese', 'No onions'] },
      { name: 'Fries', qty: 2, mods: [] },
    ],
    status: 'preparing',
    priority: 'high',
  },
  {
    id: 'ORD-003',
    table: 'Pickup',
    type: 'Takeout',
    elapsed: '3 min',
    items: [
      { name: 'Pasta Carbonara', qty: 1, mods: [] },
    ],
    status: 'pending',
    priority: 'normal',
  },
];

export default function KitchenDisplay() {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState('all');

  const handleMarkReady = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? {...o, status: 'ready'} : o));
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kitchen Display</h1>
            <p className="text-muted-foreground mt-1">Active orders</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {orders.filter(o => o.status === 'pending').length} Pending
            </Badge>
            <Badge className="text-lg px-4 py-2 bg-blue-600">
              {orders.filter(o => o.status === 'preparing').length} Preparing
            </Badge>
          </div>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className={`${
              order.priority === 'high' ? 'border-red-500 border-2' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{order.table}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={order.type === 'Dine In' ? 'default' : 'secondary'}>
                      {order.type}
                    </Badge>
                    <p className="text-sm font-medium mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {order.elapsed}
                    </p>
                  </div>
                </div>

                {order.priority === 'high' && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Rush Order</span>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="border-l-2 border-purple-500 pl-3">
                      <p className="font-medium">
                        {item.qty}x {item.name}
                      </p>
                      {item.mods.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {item.mods.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleMarkReady(order.id)}
                  disabled={order.status === 'ready'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {order.status === 'ready' ? 'Ready' : 'Mark Ready'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p className="text-muted-foreground">No orders in this status</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
