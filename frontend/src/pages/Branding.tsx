/**
 * Branding Management
 * Customize branch appearance and themes
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeSelector from '../components/branding/ThemeSelector';
import UpgradePrompt from '../components/UpgradePrompt';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { 
  Palette, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  Copy, 
  Save, 
  Trash2,
  Plus,
  Monitor,
  Smartphone,
  Crown,
  Loader2
} from 'lucide-react';

// Layout configurations with tier requirements
const LAYOUTS = {
  free: ['DEFAULT', 'MINIMAL'],
  pro: ['DEFAULT', 'MINIMAL', 'CENTERED', 'GRADIENT', 'MODERN', 'OCEAN', 'SUNSET', 'FOREST'],
  vip: ['DEFAULT', 'MINIMAL', 'CENTERED', 'GRADIENT', 'MODERN', 'ELEGANT', 'OCEAN', 'SUNSET', 'FOREST', 'ROSE', 'MIDNIGHT', 'COFFEE']
};

// All available layouts for display
const ALL_LAYOUTS = ['DEFAULT', 'MINIMAL', 'CENTERED', 'GRADIENT', 'MODERN', 'ELEGANT', 'OCEAN', 'SUNSET', 'FOREST', 'ROSE', 'MIDNIGHT', 'COFFEE'];

// Layout tier mapping
const LAYOUT_TIERS = {
  DEFAULT: 'free',
  MINIMAL: 'free',
  CENTERED: 'pro',
  GRADIENT: 'pro',
  MODERN: 'pro',
  OCEAN: 'pro',
  SUNSET: 'pro',
  FOREST: 'pro',
  ELEGANT: 'vip',
  ROSE: 'vip',
  MIDNIGHT: 'vip',
  COFFEE: 'vip'
};

export default function Branding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('images');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState('DEFAULT');
  const [userPackage, setUserPackage] = useState('free'); // Will be updated from subscription API
  const [subscription, setSubscription] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branchSlug, setBranchSlug] = useState(null);
  const [themes, setThemes] = useState([]);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState(null);
  
  // Image states
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  
  // Content states
  const [brandInfo, setBrandInfo] = useState({
    name: '',
    tagline: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    aboutSection1: { title: '', text: '', image: null },
    aboutSection2: { title: '', text: '', image: null }
  });

  const fileInputRefs = {
    logo: useRef(null),
    banner: useRef(null),
    gallery: useRef(null),
    slider: useRef(null),
    about1: useRef(null),
    about2: useRef(null)
  };

  // Load themes from API
  useEffect(() => {
    const loadThemes = async () => {
      try {
        setLoadingThemes(true);
        const response = await apiClient.get('/branding/themes');
        setThemes(response.data || []);
      } catch (error) {
        console.error('Error loading themes:', error);
        toast.error('Không thể tải danh sách theme');
      } finally {
        setLoadingThemes(false);
      }
    };

    loadThemes();
  }, []);

  // Load subscription to determine user package
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        console.log('Fetching subscription for branding page...');
        const response = await apiClient.getCurrentSubscription();
        console.log('Subscription response:', response);
        
        if (response.success && response.data) {
          setSubscription(response.data);
          // Set user package based on plan_type
          const planType = response.data.plan_type?.toLowerCase() || 'free';
          setUserPackage(planType);
          console.log('User package set to:', planType);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
        // Default to free if error
        setUserPackage('free');
      }
    };
    loadSubscription();
  }, []);

  // Load branding data from API (Restaurant level for Owner)
  useEffect(() => {
    const loadBranding = async () => {
      try {
        setLoading(true);
        
        // Get restaurant ID from user context
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const restaurantId = user.restaurantId;
        
        if (!restaurantId) {
          toast.error('Không tìm thấy nhà hàng');
          return;
        }
        
        console.log('Loading branding for restaurant:', restaurantId);
        
        // Load restaurant-level branding (applies to all branches)
        const response = await apiClient.get(`/branding/restaurant/${restaurantId}`);
        console.log('Branding response:', response);
        const data = response.data;
        console.log('Branding data:', data);
        
        // Map API data to state
        if (data.selectedThemeId || data.selected_theme_id) {
          const themeId = data.selectedThemeId || data.selected_theme_id;
          const theme = themes.find(t => t._id === themeId);
          setSelectedTheme(theme);
        }
        setSelectedLayout(data.layoutType || data.layout_type || 'DEFAULT');
        
        // Handle both camelCase and snake_case from API
        const logoUrl = data.logoUrl || data.logo_url;
        const bannerUrl = data.bannerUrl || data.banner_url;
        
        setLogo(logoUrl ? { file: logoUrl, name: 'logo' } : null);
        setBanner(bannerUrl ? { file: bannerUrl, name: 'banner' } : null);
        
        // Handle gallery and slider images
        const galleryImgs = data.galleryImages || data.gallery_images || [];
        const sliderImgs = data.sliderImages || data.slider_images || [];
        
        setGalleryImages(galleryImgs.map((url: string) => ({ file: url, name: 'gallery' })));
        setSliderImages(sliderImgs.map((url: string) => ({ file: url, name: 'slider' })));
        
        setBrandInfo({
          name: data.brandName || data.brand_name || '',
          tagline: data.tagline || '',
          description: data.description || '',
          phone: data.publicPhone || data.public_phone || '',
          email: data.publicEmail || data.public_email || '',
          address: data.address || '',
          aboutSection1: data.aboutSection1 || data.about_section_1 || { title: '', text: '', image: null },
          aboutSection2: data.aboutSection2 || data.about_section_2 || { title: '', text: '', image: null }
        });

        // Set branch slug for preview
        setBranchSlug(data.slug);
        
      } catch (error) {
        console.error('Error loading branding:', error);
        toast.error('Không thể tải dữ liệu branding');
      } finally {
        setLoading(false);
      }
    };

    if (themes.length > 0) {
      loadBranding();
    }
  }, [themes]);

  // File upload handler with API integration
  const handleFileUpload = async (file, type, index = null) => {
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được vượt quá 5MB');
      return;
    }

    try {
      // Get API base URL from environment
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      
      // Upload to branding endpoint
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageType', type);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/branding/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${uploadResponse.status} ${uploadResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.data?.imageUrl;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      const imageData = {
        file: imageUrl,
        name: file.name,
        size: file.size
      };

      switch (type) {
        case 'logo':
          setLogo(imageData);
          break;
        case 'banner':
          setBanner(imageData);
          break;
        case 'gallery':
          setGalleryImages(prev => [...prev, imageData]);
          break;
        case 'slider':
          if (userPackage === 'vip') {
            setSliderImages(prev => [...prev, imageData]);
          }
          break;
        case 'about1':
          setBrandInfo(prev => ({
            ...prev,
            aboutSection1: { ...prev.aboutSection1, image: imageData }
          }));
          break;
        case 'about2':
          setBrandInfo(prev => ({
            ...prev,
            aboutSection2: { ...prev.aboutSection2, image: imageData }
          }));
          break;
      }
      toast.success('Tải ảnh thành công');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Không thể tải ảnh lên: ${error.message}`);
    }
  };

  // Save all changes to API (Restaurant level for Owner)
  const handleSaveAll = async () => {
    console.log('handleSaveAll - currentBranchId:', currentBranchId);
    
    // For Owner, save at restaurant level instead of branch level
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const restaurantId = user.restaurantId;
    
    if (!restaurantId) {
      toast.error('Không tìm thấy nhà hàng');
      return;
    }

    try {
      setSaving(true);
      
      const data = {
        brandName: brandInfo.name,
        tagline: brandInfo.tagline,
        description: brandInfo.description,
        logoUrl: logo?.file || null,
        bannerUrl: banner?.file || null,
        selectedThemeId: selectedTheme?._id || null,
        customThemeColors: selectedTheme ? {
          primaryColor: selectedTheme.primary_color,
          secondaryColor: selectedTheme.secondary_color,
          accentColor: selectedTheme.accent_color,
          backgroundColor: selectedTheme.background_color,
          textColor: selectedTheme.text_color,
          textSecondary: selectedTheme.text_secondary,
        } : null,
        layoutType: selectedLayout,
        galleryImages: galleryImages.map(img => img.file),
        sliderImages: sliderImages.map(img => img.file),
        aboutSection1: brandInfo.aboutSection1,
        aboutSection2: brandInfo.aboutSection2,
        isPublished: true,
      };
      
      console.log('handleSaveAll - Saving for restaurant:', restaurantId);
      console.log('handleSaveAll - Data:', data);
      
      // Save at restaurant level (applies to all branches)
      const result = await apiClient.put(`/branding/restaurant/${restaurantId}`, data);
      
      // Update slug if returned
      if (result.data?.slug) {
        setBranchSlug(result.data.slug);
      }
      
      toast.success('Đã lưu branding cho tất cả chi nhánh');
      
      // Notify preview page to reload
      localStorage.setItem('branding_updated', Date.now().toString());
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Không thể lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  // Preview landing page (use first branch for preview)
  const handlePreview = () => {
    // Get restaurant ID from user context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const restaurantId = user.restaurantId;
    
    if (!restaurantId) {
      toast.error('Không tìm thấy nhà hàng');
      return;
    }
    
    // Navigate to customer preview page in same tab (don't open new tab to avoid auth issues)
    window.location.href = `/restaurant/${restaurantId}/customer-preview`;
  };

  // Copy URL (use first branch URL)
  const handleCopyURL = async () => {
    try {
      const branchesResponse = await apiClient.getBranches();
      if (branchesResponse.data && branchesResponse.data.length > 0) {
        const firstBranch = branchesResponse.data[0];
        if (firstBranch.slug) {
          const url = `${window.location.origin}/branch/${firstBranch.slug}`;
          navigator.clipboard.writeText(url);
          toast.success('Đã sao chép URL');
        } else {
          toast.error('Chi nhánh chưa có slug');
        }
      } else {
        toast.error('Không tìm thấy chi nhánh');
      }
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Không thể sao chép URL');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Branding & Customization</h1>
            <p className="text-muted-foreground">Tùy chỉnh giao diện và thương hiệu của bạn</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={userPackage === 'vip' ? 'default' : userPackage === 'pro' ? 'secondary' : 'outline'} className="text-sm">
            {userPackage === 'vip' && <Crown className="w-3 h-3 mr-1" />}
            {userPackage.toUpperCase()}
          </Badge>
          {userPackage !== 'vip' && (
            <Button 
              onClick={() => navigate('/pricing')} 
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Nâng cấp {userPackage === 'free' ? 'PRO' : 'VIP'}
            </Button>
          )}
          <Button onClick={handlePreview} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleCopyURL} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy URL
          </Button>
          <Button onClick={handleSaveAll} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Đang lưu...' : 'Lưu tất cả'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
          <TabsTrigger value="themes">Theme</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Logo Nhà Hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors min-h-[200px] flex items-center justify-center"
                    onClick={() => fileInputRefs.logo.current?.click()}
                  >
                    {logo ? (
                      <div className="space-y-2 w-full">
                        <div className="relative w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg">
                          <img 
                            src={logo.file} 
                            alt="Logo" 
                            className="max-h-36 max-w-full object-contain"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{logo.name}</p>
                        <p className="text-xs text-green-600 font-medium">✓ Logo đã được tải lên</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click để tải logo</p>
                        <p className="text-xs text-gray-400">PNG, JPG tối đa 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.logo}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                  />
                  {logo && (
                    <Button variant="outline" size="sm" onClick={() => setLogo(null)} className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa logo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Banner Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Banner Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors min-h-[200px] flex items-center justify-center"
                    onClick={() => fileInputRefs.banner.current?.click()}
                  >
                    {banner ? (
                      <div className="space-y-2 w-full">
                        <div className="relative w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                          <img 
                            src={banner.file} 
                            alt="Banner" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{banner.name}</p>
                        <p className="text-xs text-green-600 font-medium">✓ Banner đã được tải lên</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click để tải banner</p>
                        <p className="text-xs text-gray-400">PNG, JPG tối đa 5MB (1200x400 khuyến nghị)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.banner}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'banner')}
                  />
                  {banner && (
                    <Button variant="outline" size="sm" onClick={() => setBanner(null)} className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa banner
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gallery Images */}
          {(userPackage === 'pro' || userPackage === 'vip') ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Gallery Images
                  <Badge variant="secondary">PRO+</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRefs.gallery.current?.click()}
                  >
                    <Plus className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Thêm ảnh gallery</p>
                  </div>
                  <input
                    ref={fileInputRefs.gallery}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      Array.from(e.target.files).forEach(file => 
                        handleFileUpload(file, 'gallery')
                      );
                    }}
                  />
                  
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img.file} alt={`Gallery ${index}`} className="w-full h-24 object-cover rounded" />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <UpgradePrompt 
              requiredPlan="pro"
              feature="Gallery Images"
              description="Thêm nhiều ảnh để khách hàng xem trước không gian nhà hàng của bạn"
            />
          )}

          {/* Image Slider - VIP Only */}
          {userPackage === 'vip' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image Slider
                  <Badge variant="default">
                    <Crown className="w-3 h-3 mr-1" />
                    VIP
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRefs.slider.current?.click()}
                  >
                    <Plus className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Thêm ảnh slider</p>
                  </div>
                  <input
                    ref={fileInputRefs.slider}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      Array.from(e.target.files).forEach(file => 
                        handleFileUpload(file, 'slider')
                      );
                    }}
                  />
                  
                  {sliderImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {sliderImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img.file} alt={`Slider ${index}`} className="w-full h-24 object-cover rounded" />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSliderImages(prev => prev.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <UpgradePrompt 
              requiredPlan="vip"
              feature="Image Slider"
              description="Tạo slider ảnh động đẹp mắt cho trang landing của bạn"
            />
          )}
        </TabsContent>  
        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          {userPackage === 'free' ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nâng cấp để sử dụng Theme</h3>
                  <p className="text-muted-foreground mb-4">
                    Tính năng chọn theme chỉ có trong gói Pro và VIP
                  </p>
                  <Button onClick={() => navigate('/pricing')}>Nâng cấp ngay</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {loadingThemes ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p>Đang tải themes...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Group themes by category */}
                  {['LIGHT', 'DARK', 'COLORFUL', 'MINIMAL'].map(category => {
                    const categoryThemes = themes.filter(theme => theme.category === category);
                    if (categoryThemes.length === 0) return null;
                    
                    return (
                      <Card key={category}>
                        <CardHeader>
                          <CardTitle>{category} Themes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {categoryThemes.map((theme) => (
                              <div
                                key={theme._id}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  selectedTheme?._id === theme._id ? 'border-primary' : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedTheme(theme)}
                              >
                                <div className="space-y-2">
                                  <div className="h-16 rounded" style={{ backgroundColor: theme.background_color }}>
                                    <div className="h-8 rounded-t" style={{ backgroundColor: theme.primary_color }}></div>
                                    <div className="h-8 rounded-b" style={{ backgroundColor: theme.secondary_color }}></div>
                                  </div>
                                  <p className="text-sm font-medium">{theme.name}</p>
                                  <div className="flex gap-1">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary_color }}></div>
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary_color }}></div>
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent_color }}></div>
                                  </div>
                                  <Badge variant={theme.required_package === 'FREE' ? 'outline' : theme.required_package === 'PRO' ? 'secondary' : 'default'}>
                                    {theme.required_package === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                                    {theme.required_package}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Options</CardTitle>
              <p className="text-sm text-muted-foreground">
                Chọn cách hiển thị landing page của bạn
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_LAYOUTS.map((layout) => {
                  // Check if layout is available for current user package
                  const layoutTier = LAYOUT_TIERS[layout];
                  const isLocked = 
                    (userPackage === 'free' && (layoutTier === 'pro' || layoutTier === 'vip')) ||
                    (userPackage === 'pro' && layoutTier === 'vip');
                  
                  // Define colors and styles for each layout
                  const layoutStyles = {
                    DEFAULT: {
                      bg: 'bg-gradient-to-b from-indigo-500 to-indigo-600',
                      preview: (
                        <div className="h-32 rounded overflow-hidden">
                          <div className="h-20 bg-gradient-to-b from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <div className="w-8 h-8 bg-white rounded-full"></div>
                          </div>
                          <div className="h-12 bg-white -mt-4 rounded-t-2xl"></div>
                        </div>
                      )
                    },
                    MINIMAL: {
                      bg: 'bg-white border-2 border-gray-200',
                      preview: (
                        <div className="h-32 bg-white rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="w-16 h-2 bg-gray-300 rounded"></div>
                          <div className="w-12 h-1 bg-gray-200 rounded"></div>
                        </div>
                      )
                    },
                    CENTERED: {
                      bg: 'bg-gradient-to-br from-indigo-100 to-purple-100',
                      preview: (
                        <div className="h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-white rounded-full shadow-lg"></div>
                          <div className="w-20 h-2 bg-indigo-600 rounded"></div>
                          <div className="w-16 h-6 bg-indigo-600 rounded-full"></div>
                        </div>
                      )
                    },
                    GRADIENT: {
                      bg: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600',
                      preview: (
                        <div className="h-32 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-white rounded-full"></div>
                          <div className="w-20 h-2 bg-yellow-300 rounded"></div>
                          <div className="w-16 h-6 bg-white rounded-lg"></div>
                        </div>
                      )
                    },
                    MODERN: {
                      bg: 'bg-gray-900',
                      preview: (
                        <div className="h-32 bg-gray-900 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-gray-800 rounded-xl"></div>
                          <div className="w-20 h-2 bg-gray-300 rounded"></div>
                          <div className="w-16 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg"></div>
                        </div>
                      )
                    },
                    ELEGANT: {
                      bg: 'bg-gradient-to-b from-amber-50 to-amber-100',
                      preview: (
                        <div className="h-32 bg-gradient-to-b from-amber-50 to-amber-100 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-12 h-12 bg-white rounded-full ring-4 ring-amber-200 shadow-xl"></div>
                          <div className="w-6 h-0.5 bg-amber-500"></div>
                          <div className="w-20 h-2 bg-gray-600 rounded"></div>
                          <div className="w-16 h-6 bg-amber-600 rounded-full"></div>
                        </div>
                      )
                    },
                    OCEAN: {
                      bg: 'bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-700',
                      preview: (
                        <div className="h-32 bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-700 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-white rounded-full shadow-2xl"></div>
                          <div className="w-20 h-2 bg-cyan-100 rounded"></div>
                          <div className="w-16 h-6 bg-white rounded-full"></div>
                        </div>
                      )
                    },
                    SUNSET: {
                      bg: 'bg-gradient-to-br from-orange-400 via-red-400 to-pink-500',
                      preview: (
                        <div className="h-32 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-white rounded-full ring-4 ring-orange-200 shadow-2xl"></div>
                          <div className="w-20 h-2 bg-yellow-100 rounded"></div>
                          <div className="w-16 h-6 bg-white rounded-full"></div>
                        </div>
                      )
                    },
                    FOREST: {
                      bg: 'bg-gradient-to-b from-green-400 via-emerald-500 to-teal-600',
                      preview: (
                        <div className="h-32 bg-gradient-to-b from-green-400 via-emerald-500 to-teal-600 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-white rounded-full shadow-2xl"></div>
                          <div className="w-20 h-2 bg-green-100 rounded"></div>
                          <div className="w-16 h-6 bg-white rounded-full"></div>
                        </div>
                      )
                    },
                    ROSE: {
                      bg: 'bg-gradient-to-br from-pink-300 via-rose-400 to-pink-500',
                      preview: (
                        <div className="h-32 bg-gradient-to-br from-pink-300 via-rose-400 to-pink-500 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-12 h-12 bg-white rounded-full ring-8 ring-white shadow-2xl"></div>
                          <div className="w-8 h-0.5 bg-white rounded-full"></div>
                          <div className="w-20 h-2 bg-pink-50 rounded"></div>
                          <div className="w-16 h-6 bg-white rounded-full"></div>
                        </div>
                      )
                    },
                    MIDNIGHT: {
                      bg: 'bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900',
                      preview: (
                        <div className="h-32 bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-4 border-purple-300 shadow-2xl shadow-purple-500/50"></div>
                          <div className="w-20 h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded"></div>
                          <div className="w-16 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        </div>
                      )
                    },
                    COFFEE: {
                      bg: 'bg-gradient-to-b from-amber-100 to-orange-50',
                      preview: (
                        <div className="h-32 bg-gradient-to-b from-amber-100 to-orange-50 rounded p-4 flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 bg-amber-800 rounded-full shadow-xl"></div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-amber-600"></div>
                            <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                            <div className="w-3 h-0.5 bg-amber-600"></div>
                          </div>
                          <div className="w-20 h-2 bg-amber-700 rounded"></div>
                          <div className="w-16 h-6 bg-amber-800 rounded-lg"></div>
                        </div>
                      )
                    }
                  };

                  return (
                    <div
                      key={layout}
                      className={`rounded-lg border-2 transition-all relative ${
                        isLocked 
                          ? 'border-gray-200 opacity-75 cursor-not-allowed' 
                          : selectedLayout === layout 
                            ? 'border-primary ring-4 ring-primary/20 cursor-pointer hover:scale-105' 
                            : 'border-gray-200 hover:border-gray-300 cursor-pointer hover:scale-105'
                      }`}
                      onClick={() => {
                        if (isLocked) {
                          const requiredTier = layoutTier === 'pro' ? 'PRO' : 'VIP';
                          toast.error(
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">Layout bị khóa</p>
                              <p className="text-sm">Layout "{layout}" yêu cầu gói {requiredTier}. Vui lòng nâng cấp để sử dụng!</p>
                            </div>,
                            {
                              duration: 3000,
                            }
                          );
                        } else {
                          setSelectedLayout(layout);
                        }
                      }}
                    >
                      {/* Lock overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center z-10 backdrop-blur-[2px]">
                          <div className="text-center">
                            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <p className="text-white text-xs font-semibold">
                              {layoutTier === 'pro' ? 'PRO+' : 'VIP'}
                            </p>
                            <p className="text-white text-xs mt-1">Nâng cấp để mở khóa</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3 p-4">
                        {layoutStyles[layout]?.preview}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold capitalize">
                            {layout.replace('_', ' ').toLowerCase()}
                          </p>
                          <div className="flex items-center justify-between">
                            {['DEFAULT', 'MINIMAL'].includes(layout) && (
                              <Badge variant="outline" className="text-xs">FREE</Badge>
                            )}
                            {['CENTERED', 'GRADIENT', 'MODERN', 'OCEAN', 'SUNSET', 'FOREST'].includes(layout) && (
                              <Badge variant="secondary" className="text-xs">PRO+</Badge>
                            )}
                            {['ELEGANT', 'ROSE', 'MIDNIGHT', 'COFFEE'].includes(layout) && (
                              <Badge variant="default" className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                VIP
                              </Badge>
                            )}
                            {!isLocked && selectedLayout === layout && (
                              <span className="text-xs text-primary font-medium">✓ Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Tên thương hiệu</Label>
                  <Input
                    id="brandName"
                    value={brandInfo.name}
                    onChange={(e) => setBrandInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên thương hiệu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Slogan</Label>
                  <Input
                    id="tagline"
                    value={brandInfo.tagline}
                    onChange={(e) => setBrandInfo(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Nhập slogan"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={brandInfo.description}
                  onChange={(e) => setBrandInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả về nhà hàng của bạn"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={brandInfo.phone}
                    onChange={(e) => setBrandInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={brandInfo.email}
                    onChange={(e) => setBrandInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email liên hệ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    value={brandInfo.address}
                    onChange={(e) => setBrandInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Địa chỉ nhà hàng"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About Section 1 */}
            <Card>
              <CardHeader>
                <CardTitle>About Section 1</CardTitle>
                <p className="text-sm text-muted-foreground">Hình ảnh bên phải</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tiêu đề</Label>
                  <Input
                    value={brandInfo.aboutSection1.title}
                    onChange={(e) => setBrandInfo(prev => ({
                      ...prev,
                      aboutSection1: { ...prev.aboutSection1, title: e.target.value }
                    }))}
                    placeholder="Tiêu đề section 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nội dung</Label>
                  <Textarea
                    value={brandInfo.aboutSection1.text}
                    onChange={(e) => setBrandInfo(prev => ({
                      ...prev,
                      aboutSection1: { ...prev.aboutSection1, text: e.target.value }
                    }))}
                    placeholder="Nội dung section 1"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hình ảnh</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRefs.about1.current?.click()}
                  >
                    {brandInfo.aboutSection1.image ? (
                      <img src={brandInfo.aboutSection1.image.file} alt="About 1" className="max-h-24 mx-auto" />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click để tải ảnh</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.about1}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'about1')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* About Section 2 */}
            <Card>
              <CardHeader>
                <CardTitle>About Section 2</CardTitle>
                <p className="text-sm text-muted-foreground">Hình ảnh bên trái</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tiêu đề</Label>
                  <Input
                    value={brandInfo.aboutSection2.title}
                    onChange={(e) => setBrandInfo(prev => ({
                      ...prev,
                      aboutSection2: { ...prev.aboutSection2, title: e.target.value }
                    }))}
                    placeholder="Tiêu đề section 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nội dung</Label>
                  <Textarea
                    value={brandInfo.aboutSection2.text}
                    onChange={(e) => setBrandInfo(prev => ({
                      ...prev,
                      aboutSection2: { ...prev.aboutSection2, text: e.target.value }
                    }))}
                    placeholder="Nội dung section 2"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hình ảnh</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRefs.about2.current?.click()}
                  >
                    {brandInfo.aboutSection2.image ? (
                      <img src={brandInfo.aboutSection2.image.file} alt="About 2" className="max-h-24 mx-auto" />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click để tải ảnh</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRefs.about2}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'about2')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview Landing Page</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto border rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
              }`}>
                <div 
                  className="min-h-96 p-6"
                  style={{ 
                    backgroundColor: selectedTheme?.background_color || '#F9FAFB',
                    color: selectedTheme?.text_color || '#000000'
                  }}
                >
                  {/* Preview Header */}
                  <div className="text-center mb-8">
                    {logo && (
                      <img src={logo.file} alt="Logo" className="h-16 mx-auto mb-4" />
                    )}
                    <h1 className="text-3xl font-bold mb-2">{brandInfo.name || 'Tên Nhà Hàng'}</h1>
                    <p className="text-lg opacity-80">{brandInfo.tagline || 'Slogan của bạn'}</p>
                  </div>

                  {/* Preview Banner */}
                  {banner && (
                    <div className="mb-8">
                      <img src={banner.file} alt="Banner" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  )}

                  {/* Preview Description */}
                  <div className="text-center mb-8">
                    <p className="text-lg opacity-90">
                      {brandInfo.description || 'Mô tả về nhà hàng của bạn sẽ hiển thị ở đây'}
                    </p>
                  </div>

                  {/* Preview Contact */}
                  <div className="text-center mb-8">
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                      {brandInfo.phone && <span>📞 {brandInfo.phone}</span>}
                      {brandInfo.email && <span>✉️ {brandInfo.email}</span>}
                      {brandInfo.address && <span>📍 {brandInfo.address}</span>}
                    </div>
                  </div>

                  {/* Preview About Sections */}
                  {(brandInfo.aboutSection1.title || brandInfo.aboutSection1.text) && (
                    <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: selectedTheme?.secondary_color || '#FFFFFF' }}>
                      <h3 className="text-xl font-semibold mb-2">{brandInfo.aboutSection1.title}</h3>
                      <p>{brandInfo.aboutSection1.text}</p>
                    </div>
                  )}

                  {(brandInfo.aboutSection2.title || brandInfo.aboutSection2.text) && (
                    <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: selectedTheme?.secondary_color || '#FFFFFF' }}>
                      <h3 className="text-xl font-semibold mb-2">{brandInfo.aboutSection2.title}</h3>
                      <p>{brandInfo.aboutSection2.text}</p>
                    </div>
                  )}

                  {/* Preview Gallery */}
                  {galleryImages.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-center">Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.slice(0, 4).map((img, index) => (
                          <img key={index} src={img.file} alt={`Gallery ${index}`} className="w-full h-24 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}