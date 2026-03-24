# Branding & Customization System - Complete Specification

## Overview
Hệ thống cho phép Owner tùy chỉnh giao diện landing page của nhà hàng với themes, layouts, và nội dung tùy chỉnh. Landing page này là trang khách hàng thấy khi quét QR code tại bàn.

## 1. Architecture

### Database Structure (MongoDB)
```javascript
// Collection: restaurant_branding
{
  _id: ObjectId,
  restaurant_id: String (UUID from PostgreSQL),
  brand_name: String,
  tagline: String,
  description: String,
  logo_url: String (Cloudinary URL),
  banner_url: String (Cloudinary URL),
  
  // Theme & Layout
  selected_theme_id: ObjectId (ref: branding_themes),
  layout_type: Enum ['DEFAULT', 'CENTERED', 'SIDEBAR', 'MASONRY', 'GALLERY'],
  
  // Images
  gallery_images: [String], // Cloudinary URLs
  slider_images: [String],  // Cloudinary URLs (Enterprise only)
  
  // About Sections
  about_section_1: {
    title: String,
    text: String,
    image: String (Cloudinary URL)
  },
  about_section_2: {
    title: String,
    text: String,
    image: String (Cloudinary URL)
  },
  
  // Contact
  phone: String,
  email: String,
  address: String,
  
  // Publishing
  is_published: Boolean,
  slug: String (for URL),
  
  created_at: Date,
  updated_at: Date
}

// Collection: branding_themes
{
  _id: ObjectId,
  name: String,
  category: Enum ['dark', 'light'],
  colors: {
    pageBackground: String (HSL),
    heroBackground: String (HSL),
    heroText: String (HSL),
    heroAccent: String (HSL),
    cardBackground: String (HSL),
    cardBorder: String (HSL),
    buttonPrimary: String (HSL),
    buttonPrimaryText: String (HSL),
    buttonSecondary: String (HSL),
    buttonSecondaryText: String (HSL),
    headingColor: String (HSL),
    bodyTextColor: String (HSL)
  },
  package_required: Enum ['FREE', 'PRO', 'ENTERPRISE'],
  is_active: Boolean
}
```

## 2. Predefined Themes

### Dark Themes
1. **Midnight Blue** (Pro+)
   - Page: `220 25% 10%`
   - Hero: `220 30% 15%`
   - Accent: `210 100% 60%`

2. **Forest Night** (Pro+)
   - Page: `150 20% 12%`
   - Hero: `150 25% 18%`
   - Accent: `150 60% 50%`

3. **Sunset Dark** (Pro+)
   - Page: `20 30% 15%`
   - Hero: `20 40% 20%`
   - Accent: `30 90% 60%`

4. **Royal Purple** (Enterprise)
   - Page: `270 30% 12%`
   - Hero: `270 35% 18%`
   - Accent: `280 70% 60%`

### Light Themes
5. **Warm Cream** (Free)
   - Page: `40 30% 95%`
   - Hero: `40 40% 90%`
   - Accent: `25 80% 50%`

6. **Ocean Breeze** (Pro+)
   - Page: `200 30% 95%`
   - Hero: `200 40% 88%`
   - Accent: `195 85% 45%`

7. **Rose Garden** (Pro+)
   - Page: `350 25% 95%`
   - Hero: `350 35% 90%`
   - Accent: `340 75% 55%`

8. **Fresh Mint** (Enterprise)
   - Page: `160 25% 95%`
   - Hero: `160 30% 90%`
   - Accent: `165 65% 45%`

## 3. Package Features

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Logo & Banner | ✅ | ✅ | ✅ |
| Theme Selection | ❌ (1 default) | ✅ (6 themes) | ✅ (8 themes) |
| Layout Options | 1 | 5 | 5 |
| Gallery Images | ❌ | ✅ (max 20) | ✅ (max 20) |
| Image Slider | ❌ | ❌ | ✅ (max 10) |
| About Sections | ✅ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ |

## 4. API Endpoints

### Backend Routes
```javascript
// GET /api/v1/branding/themes - Get available themes
// GET /api/v1/branding/restaurant/:restaurantId - Get restaurant branding
// PUT /api/v1/branding/restaurant/:restaurantId - Update restaurant branding
// POST /api/v1/branding/upload - Upload image (logo, banner, gallery, slider)
// GET /api/v1/branding/landing/:slug - Get public landing page data
// POST /api/v1/branding/restaurant/:restaurantId/publish - Publish/unpublish
```

## 5. Frontend Components

### A. Customization Page (`/owner/branding`)
Components needed:
- `BranchThemeEditor` - Theme selection & preview
- `ImageUploader` - Logo, banner, gallery, slider uploads
- `LayoutSelector` - Choose layout type
- `BrandingForm` - Brand info, contact, about sections
- `ThemePreview` - Real-time preview of theme colors

### B. Landing Page (`/branch/:shortCode` or `/g/:shortCode`)
Components needed:
- `HeroSection` - Banner, logo, brand name, tagline
- `ImageSlider` - Continuous scroll slider (Enterprise)
- `RestaurantInfoCard` - Contact info
- `MenuGrid` - Menu items with categories
- `GallerySection` - Image gallery (Pro+)
- `AboutSections` - Two about blocks
- `ReserveButton` - Floating action button

## 6. Implementation Steps

### Phase 1: Fix Current Issues ✅
- [x] Upload images to Cloudinary
- [x] Save branding to MongoDB
- [x] Fix schema validation
- [x] Fix role authorization

### Phase 2: Theme System (Next)
- [ ] Seed 8 predefined themes to MongoDB
- [ ] Create theme selector component
- [ ] Apply theme colors dynamically
- [ ] Package-based theme filtering

### Phase 3: Layout System
- [ ] Implement 5 layout templates
- [ ] Layout preview in customization page
- [ ] Package-based layout restrictions

### Phase 4: Landing Page
- [ ] Create public landing page route
- [ ] Implement hero section with theme
- [ ] Menu grid with categories
- [ ] Gallery & slider components
- [ ] About sections
- [ ] Reserve button integration

### Phase 5: Preview & Publishing
- [ ] Preview button opens landing page
- [ ] Publish/unpublish toggle
- [ ] Copy URL functionality
- [ ] SEO meta tags

## 7. Current Status

### Working ✅
- Image upload to Cloudinary
- Save branding data to MongoDB
- Restaurant-level branding (applies to all branches)

### Issues to Fix 🔧
1. **Preview Error**: "Landing page is not published"
   - Need to set `is_published: true` when saving
   - Need to implement landing page endpoint

2. **Data Not Loading After Save**
   - Check MongoDB data structure
   - Verify field name mapping

3. **Missing Features**
   - Theme selection UI
   - Layout selector
   - Gallery/slider upload
   - Landing page rendering

## 8. Next Actions

1. **Immediate**: Fix preview by implementing landing page endpoint
2. **Short-term**: Add theme selection and preview
3. **Medium-term**: Implement all 5 layouts
4. **Long-term**: Add gallery, slider, and advanced features

## 9. File Structure
```
frontend/src/
├── pages/
│   ├── Branding.tsx (Customization page)
│   └── BranchLanding.tsx (Public landing page - NEW)
├── components/
│   ├── branding/
│   │   ├── ThemeSelector.tsx (NEW)
│   │   ├── LayoutSelector.tsx (NEW)
│   │   ├── ImageUploader.tsx (NEW)
│   │   └── ThemePreview.tsx (NEW)
│   └── landing/
│       ├── HeroSection.tsx (NEW)
│       ├── ImageSlider.tsx (NEW)
│       ├── MenuGrid.tsx (NEW)
│       ├── GallerySection.tsx (NEW)
│       └── AboutSections.tsx (NEW)

backend/src/
├── use-cases/branding/
│   ├── get-landing-page.js ✅
│   ├── update-restaurant-branding.js ✅
│   └── seed-themes.js (NEW)
├── repository/
│   └── branding.js ✅
└── routes/v1/
    └── branding.js ✅
```

## 10. Testing Checklist

- [ ] Upload logo successfully
- [ ] Upload banner successfully
- [ ] Select theme and see preview
- [ ] Change layout and see difference
- [ ] Upload gallery images (Pro)
- [ ] Upload slider images (Enterprise)
- [ ] Save all changes
- [ ] Preview landing page
- [ ] Copy URL works
- [ ] Landing page displays correctly
- [ ] Theme colors applied
- [ ] Menu items show correctly
- [ ] Reserve button works
- [ ] Responsive on mobile
- [ ] Package restrictions enforced
