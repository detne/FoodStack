/**
 * Order Detail
 * Chi tiết order cho admin
 */

import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, MapPin, User, CreditCard } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const order = {
    id: 'ORD-001',
    status: 'preparing',
    table: 'T01',
    branch: 'Main Branch',
    server: 'John Doe',
    customer: 'Walk-in',
    items: [
      { name: 'Margherita Pizza', qty: 2, price: 12.99, total: 25.98 },
      { name: 'Caesar Salad', qty: 1, price: 8.99, total: 8.99 },
      { name: 'Coke', qty: 2, price: 2.50, total: 5.00 },
    ],
    subtotal: 39.97,
    tax: 3.60,
    serviceCharge: 2.00,
    total: 45.57,
    payment: 'Pending',
    notes: 'No onions please',
    timestamp: '2024-03-08 14:30',
  };

  const timeline = [
    { status: 'Pending', time: '14:30', completed: true },
    { status: 'Confirmed', time: '14:31', completed: true },
    { status: 'Preparing', time: '14:35', completed: true },
    { status: 'Ready', time: '', completed: false },
    { status: 'Served', time: '', completed: false },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order {order.id}</h1>
            <p className="text-muted-foreground mt-1">{order.timestamp}</p>
          </div>
        </div>

        {/* Timeline */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {timeline.map((step, idx) => (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.completed ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <p className="text-sm font-medium mt-2">{step.status}</p>
                    {step.time && <p className="text-xs text-muted-foreground">{step.time}</p>}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${step.completed ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                      <p className="font-medium">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Charge</span>
                  <span>${order.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Table</p>
                    <p className="font-medium">{order.table}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">{order.branch}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Server</p>
                    <p className="font-medium">{order.server}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <Badge variant={order.payment === 'Paid' ? 'default' : 'secondary'}>
                      {order.payment}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Served
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
