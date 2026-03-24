/**
 * Customer Preview Page - Demo version for Owner
 * Shows what customers will see when scanning QR code, but with restaurant branding
 * URL: /restaurant/:restaurantId/customer-preview
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  UtensilsCrossed, 
  MapPin, 
  Users,
  Bell,
  Receipt,
  FileText,
  Phone,
  Clock,
  ShoppingCart
} from 'lucide-react';

interface RestaurantData {
  branding: {
    brandName: string;
    tagline: string;
    logoUrl: string;
    bannerUrl: string;
  };
}

export default function CustomerPreview() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RestaurantData | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Import apiClient
        const { apiClient } = await import('@/lib/api-client');
        
        // Get restaurant branding
        const result = await apiClient.get(`/branding/restaurant/${restaurantId}/preview`);
        setData(result.data);
        
        // Get first branch for menu navigation
        const branchesData = await apiClient.getBranches();
        if (branchesData.data && branchesData.data.length > 0) {
          setBranchId(branchesData.data[0].id);
        }
      } catch (err: any) {
        console.error('Error loading preview:', err);
        setError(err.message || 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchData();
    }

    // Listen for branding updates from Branding page
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'branding_updated') {
        console.log('Branding updated, reloading preview...');
        setLoading(true);
        fetchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage periodically (for same-tab updates)
    const checkInterval = setInterval(() => {
      const lastUpdate = localStorage.getItem('branding_updated');
      const lastCheck = sessionStorage.getItem('last_branding_check');
      
      if (lastUpdate && lastUpdate !== lastCheck) {
        console.log('Branding updated (same tab), reloading preview...');
        sessionStorage.setItem('last_branding_check', lastUpdate);
        setLoading(true);
        fetchData();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải preview...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Preview Error</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Unable to load preview'}
          </p>
        </div>
      </div>
    );
  }

  const displayName = data.branding?.brandName || 'Restaurant Name';
  const displayLogo = data.branding?.logoUrl;
  const displayTagline = data.branding?.tagline || 'Tinh hoa phở Việt trong từng tô';
  const displayBanner = data.branding?.bannerUrl || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1200&h=600&fit=crop';
  const layoutType = data.branding?.layoutType || 'DEFAULT';

  const handleStartOrdering = () => {
    if (branchId) {
      navigate(`/customer/menu?branch=${branchId}&preview=true`);
    }
  };

  // Common action buttons component
  const ActionButtons = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        onClick={handleStartOrdering}
        disabled={!branchId}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Menu</span>
        </div>
      </button>

      <button className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-600 opacity-75 cursor-not-allowed">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-900">My Order</span>
        </div>
      </button>

      <button className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-600 opacity-75 cursor-not-allowed">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <Bell className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Call Staff</span>
        </div>
      </button>

      <button className="bg-green-600 rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:bg-green-700 opacity-75 cursor-not-allowed">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Payment</span>
        </div>
      </button>
    </div>
  );

  // Info Card component
  const InfoCard = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
          <div>
            <p className="font-semibold text-gray-900">Địa chỉ</p>
            <p className="text-gray-600">200 Quang Trung, Gò Vấp, TP.HCM</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
          <div>
            <p className="font-semibold text-gray-900">Điện thoại</p>
            <p className="text-gray-600">0905678901</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
          <div>
            <p className="font-semibold text-gray-900">Giờ mở cửa</p>
            <p className="text-gray-600">8:00 - 22:00 hàng ngày</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
          <div>
            <p className="font-semibold text-gray-900">Bàn của bạn</p>
            <p className="text-gray-600">Table 1 - Khu Máy Lạnh</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Preview Notice component
  const PreviewNotice = () => (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
        <p className="text-indigo-700 text-sm font-medium">
          🎨 Đây là trang preview - Khách hàng sẽ thấy giao diện này khi quét QR code
        </p>
      </div>
    </div>
  );

  // DEFAULT Layout
  if (layoutType === 'DEFAULT') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div 
          className="relative h-[400px] bg-cover bg-center"
          style={{ backgroundImage: `url('${displayBanner}')`, backgroundColor: '#6366f1' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"></div>
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                <UtensilsCrossed className="w-12 h-12 text-indigo-600" />
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">{displayName}</h1>
            <p className="text-xl md:text-2xl text-yellow-400">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold transition-transform hover:scale-105 hover:bg-indigo-700 disabled:opacity-50">
              Khám phá thực đơn
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
          <InfoCard />
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-8 mb-8">
          <ActionButtons />
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // MINIMAL Layout
  if (layoutType === 'MINIMAL') {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-10 h-10 text-gray-600" />
              </div>
            )}
            <h1 className="text-4xl font-light mb-2 text-gray-900">{displayName}</h1>
            <p className="text-lg text-gray-500 mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded font-medium hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50">
              Xem menu
            </button>
          </div>

          <div className="border-t border-b border-gray-200 py-8 mb-8">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Địa chỉ</p>
                <p className="text-gray-900">200 Quang Trung, Gò Vấp</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Điện thoại</p>
                <p className="text-gray-900">0905678901</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Giờ mở cửa</p>
                <p className="text-gray-900">8:00 - 22:00</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Bàn</p>
                <p className="text-gray-900">Table 1 - Khu Máy Lạnh</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={handleStartOrdering} disabled={!branchId} className="py-4 border border-gray-300 rounded hover:border-gray-900 transition-all text-center disabled:opacity-50">
              <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Menu</span>
            </button>
            <button className="py-4 border border-gray-300 rounded hover:border-gray-900 transition-all text-center opacity-75 cursor-not-allowed">
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">My Order</span>
            </button>
            <button className="py-4 border border-gray-300 rounded hover:border-gray-900 transition-all text-center opacity-75 cursor-not-allowed">
              <Bell className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Call Staff</span>
            </button>
            <button className="py-4 bg-gray-900 text-white rounded hover:bg-gray-800 transition-all text-center opacity-75 cursor-not-allowed">
              <Receipt className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Payment</span>
            </button>
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-green-500 text-white px-3 py-1 text-xs font-medium">Occupied</Badge>
        </div>
      </div>
    );
  }

  // CENTERED Layout
  if (layoutType === 'CENTERED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                <UtensilsCrossed className="w-16 h-16 text-indigo-600" />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-3 text-gray-900">{displayName}</h1>
            <p className="text-2xl text-indigo-600 mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 disabled:opacity-50">
              Bắt đầu đặt món
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <InfoCard />
          </div>

          <ActionButtons />
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // GRADIENT Layout
  if (layoutType === 'GRADIENT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-28 h-28 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-2xl" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-2xl">
                <UtensilsCrossed className="w-14 h-14 text-indigo-600" />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-3 text-white">{displayName}</h1>
            <p className="text-2xl text-yellow-300 mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-10 py-4 bg-white text-indigo-600 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50">
              Xem thực đơn ngay
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-8">
            <InfoCard />
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-8">
            <ActionButtons />
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // MODERN Layout
  if (layoutType === 'MODERN') {
    return (
      <div className="min-h-screen bg-gray-900">
        <div 
          className="relative h-[300px] bg-cover bg-center"
          style={{ backgroundImage: `url('${displayBanner}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 border-4 border-gray-800 shadow-2xl" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4 border-4 border-gray-800 shadow-2xl">
                <UtensilsCrossed className="w-12 h-12 text-white" />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-2 text-white">{displayName}</h1>
            <p className="text-xl text-gray-300 mb-6">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50">
              Đặt món ngay
            </button>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-gray-400 text-xs">Địa chỉ</p>
                  <p className="text-white">200 Quang Trung, Gò Vấp</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-gray-400 text-xs">Điện thoại</p>
                  <p className="text-white">0905678901</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-gray-400 text-xs">Giờ mở cửa</p>
                  <p className="text-white">8:00 - 22:00</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-gray-400 text-xs">Bàn</p>
                  <p className="text-white">Table 1 - Khu Máy Lạnh</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <button onClick={handleStartOrdering} disabled={!branchId} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 transition-all disabled:opacity-50">
              <ShoppingCart className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <span className="text-sm text-white block">Menu</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 transition-all opacity-75 cursor-not-allowed">
              <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <span className="text-sm text-white block">My Order</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 transition-all opacity-75 cursor-not-allowed">
              <Bell className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <span className="text-sm text-white block">Call Staff</span>
            </button>
            <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl p-4 transition-all opacity-75 cursor-not-allowed">
              <Receipt className="w-6 h-6 text-white mx-auto mb-2" />
              <span className="text-sm text-white block">Payment</span>
            </button>
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // ELEGANT Layout
  if (layoutType === 'ELEGANT') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-8 border-white shadow-xl ring-4 ring-amber-200" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-xl ring-4 ring-amber-200">
                <UtensilsCrossed className="w-16 h-16 text-amber-600" />
              </div>
            )}
            <h1 className="text-5xl font-serif font-bold mb-3 text-gray-900">{displayName}</h1>
            <div className="w-24 h-1 bg-amber-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600 italic mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-10 py-4 bg-amber-600 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-amber-700 transition-all hover:scale-105 disabled:opacity-50">
              Khám phá thực đơn
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-4 border-amber-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Địa chỉ</p>
                  <p className="text-gray-600">200 Quang Trung, Gò Vấp, TP.HCM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Điện thoại</p>
                  <p className="text-gray-600">0905678901</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Giờ mở cửa</p>
                  <p className="text-gray-600">8:00 - 22:00 hàng ngày</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Bàn của bạn</p>
                  <p className="text-gray-600">Table 1 - Khu Máy Lạnh</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button onClick={handleStartOrdering} disabled={!branchId} className="bg-white hover:bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 transition-all shadow-md hover:shadow-xl disabled:opacity-50">
              <ShoppingCart className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <span className="text-sm font-semibold text-gray-900 block">Menu</span>
            </button>
            <button className="bg-white hover:bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 transition-all shadow-md hover:shadow-xl opacity-75 cursor-not-allowed">
              <FileText className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <span className="text-sm font-semibold text-gray-900 block">My Order</span>
            </button>
            <button className="bg-white hover:bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 transition-all shadow-md hover:shadow-xl opacity-75 cursor-not-allowed">
              <Bell className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <span className="text-sm font-semibold text-gray-900 block">Call Staff</span>
            </button>
            <button className="bg-amber-600 hover:bg-amber-700 rounded-2xl p-6 transition-all shadow-md hover:shadow-xl opacity-75 cursor-not-allowed">
              <Receipt className="w-8 h-8 text-white mx-auto mb-2" />
              <span className="text-sm font-semibold text-white block">Payment</span>
            </button>
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-lg rounded-full">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // OCEAN Layout
  if (layoutType === 'OCEAN') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-2xl">
                <UtensilsCrossed className="w-16 h-16 text-blue-600" />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-lg">{displayName}</h1>
            <p className="text-2xl text-cyan-100 mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50">
              Khám phá thực đơn
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8">
            <InfoCard />
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
            <ActionButtons />
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // SUNSET Layout
  if (layoutType === 'SUNSET') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-2xl ring-4 ring-orange-200" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-2xl ring-4 ring-orange-200">
                <UtensilsCrossed className="w-16 h-16 text-orange-600" />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-lg">{displayName}</h1>
            <p className="text-2xl text-yellow-100 mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-10 py-4 bg-white text-orange-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50">
              Đặt món ngay
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <InfoCard />
          </div>

          <div className="mb-8">
            <ActionButtons />
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-white text-orange-600 px-4 py-2 text-sm font-bold shadow-lg">
            <div className="w-2 h-2 bg-orange-600 rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // FOREST Layout
  if (layoutType === 'FOREST') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-400 via-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-2xl">
                <UtensilsCrossed className="w-16 h-16 text-green-600" />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-lg">{displayName}</h1>
            <p className="text-2xl text-green-100 mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-10 py-4 bg-white text-green-700 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50">
              Xem thực đơn
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8">
            <InfoCard />
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
            <ActionButtons />
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-white text-green-700 px-4 py-2 text-sm font-bold shadow-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // ROSE Layout
  if (layoutType === 'ROSE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-rose-400 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-36 h-36 rounded-full object-cover mx-auto mb-6 border-8 border-white shadow-2xl ring-4 ring-pink-200" />
            ) : (
              <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-2xl ring-4 ring-pink-200">
                <UtensilsCrossed className="w-18 h-18 text-pink-600" />
              </div>
            )}
            <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-2xl">{displayName}</h1>
            <div className="w-32 h-1 bg-white mx-auto mb-4 rounded-full"></div>
            <p className="text-2xl text-pink-50 italic mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-12 py-4 bg-white text-pink-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-110 disabled:opacity-50">
              Khám phá menu
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-200">
            <InfoCard />
          </div>

          <div className="mb-8">
            <ActionButtons />
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-white text-pink-600 px-4 py-2 text-sm font-bold shadow-lg rounded-full">
            <div className="w-2 h-2 bg-pink-600 rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // MIDNIGHT Layout
  if (layoutType === 'MIDNIGHT') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-purple-300 shadow-2xl shadow-purple-500/50" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-6 border-4 border-purple-300 shadow-2xl shadow-purple-500/50">
                <UtensilsCrossed className="w-16 h-16 text-white" />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">{displayName}</h1>
            <p className="text-2xl text-purple-200 mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-xl shadow-purple-500/50 hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50">
              Khám phá thực đơn
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border border-purple-400/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <p className="font-semibold text-purple-100 mb-1">Địa chỉ</p>
                  <p className="text-purple-200">200 Quang Trung, Gò Vấp</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <p className="font-semibold text-purple-100 mb-1">Điện thoại</p>
                  <p className="text-purple-200">0905678901</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <p className="font-semibold text-purple-100 mb-1">Giờ mở cửa</p>
                  <p className="text-purple-200">8:00 - 22:00</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <p className="font-semibold text-purple-100 mb-1">Bàn</p>
                  <p className="text-purple-200">Table 1 - Khu Máy Lạnh</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button onClick={handleStartOrdering} disabled={!branchId} className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-purple-400/30 rounded-2xl p-6 transition-all disabled:opacity-50">
              <ShoppingCart className="w-8 h-8 text-purple-200 mx-auto mb-2" />
              <span className="text-sm font-semibold text-purple-100 block">Menu</span>
            </button>
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-purple-400/30 rounded-2xl p-6 transition-all opacity-75 cursor-not-allowed">
              <FileText className="w-8 h-8 text-purple-200 mx-auto mb-2" />
              <span className="text-sm font-semibold text-purple-100 block">My Order</span>
            </button>
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-purple-400/30 rounded-2xl p-6 transition-all opacity-75 cursor-not-allowed">
              <Bell className="w-8 h-8 text-purple-200 mx-auto mb-2" />
              <span className="text-sm font-semibold text-purple-100 block">Call Staff</span>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl p-6 transition-all opacity-75 cursor-not-allowed">
              <Receipt className="w-8 h-8 text-white mx-auto mb-2" />
              <span className="text-sm font-semibold text-white block">Payment</span>
            </button>
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // COFFEE Layout
  if (layoutType === 'COFFEE') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-amber-800 shadow-xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-amber-800 flex items-center justify-center mx-auto mb-6 border-4 border-amber-800 shadow-xl">
                <UtensilsCrossed className="w-16 h-16 text-amber-100" />
              </div>
            )}
            <h1 className="text-5xl font-serif font-bold mb-3 text-amber-900">{displayName}</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-0.5 bg-amber-600"></div>
              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
              <div className="w-12 h-0.5 bg-amber-600"></div>
            </div>
            <p className="text-xl text-amber-700 italic mb-8">{displayTagline}</p>
            <button onClick={handleStartOrdering} disabled={!branchId} className="px-10 py-4 bg-amber-800 text-amber-50 rounded-lg font-semibold text-lg shadow-lg hover:bg-amber-900 transition-all hover:scale-105 disabled:opacity-50">
              Xem thực đơn
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-amber-200">
            <InfoCard />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button onClick={handleStartOrdering} disabled={!branchId} className="bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-xl p-6 transition-all shadow-md disabled:opacity-50">
              <ShoppingCart className="w-8 h-8 text-amber-700 mx-auto mb-2" />
              <span className="text-sm font-semibold text-amber-900 block">Menu</span>
            </button>
            <button className="bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-xl p-6 transition-all shadow-md opacity-75 cursor-not-allowed">
              <FileText className="w-8 h-8 text-amber-700 mx-auto mb-2" />
              <span className="text-sm font-semibold text-amber-900 block">My Order</span>
            </button>
            <button className="bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-xl p-6 transition-all shadow-md opacity-75 cursor-not-allowed">
              <Bell className="w-8 h-8 text-amber-700 mx-auto mb-2" />
              <span className="text-sm font-semibold text-amber-900 block">Call Staff</span>
            </button>
            <button className="bg-amber-800 hover:bg-amber-900 rounded-xl p-6 transition-all shadow-md opacity-75 cursor-not-allowed">
              <Receipt className="w-8 h-8 text-amber-50 mx-auto mb-2" />
              <span className="text-sm font-semibold text-amber-50 block">Payment</span>
            </button>
          </div>
        </div>

        <PreviewNotice />

        <div className="fixed top-4 right-4 z-50">
          <Badge className="bg-amber-800 text-amber-50 px-4 py-2 text-sm font-semibold shadow-lg">
            <div className="w-2 h-2 bg-amber-50 rounded-full mr-2 animate-pulse" />
            Đang phục vụ
          </Badge>
        </div>
      </div>
    );
  }

  // Fallback to DEFAULT for any unknown layout types
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `url('${displayBanner}')`,
          backgroundColor: '#6366f1'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          {displayLogo ? (
            <img 
              src={displayLogo} 
              alt="Logo" 
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 border-4 border-white shadow-lg">
              <UtensilsCrossed className="w-12 h-12 text-indigo-600" />
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
            {displayName}
          </h1>
          
          <p className="text-xl md:text-2xl text-yellow-400">
            {displayTagline}
          </p>
          
          <button 
            onClick={handleStartOrdering}
            disabled={!branchId}
            className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold transition-transform hover:scale-105 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Khám phá thực đơn
          </button>
        </div>
      </div>

      {/* Restaurant Info Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">Địa chỉ</p>
                <p className="text-gray-600">200 Quang Trung, Gò Vấp, TP.HCM</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">Điện thoại</p>
                <p className="text-gray-600">0905678901</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">Giờ mở cửa</p>
                <p className="text-gray-600">8:00 - 22:00 hàng ngày</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">Bàn của bạn</p>
                <p className="text-gray-600">Table 1 - Khu Máy Lạnh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="max-w-4xl mx-auto px-4 mt-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleStartOrdering}
            disabled={!branchId}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Menu</span>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-600 opacity-75 cursor-not-allowed">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">My Order</span>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-600 opacity-75 cursor-not-allowed">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Call Staff</span>
            </div>
          </button>

          <button className="bg-green-600 rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:bg-green-700 opacity-75 cursor-not-allowed">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Payment</span>
            </div>
          </button>
        </div>
      </div>

      {/* Preview Notice */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
          <p className="text-indigo-700 text-sm font-medium">
            🎨 Đây là trang preview - Khách hàng sẽ thấy giao diện này khi quét QR code
          </p>
        </div>
      </div>

      {/* Table Status Badge */}
      <div className="fixed top-4 right-4 z-50">
        <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
          Đang phục vụ
        </Badge>
      </div>
    </div>
  );
}
