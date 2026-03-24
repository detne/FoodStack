import { useState, useEffect } from 'react';
import { Check, Crown, Sparkles } from 'lucide-react';

interface Theme {
  _id: string;
  name: string;
  category: 'dark' | 'light';
  description: string;
  colors: {
    pageBackground: string;
    heroBackground: string;
    heroText: string;
    heroAccent: string;
    cardBackground: string;
    cardBorder: string;
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    headingColor: string;
    bodyTextColor: string;
  };
  package_required: 'FREE' | 'PRO' | 'VIP';
  is_active: boolean;
}

interface ThemeSelectorProps {
  selectedTheme: Theme | null;
  onThemeSelect: (theme: Theme) => void;
  userPackage: 'FREE' | 'PRO' | 'VIP';
}

export default function ThemeSelector({ selectedTheme, onThemeSelect, userPackage }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'dark' | 'light'>('all');

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/v1/branding/themes');
        const result = await response.json();
        
        if (result.success) {
          setThemes(result.data);
        }
      } catch (error) {
        console.error('Error fetching themes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  const canUseTheme = (theme: Theme) => {
    const packageHierarchy = { FREE: 0, PRO: 1, VIP: 2 };
    return packageHierarchy[userPackage] >= packageHierarchy[theme.package_required];
  };

  const getPackageIcon = (packageRequired: string) => {
    switch (packageRequired) {
      case 'PRO':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'VIP':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const filteredThemes = themes.filter(theme => {
    if (activeCategory === 'all') return true;
    return theme.category === activeCategory;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme Selection</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Theme Selection</h3>
        <div className="text-sm text-gray-500">
          Package: <span className="font-medium text-purple-600">{userPackage}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'light', label: 'Sáng' },
          { key: 'dark', label: 'Tối' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredThemes.map((theme) => {
          const isSelected = selectedTheme?._id === theme._id;
          const canUse = canUseTheme(theme);
          
          return (
            <div
              key={theme._id}
              className={`relative group cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-purple-500 ring-offset-2' 
                  : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              } ${!canUse ? 'opacity-50' : ''}`}
              onClick={() => canUse && onThemeSelect(theme)}
            >
              {/* Theme Preview */}
              <div 
                className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200"
                style={{ backgroundColor: `hsl(${theme.colors.pageBackground})` }}
              >
                {/* Hero Section Preview */}
                <div 
                  className="h-1/2 relative"
                  style={{ backgroundColor: `hsl(${theme.colors.heroBackground})` }}
                >
                  <div className="absolute inset-0 p-2 flex flex-col justify-center items-center">
                    <div 
                      className="w-6 h-6 rounded-full mb-1"
                      style={{ backgroundColor: `hsl(${theme.colors.heroAccent})` }}
                    ></div>
                    <div 
                      className="h-1 w-12 rounded mb-1"
                      style={{ backgroundColor: `hsl(${theme.colors.heroText})` }}
                    ></div>
                    <div 
                      className="h-1 w-8 rounded"
                      style={{ backgroundColor: `hsl(${theme.colors.heroAccent})` }}
                    ></div>
                  </div>
                </div>
                
                {/* Content Section Preview */}
                <div className="h-1/2 p-2 space-y-1">
                  <div 
                    className="h-1 w-full rounded"
                    style={{ backgroundColor: `hsl(${theme.colors.cardBackground})` }}
                  ></div>
                  <div className="grid grid-cols-2 gap-1">
                    <div 
                      className="h-4 rounded"
                      style={{ backgroundColor: `hsl(${theme.colors.cardBackground})` }}
                    ></div>
                    <div 
                      className="h-4 rounded"
                      style={{ backgroundColor: `hsl(${theme.colors.cardBackground})` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Theme Info */}
              <div className="mt-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <h4 className="text-sm font-medium">{theme.name}</h4>
                  {getPackageIcon(theme.package_required)}
                </div>
                <p className="text-xs text-gray-500">{theme.description}</p>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Package Lock Overlay */}
              {!canUse && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="mb-1">
                      {getPackageIcon(theme.package_required)}
                    </div>
                    <div className="text-xs font-medium">
                      {theme.package_required}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Package Upgrade Notice */}
      {userPackage === 'FREE' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">Nâng cấp để mở khóa thêm themes</h4>
              <p className="text-sm text-purple-700 mt-1">
                Gói PRO: 6 themes cao cấp • Gói VIP: Tất cả 8 themes + tính năng độc quyền
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}