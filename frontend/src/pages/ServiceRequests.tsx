/**
 * Service Request Management
 * Quản lý yêu cầu dịch vụ từ khách
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle,
  Bell,
  Coffee,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockRequests = [
  {
    id: '1',
    type: 'call_waiter',
    table: 'T01',
    zone: 'Main Dining',
    elapsed: '2 min',
    urgency: 'normal',
    icon: Bell,
  },
  {
    id: '2',
    type: 'request_water',
    table: 'T05',
    zone: 'Main Dining',
    elapsed: '5 min',
    urgency: 'high',
    icon: Coffee,
  },
  {
    id: '3',
    type: 'request_bill',
    table: 'P02',
    zone: 'Patio',
    elapsed: '1 min',
    urgency: 'normal',
    icon: CreditCard,
  },
  {
    id: '4',
    type: 'custom',
    table: 'V01',
    zone: 'VIP Lounge',
    elapsed: '8 min',
    urgency: 'high',
    message: 'Need extra napkins',
    icon: HelpCircle,
  },
];

const typeLabels = {
  call_waiter: 'Call Waiter',
  request_water: 'Request Water',
  request_bill: 'Request Bill',
  custom: 'Custom Request',
};

export default function ServiceRequests() {
  const [requests, setRequests] = useState(mockRequests);
  const [filter, setFilter] = useState('all');

  const handleComplete = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.type === filter);

  const stats = {
    total: requests.length,
    urgent: requests.filter(r => r.urgency === 'high').length,
    longestWait: Math.max(...requests.map(r => parseInt(r.elapsed))) || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Service Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer service requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Requests</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Urgent</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.urgent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Longest Wait</p>
              <p className="text-2xl font-bold mt-1">{stats.longestWait} min</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="call_waiter">Call Waiter</TabsTrigger>
            <TabsTrigger value="request_water">Water</TabsTrigger>
            <TabsTrigger value="request_bill">Bill</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => {
            const Icon = request.icon;
            return (
              <Card key={request.id} className={`${
                request.urgency === 'high' ? 'border-red-500 border-2' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-3 rounded-lg ${
                      request.urgency === 'high' ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        request.urgency === 'high' ? 'text-red-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {typeLabels[request.type as keyof typeof typeLabels]}
                      </h3>
                      <p className="text-sm text-muted-foreground">{request.table} - {request.zone}</p>
                      {request.message && (
                        <p className="text-sm mt-1">{request.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{request.elapsed}</span>
                    </div>
                    {request.urgency === 'high' && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleComplete(request.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Request
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p className="text-muted-foreground">No pending requests</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
