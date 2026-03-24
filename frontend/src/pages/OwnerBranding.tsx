/**
 * Owner Branding Management
 * Restaurant-level branding and theme management
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Crown,
  Loader2,
  Building2,
  Globe
} from 'lucide-react';

export default function OwnerBranding() {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [themes, setThemes] = useState([]);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);
  
  // Restaurant branding states
  const [restaurantBranding, setRestaurantBranding] = useState({
    brandName: '',
    tagline: '',
    description: '',
    publicEmail: '',
    publicPhone: '',
    websiteUrl: '',
    logoUrl: null,
    bannerUrl: null,
    faviconUrl: null,
    layoutType: 'DEFAULT',
    galleryImages: [],
    sliderImages: [],
    aboutSection1: { title: '', content: '', imageUrl: null, imagePosition: 'right' },
    aboutSection2: { title: '', content: '', imageUrl: null, imagePosition: 'left' },
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: ''
    },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    isPublished: false,
    customDomain: ''
  });

  const fileInputRefs = {
    logo: useRef(null),
    banner: useRef(null),
    favicon: useRef(null),
    gallery: useRef(null),
    slider: useRef(null),
    about1: useRef(null),
    about2: useRef(null)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Restaurant Branding</h1>
            <p className="text-muted-foreground">Quản lý thương hiệu và giao diện nhà hàng</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => {}} variant="outline">
            <Globe className="w-4 h-4 mr-2" />
            Xem Landing Page
          </Button>
          <Button onClick={() => {}} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="restaurant">Thông tin</TabsTrigger>
          <TabsTrigger value="themes">Theme</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="seo">SEO & Domain</TabsTrigger>
        </TabsList>

        {/* Restaurant Info Tab */}
        <TabsContent value="restaurant" className="space-y-6">
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
                    value={restaurantBranding.brandName}
                    onChange={(e) => setRestaurantBranding(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="Nhập tên thương hiệu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Slogan</Label>
                  <Input
                    id="tagline"
                    value={restaurantBranding.tagline}
                    onChange={(e) => setRestaurantBranding(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Nhập slogan"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả nhà hàng</Label>
                <Textarea
                  id="description"
                  value={restaurantBranding.description}
                  onChange={(e) => setRestaurantBranding(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả về nhà hàng của bạn"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publicPhone">Số điện thoại công khai</Label>
                  <Input
                    id="publicPhone"
                    value={restaurantBranding.publicPhone}
                    onChange={(e) => setRestaurantBranding(prev => ({ ...prev, publicPhone: e.target.value }))}
                    placeholder="Số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publicEmail">Email công khai</Label>
                  <Input
                    id="publicEmail"
                    type="email"
                    value={restaurantBranding.publicEmail}
                    onChange={(e) => setRestaurantBranding(prev => ({ ...prev, publicEmail: e.target.value }))}
                    placeholder="Email liên hệ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website</Label>
                  <Input
                    id="websiteUrl"
                    value={restaurantBranding.websiteUrl}
                    onChange={(e) => setRestaurantBranding(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://website.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs will be implemented */}
        <TabsContent value="themes">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Theme Management</h3>
                <p className="text-muted-foreground">Chức năng đang được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Content Management</h3>
                <p className="text-muted-foreground">Chức năng đang được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">SEO & Domain</h3>
                <p className="text-muted-foreground">Chức năng đang được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}