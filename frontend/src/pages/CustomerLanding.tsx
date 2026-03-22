/**
 * Customer Landing Page - Restaurant Style Interface
 * URL: /t/:qr_token
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  UtensilsCrossed, 
  MapPin, 
  Users, 
  Bell,
  Trash2,
  Receipt,
  Home,
  ShoppingCart,
  FileText,
  Phone,
  Clock,
  X
} from 'lucide-react';

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
  };
  restaurant: {
    id: string;
    name: string;
    logo_url: string | null;
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
        setTableInfo(response.data as TableInfo);
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
      navigate(`/customer/menu?table=${tableInfo.table.id}&branch=${tableInfo.branch.id}&qr_token=${qr_token}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white/80">Loading your table...</p>
        </div>
      </div>
    );
  }

  if (error || !tableInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="max-w-md w-full bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Invalid QR Code</h2>
            <p className="text-white/70 mb-6">
              {error || 'This QR code is not valid or has expired.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { table, branch, restaurant } = tableInfo;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop')`
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">{restaurant.name}</h1>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
            Occupied
          </Badge>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6">
          <div className="max-w-sm mx-auto w-full space-y-6">
            
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3">Welcome to your table!</h2>
              <p className="text-white/80 text-lg">Ready for a culinary journey?</p>
            </div>

            {/* Table Info Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-indigo-600 rounded-2xl p-4 mr-4 text-white">
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-90">TABLE</div>
                      <div className="text-3xl font-bold mt-1">{table.name.replace(/[^\d]/g, '') || '12'}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{table.area.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {branch.name}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Occupied
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card className="bg-indigo-50/95 backdrop-blur-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">Your order is being prepared</div>
                    <div className="text-gray-600 text-sm">Expected in 10-15 mins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Ordering Button */}
            <Button 
              onClick={handleStartOrder}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-bold rounded-2xl shadow-lg"
            >
              <X className="mr-2 h-5 w-5 rotate-45" />
              Start Ordering
            </Button>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white/90 backdrop-blur-sm border-0 hover:bg-white transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Bell className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">CALL STAFF</span>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm border-0 hover:bg-white transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Trash2 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">REQUEST WATER</span>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm border-0 hover:bg-white transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Receipt className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">VIEW BILL</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-8">
          <div className="max-w-sm mx-auto px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <button className="flex flex-col items-center py-3 text-white/70 hover:text-white transition-colors">
                <Home className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Table Hub</span>
              </button>
              <button className="flex flex-col items-center py-3 text-indigo-400">
                <div className="bg-indigo-600 rounded-full p-2 mb-1">
                  <X className="h-4 w-4 text-white rotate-45" />
                </div>
                <span className="text-xs font-bold">Ordering</span>
              </button>
              <button 
                onClick={() => navigate(`/customer/order-status?table=${table.id}&qr_token=${qr_token}`)}
                className="flex flex-col items-center py-3 text-white/70 hover:text-white transition-colors"
              >
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">My Order</span>
              </button>
              <button className="flex flex-col items-center py-3 text-white/70 hover:text-white transition-colors">
                <Bell className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}