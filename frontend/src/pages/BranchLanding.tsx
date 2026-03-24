import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface LandingData {
  branch: {
    id: string;
    name: string;
    address: string;
    phone: string;
    slug: string;
  };
  branding: {
    brandName: string;
    tagline: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    galleryImages: string[];
    sliderImages: string[];
    layoutType: string;
  };
  theme: {
    name: string;
    category: string;
    colors: Record<string, string>;
  };
}

export default function BranchLanding() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const response = await fetch(`/api/v1/branding/landing/${slug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load landing page');
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchLandingData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải trang</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy dữ liệu</p>
        </div>
      </div>
    );
  }

  const { branding, branch, theme } = data;
  const colors = theme?.colors || {};

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: colors.pageBackground ? `hsl(${colors.pageBackground})` : '#f9fafb'
      }}
    >
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: branding.bannerUrl ? `url(${branding.bannerUrl})` : 'none',
          backgroundColor: colors.heroBackground ? `hsl(${colors.heroBackground})` : '#6366f1'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          {branding.logoUrl && (
            <img 
              src={branding.logoUrl} 
              alt="Logo" 
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow-lg"
            />
          )}
          
          <h1 
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{ color: colors.heroText ? `hsl(${colors.heroText})` : 'white' }}
          >
            {branding.brandName || branch.name}
          </h1>
          
          {branding.tagline && (
            <p 
              className="text-xl md:text-2xl"
              style={{ color: colors.heroAccent ? `hsl(${colors.heroAccent})` : '#fbbf24' }}
            >
              {branding.tagline}
            </p>
          )}
          
          <button 
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 px-8 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
            style={{
              backgroundColor: colors.buttonPrimary ? `hsl(${colors.buttonPrimary})` : '#6366f1',
              color: colors.buttonPrimaryText ? `hsl(${colors.buttonPrimaryText})` : 'white'
            }}
          >
            Khám phá thực đơn
          </button>
        </div>
      </div>

      {/* Restaurant Info Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div 
          className="rounded-lg shadow-lg p-6"
          style={{
            backgroundColor: colors.cardBackground ? `hsl(${colors.cardBackground})` : 'white',
            borderColor: colors.cardBorder ? `hsl(${colors.cardBorder})` : '#e5e7eb',
            borderWidth: '1px'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: colors.heroAccent ? `hsl(${colors.heroAccent})` : '#6366f1' }} />
              <div>
                <p className="font-semibold" style={{ color: colors.headingColor ? `hsl(${colors.headingColor})` : '#111827' }}>
                  Địa chỉ
                </p>
                <p style={{ color: colors.bodyTextColor ? `hsl(${colors.bodyTextColor})` : '#6b7280' }}>
                  {branch.address}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: colors.heroAccent ? `hsl(${colors.heroAccent})` : '#6366f1' }} />
              <div>
                <p className="font-semibold" style={{ color: colors.headingColor ? `hsl(${colors.headingColor})` : '#111827' }}>
                  Điện thoại
                </p>
                <p style={{ color: colors.bodyTextColor ? `hsl(${colors.bodyTextColor})` : '#6b7280' }}>
                  {branch.phone}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: colors.heroAccent ? `hsl(${colors.heroAccent})` : '#6366f1' }} />
              <div>
                <p className="font-semibold" style={{ color: colors.headingColor ? `hsl(${colors.headingColor})` : '#111827' }}>
                  Giờ mở cửa
                </p>
                <p style={{ color: colors.bodyTextColor ? `hsl(${colors.bodyTextColor})` : '#6b7280' }}>
                  8:00 - 22:00 hàng ngày
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {branding.description && (
        <div className="max-w-4xl mx-auto px-4 mt-12">
          <p 
            className="text-center text-lg leading-relaxed"
            style={{ color: colors.bodyTextColor ? `hsl(${colors.bodyTextColor})` : '#6b7280' }}
          >
            {branding.description}
          </p>
        </div>
      )}

      {/* Menu Section Placeholder */}
      <div id="menu" className="max-w-6xl mx-auto px-4 py-16">
        <h2 
          className="text-3xl font-bold text-center mb-8"
          style={{ color: colors.headingColor ? `hsl(${colors.headingColor})` : '#111827' }}
        >
          Thực đơn
        </h2>
        <div className="text-center" style={{ color: colors.bodyTextColor ? `hsl(${colors.bodyTextColor})` : '#6b7280' }}>
          <p>Menu items sẽ được hiển thị ở đây</p>
          <p className="text-sm mt-2">Đang phát triển...</p>
        </div>
      </div>

      {/* Reserve Button */}
      <button
        className="fixed bottom-6 right-6 px-6 py-3 rounded-full shadow-lg font-semibold transition-transform hover:scale-110 z-50"
        style={{
          backgroundColor: colors.buttonPrimary ? `hsl(${colors.buttonPrimary})` : '#6366f1',
          color: colors.buttonPrimaryText ? `hsl(${colors.buttonPrimaryText})` : 'white'
        }}
      >
        Đặt bàn
      </button>
    </div>
  );
}
