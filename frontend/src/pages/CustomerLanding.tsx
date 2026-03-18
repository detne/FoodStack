/**
 * Customer Landing Page - Khi quét QR code
 * URL: /t/:qr_token
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UtensilsCrossed, MapPin, Users } from 'lucide-react';

interface TableInfo {
  table: {
    id: string;
    name: string;
    capacity: number;
    status: string;
    area: {
      id: string;
      name: string;
    };
  };
  branch: {
    id: string;
    name: string;
    restaurant_id: string;
    restaurant: {
      id: string;
      name: string;
      logo_url: string | null;
    };
  };
}

export default function CustomerLanding() {
  const { qr_token } = useParams<{ qr_token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);

  useEffect(() => {
    if (!qr_token) {
      setError('Invalid QR code');
      setLoading(false);
      return;
    }

    loadTableInfo();
  }, [qr_token]);

  const loadTableInfo = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTableByQR(qr_token!);
      
      if (response.success) {
        setTableInfo(response.data);
      } else {
        setError(response.message || 'Failed to load table information');
      }
    } catch (err: any) {
      console.error('Error loading table info:', err);
      setError(err.message || 'Failed to load table information');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrder = () => {
    if (tableInfo) {
      // Navigate to customer menu with table context
      navigate(`/customer/menu?table=${tableInfo.table.id}&branch=${tableInfo.branch.id}&qr_token=${qr_token}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading table information...</p>
        </div>
      </div>
    );
  }

  if (error || !tableInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invalid QR Code</h2>
            <p className="text-gray-600 mb-6">
              {error || 'This QR code is not valid or has expired.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { table, branch } = tableInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          {branch.restaurant.logo_url ? (
            <img 
              src={branch.restaurant.logo_url} 
              alt={branch.restaurant.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{branch.restaurant.name}</h1>
            <p className="text-sm text-gray-600">{branch.name}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
            <p className="text-purple-100">You're seated at</p>
          </div>

          <CardContent className="p-8">
            {/* Table Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <UtensilsCrossed className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Table</p>
                <p className="text-2xl font-bold text-purple-900">{table.name}</p>
              </div>

              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Area</p>
                <p className="text-2xl font-bold text-blue-900">{table.area.name}</p>
              </div>

              <div className="text-center p-6 bg-pink-50 rounded-lg">
                <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Capacity</p>
                <p className="text-2xl font-bold text-pink-900">{table.capacity} guests</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center space-y-4">
              <Button 
                onClick={handleStartOrder}
                size="lg"
                className="w-full md:w-auto px-12 py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <UtensilsCrossed className="mr-2 h-5 w-5" />
                View Menu & Order
              </Button>
              
              <p className="text-sm text-gray-500">
                Browse our menu and place your order directly from your phone
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold mb-1">Easy Ordering</h3>
              <p className="text-sm text-gray-600">Order from your phone, no app needed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-1">Fast Service</h3>
              <p className="text-sm text-gray-600">Your order goes straight to the kitchen</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-semibold mb-1">Easy Payment</h3>
              <p className="text-sm text-gray-600">Pay securely when you're ready</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
