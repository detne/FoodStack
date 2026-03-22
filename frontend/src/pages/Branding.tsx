/**
 * Branding Management
 * Customize branch appearance and themes
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// Theme configurations
const THEMES = {
  dark: [
    { name: 'Dark Purple', primary: '#8B5CF6', secondary: '#A78BFA', background: '#1F2937', card: '#374151' },
    { name: 'Dark Blue', primary: '#3B82F6', secondary: '#60A5FA', background: '#1E293B', card: '#334155' },
    { name: 'Dark Green', primary: '#10B981', secondary: '#34D399', background: '#064E3B', card: '#065F46' },
    { name: 'Dark Red', primary: '#EF4444', secondary: '#F87171', background: '#7F1D1D', card: '#991B1B' },
  ],
  light: [
    { name: 'Light Purple', primary: '#8B5CF6', secondary: '#A78BFA', background: '#F9FAFB', card: '#FFFFFF' },
    { name: 'Light Blue', primary: '#3B82F6', secondary: '#60A5FA', background: '#F8FAFC', card: '#FFFFFF' },
    { name: 'Light Green', primary: '#10B981', secondary: '#34D399', background: '#F0FDF4', card: '#FFFFFF' },
    { name: 'Light Orange', primary: '#F59E0B', secondary: '#FBBF24', background: '#FFFBEB', card: '#FFFFFF' },
  ]
};

const LAYOUTS = {
  free: ['gradient-about'],
  pro: ['gradient-about', 'centered', 'sidebar', 'masonry'],
  enterprise: ['gradient-about', 'centered', 'sidebar', 'masonry', 'slider']
};

export default function Branding() {
  const [activeTab, setActiveTab] = useState('images');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState('gradient-about');
  const [userPackage, setUserPackage] = useState('free'); // This should come from user context
  const [previewMode, setPreviewMode] = useState('desktop');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  // Load branding data from API
  useEffect(() => {
    const loadBranding = async () => {
      try {
        setLoading(true);
        
        // Get current branch from localStorage or context
        const branchId = localStorage.getItem('selectedBranchId');
        if (!branchId) {
          toast.error('Vui lòng chọn chi nhánh');
          return;
        }
        
        setCurrentBranchId(branchId);
        
        const response = await apiClient.get(`/branding/${branchId}`);
        const data = response.data;
        
        // Map API data to state
        if (data.theme_colors) {
          setSelectedTheme(data.theme_colors);
        }
        setSelectedLayout(data.layout_type || 'gradient-about');
        setLogo(data.logo_url ? { file: data.logo_url, name: 'logo' } : null);
        setBanner(data.banner_url ? { file: data.banner_url, name: 'banner' } : null);
        setGalleryImages(data.gallery_images || []);
        setSliderImages(data.slider_images || []);
        
        setBrandInfo({
          name: data.name || '',
          tagline: data.tagline || '',
          description: data.address || '',
          phone: data.phone || '',
          email: '',
          address: data.address || '',
          aboutSection1: { title: '', text: '', image: null },
          aboutSection2: { title: '', text: '', image: null }
        });
        
      } catch (error) {
        console.error('Error loading branding:', error);
        toast.error('Không thể tải dữ liệu branding');
      } finally {
        setLoading(false);
      }
    };

    loadBranding();
  }, []);

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
      // Upload to server first
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await apiClient.post('/restaurants/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const imageUrl = uploadResponse.data.logoUrl;
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
          if (userPackage === 'enterprise') {
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
      toast.error('Không thể tải ảnh lên');
    }
  };

  // Save all changes to API
  const handleSaveAll = async () => {
    if (!currentBranchId) {
      toast.error('Không tìm thấy chi nhánh');
      return;
    }

    try {
      setSaving(true);
      
      const data = {
        logoUrl: logo?.file || null,
        bannerUrl: banner?.file || null,
        tagline: brandInfo.tagline,
        selectedThemeId: selectedTheme?.name || null,
        themeColors: selectedTheme,
        layoutType: selectedLayout,
        galleryImages: galleryImages,
        sliderImages: sliderImages,
        operatingHours: null,
        socialLinks: null,
        isPublished: true,
        seoTitle: brandInfo.name,
        seoDescription: brandInfo.description,
        seoKeywords: null,
      };
      
      const result = await apiClient.put(`/branding/${currentBranchId}`, data);
      // Update slug if returned
      if (result.data?.slug) {
        setBranchSlug(result.data.slug);
      }
      toast.success('Đã lưu tất cả thay đổi');
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Không thể lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  // Preview landing page
  const handlePreview = () => {
    if (branchSlug) {
      window.open(`/g/${branchSlug}`, '_blank');
    } else {
      toast.error('Chi nhánh chưa có slug');
    }
  };

  // Copy URL
  const handleCopyURL = () => {
    if (!branchSlug) {
      toast.error('Chi nhánh chưa có slug');
      return;
    }
    const url = `${window.location.origin}/g/${branchSlug}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép URL');
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
          <Badge variant={userPackage === 'enterprise' ? 'default' : userPackage === 'pro' ? 'secondary' : 'outline'}>
            {userPackage === 'enterprise' && <Crown className="w-3 h-3 mr-1" />}
            {userPackage.toUpperCase()}
          </Badge>
          <Button onClick={handlePreview} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleCopyURL} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy URL
          </Button>
          <Button onClick={handleSaveAll}>
            <Save className="w-4 h-4 mr-2" />
            Lưu tất cả
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
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRefs.logo.current?.click()}
                  >
                    {logo ? (
                      <div className="space-y-2">
                        <img src={logo.file} alt="Logo" className="max-h-32 mx-auto" />
                        <p className="text-sm text-muted-foreground">{logo.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click để tải logo</p>
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
                    <Button variant="outline" size="sm" onClick={() => setLogo(null)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
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
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRefs.banner.current?.click()}
                  >
                    {banner ? (
                      <div className="space-y-2">
                        <img src={banner.file} alt="Banner" className="max-h-32 mx-auto" />
                        <p className="text-sm text-muted-foreground">{banner.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click để tải banner</p>
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
                    <Button variant="outline" size="sm" onClick={() => setBanner(null)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gallery Images */}
          {(userPackage === 'pro' || userPackage === 'enterprise') && (
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
          )}

          {/* Image Slider - Enterprise Only */}
          {userPackage === 'enterprise' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image Slider
                  <Badge variant="default">
                    <Crown className="w-3 h-3 mr-1" />
                    ENTERPRISE
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
                    Tính năng chọn theme chỉ có trong gói Pro và Enterprise
                  </p>
                  <Button>Nâng cấp ngay</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Dark Themes */}
              <Card>
                <CardHeader>
                  <CardTitle>Dark Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {THEMES.dark.map((theme, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTheme?.name === theme.name ? 'border-primary' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedTheme(theme)}
                      >
                        <div className="space-y-2">
                          <div className="h-16 rounded" style={{ backgroundColor: theme.background }}>
                            <div className="h-8 rounded-t" style={{ backgroundColor: theme.primary }}></div>
                            <div className="h-8 rounded-b" style={{ backgroundColor: theme.card }}></div>
                          </div>
                          <p className="text-sm font-medium">{theme.name}</p>
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Light Themes */}
              <Card>
                <CardHeader>
                  <CardTitle>Light Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {THEMES.light.map((theme, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTheme?.name === theme.name ? 'border-primary' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedTheme(theme)}
                      >
                        <div className="space-y-2">
                          <div className="h-16 rounded" style={{ backgroundColor: theme.background }}>
                            <div className="h-8 rounded-t" style={{ backgroundColor: theme.primary }}></div>
                            <div className="h-8 rounded-b" style={{ backgroundColor: theme.card }}></div>
                          </div>
                          <p className="text-sm font-medium">{theme.name}</p>
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                {LAYOUTS[userPackage].map((layout) => (
                  <div
                    key={layout}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLayout === layout ? 'border-primary' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedLayout(layout)}
                  >
                    <div className="space-y-2">
                      <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-xs text-gray-500">
                          {layout === 'gradient-about' && 'Gradient + About'}
                          {layout === 'centered' && 'Centered Layout'}
                          {layout === 'sidebar' && 'Sidebar Layout'}
                          {layout === 'masonry' && 'Masonry Layout'}
                          {layout === 'slider' && 'Image Slider'}
                        </div>
                      </div>
                      <p className="text-sm font-medium capitalize">
                        {layout.replace('-', ' ')}
                      </p>
                      {layout === 'gradient-about' && (
                        <Badge variant="outline">FREE</Badge>
                      )}
                      {['centered', 'sidebar', 'masonry'].includes(layout) && (
                        <Badge variant="secondary">PRO+</Badge>
                      )}
                      {layout === 'slider' && (
                        <Badge variant="default">
                          <Crown className="w-3 h-3 mr-1" />
                          ENTERPRISE
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
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
                    backgroundColor: selectedTheme?.background || '#F9FAFB',
                    color: selectedTheme?.name?.includes('Dark') ? '#FFFFFF' : '#000000'
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
                    <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: selectedTheme?.card || '#FFFFFF' }}>
                      <h3 className="text-xl font-semibold mb-2">{brandInfo.aboutSection1.title}</h3>
                      <p>{brandInfo.aboutSection1.text}</p>
                    </div>
                  )}

                  {(brandInfo.aboutSection2.title || brandInfo.aboutSection2.text) && (
                    <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: selectedTheme?.card || '#FFFFFF' }}>
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