// src/repository/branding.js

const { MongoClient, ObjectId } = require('mongodb');

class BrandingRepository {
  constructor(mongoClient, branchRepository = null) {
    this.client = mongoClient;
    this.db = null;
    this.branchRepository = branchRepository;
  }

  async getDb() {
    if (!this.db) {
      if (!this.client) {
        const { MongoClient } = require('mongodb');
        this.client = new MongoClient(process.env.DATABASE_URL);
        await this.client.connect();
      }
      this.db = this.client.db();
    }
    return this.db;
  }

  // ===== THEMES =====
  async getThemes(filters = {}) {
    const { category, package: packageType, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const db = await this.getDb();
    const collection = db.collection('branding_themes');

    const query = { is_active: true };

    if (category) {
      query.category = category;
    }

    if (packageType) {
      query.required_package = packageType;
    }

    const [themes, total] = await Promise.all([
      collection
        .find(query)
        .sort({ category: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);

    return {
      themes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getThemeById(themeId) {
    const db = await this.getDb();
    const collection = db.collection('branding_themes');
    
    return await collection.findOne({
      _id: new ObjectId(themeId),
      is_active: true
    });
  }

  // ===== RESTAURANT BRANDING =====
  async getRestaurantBranding(restaurantId) {
    const db = await this.getDb();
    const collection = db.collection('restaurant_branding');
    
    const pipeline = [
      { $match: { restaurant_id: restaurantId } }, // Store as string
      {
        $lookup: {
          from: 'branding_themes',
          localField: 'selected_theme_id',
          foreignField: '_id',
          as: 'theme'
        }
      },
      {
        $addFields: {
          theme_name: { $arrayElemAt: ['$theme.name', 0] },
          theme_category: { $arrayElemAt: ['$theme.category', 0] }
        }
      },
      { $project: { theme: 0 } }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const doc = result[0];
    
    if (!doc) return null;
    
    // Convert snake_case to camelCase for frontend
    return {
      restaurantId: doc.restaurant_id,
      brandName: doc.brand_name,
      tagline: doc.tagline,
      description: doc.description,
      publicEmail: doc.public_email,
      publicPhone: doc.public_phone,
      websiteUrl: doc.website_url,
      logoUrl: doc.logo_url,
      bannerUrl: doc.banner_url,
      faviconUrl: doc.favicon_url,
      selectedThemeId: doc.selected_theme_id?.toString(),
      customThemeColors: doc.custom_theme_colors,
      layoutType: doc.layout_type,
      galleryImages: doc.gallery_images,
      sliderImages: doc.slider_images,
      aboutSection1: doc.about_section_1,
      aboutSection2: doc.about_section_2,
      socialLinks: doc.social_links,
      seoTitle: doc.seo_title,
      seoDescription: doc.seo_description,
      seoKeywords: doc.seo_keywords,
      isPublished: doc.is_published,
      customDomain: doc.custom_domain,
      currentPackage: doc.current_package,
      themeName: doc.theme_name,
      themeCategory: doc.theme_category,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    };
  }

  async createRestaurantBranding(restaurantId, data) {
    const db = await this.getDb();
    const collection = db.collection('restaurant_branding');
    
    const document = {
      restaurant_id: restaurantId, // Store as string
      brand_name: data.brandName || null,
      tagline: data.tagline || null,
      description: data.description || null,
      public_email: data.publicEmail || null,
      public_phone: data.publicPhone || null,
      website_url: data.websiteUrl || null,
      logo_url: data.logoUrl || null,
      banner_url: data.bannerUrl || null,
      favicon_url: data.faviconUrl || null,
      selected_theme_id: data.selectedThemeId ? new ObjectId(data.selectedThemeId) : null,
      custom_theme_colors: data.customThemeColors || null,
      layout_type: data.layoutType || 'DEFAULT',
      gallery_images: data.galleryImages || [],
      slider_images: data.sliderImages || [],
      about_section_1: data.aboutSection1 || null,
      about_section_2: data.aboutSection2 || null,
      social_links: data.socialLinks || {},
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      seo_keywords: data.seoKeywords || null,
      is_published: data.isPublished || false,
      custom_domain: data.customDomain || null,
      current_package: data.currentPackage || 'FREE',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(document);
    return { ...document, _id: result.insertedId };
  }

  async updateRestaurantBranding(restaurantId, data) {
    const db = await this.getDb();
    const collection = db.collection('restaurant_branding');
    
    const updateDoc = { updated_at: new Date() };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        if (dbKey === 'selected_theme_id' && value) {
          updateDoc[dbKey] = new ObjectId(value);
        } else {
          updateDoc[dbKey] = value;
        }
      }
    });

    const result = await collection.findOneAndUpdate(
      { restaurant_id: restaurantId }, // Match by string
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  // ===== BRANCH BRANDING =====
  async getBranchBranding(branchId) {
    const db = await this.getDb();
    const collection = db.collection('branch_branding');
    
    const pipeline = [
      { $match: { branch_id: branchId } }, // Store as string, not ObjectId
      {
        $lookup: {
          from: 'branding_themes',
          localField: 'selected_theme_id',
          foreignField: '_id',
          as: 'theme'
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch'
        }
      },
      {
        $addFields: {
          theme_name: { $arrayElemAt: ['$theme.name', 0] },
          theme_category: { $arrayElemAt: ['$theme.category', 0] },
          branch_name: { $arrayElemAt: ['$branch.name', 0] },
          slug: { $arrayElemAt: ['$branch.slug', 0] },
          address: { $arrayElemAt: ['$branch.address', 0] },
          phone: { $arrayElemAt: ['$branch.phone', 0] }
        }
      },
      { $project: { theme: 0, branch: 0 } }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || null;
  }

  async createBranchBranding(branchId, restaurantId, data) {
    const db = await this.getDb();
    const collection = db.collection('branch_branding');
    
    const document = {
      branch_id: branchId, // Store as string (UUID from PostgreSQL)
      restaurant_id: restaurantId, // Store as string (UUID from PostgreSQL)
      brand_name: data.brandName || null,
      tagline: data.tagline || null,
      description: data.description || null,
      logo_url: data.logoUrl || null,
      banner_url: data.bannerUrl || null,
      selected_theme_id: data.selectedThemeId ? new ObjectId(data.selectedThemeId) : null,
      custom_theme_colors: data.customThemeColors || null,
      layout_type: data.layoutType || null,
      gallery_images: data.galleryImages || [],
      slider_images: data.sliderImages || [],
      about_section_1: data.aboutSection1 || null,
      about_section_2: data.aboutSection2 || null,
      is_published: data.isPublished || false,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(document);
    return { ...document, _id: result.insertedId };
  }

  async updateBranchBranding(branchId, data) {
    const db = await this.getDb();
    const collection = db.collection('branch_branding');
    
    const updateDoc = { updated_at: new Date() };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        if (dbKey === 'selected_theme_id' && value) {
          updateDoc[dbKey] = new ObjectId(value);
        } else {
          updateDoc[dbKey] = value;
        }
      }
    });

    const result = await collection.findOneAndUpdate(
      { branch_id: branchId }, // Match by string UUID
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  // ===== LANDING PAGE =====
  async getLandingPageData(slug) {
      // Query branch from PostgreSQL using branch repository
      let branch = null;
      if (this.branchRepository) {
        try {
          branch = await this.branchRepository.findBySlug(slug);
          console.log('Branch from PostgreSQL:', branch);
        } catch (error) {
          console.error('Error fetching branch from PostgreSQL:', error);
        }
      }

      if (!branch) {
        console.log('Branch not found in PostgreSQL for slug:', slug);
        return null;
      }

      const branchId = branch.id;
      const restaurantId = branch.restaurant_id;

      const db = await this.getDb();

      // Get restaurant branding
      const restaurantBranding = await db.collection('restaurant_branding')
        .findOne({ restaurant_id: restaurantId });

      // Get branch branding
      const branchBranding = await db.collection('branch_branding')
        .findOne({ branch_id: branchId });

      // Get theme
      let theme = null;
      const themeId = branchBranding?.selected_theme_id || restaurantBranding?.selected_theme_id;
      if (themeId) {
        theme = await db.collection('branding_themes')
          .findOne({ _id: themeId });
      }

      // Merge branch and restaurant branding data
      const rb = restaurantBranding || {};
      const bb = branchBranding || {};
      const th = theme || {};

      return {
        branch_id: branchId,
        branch_name: branch.name,
        address: branch.address,
        phone: branch.phone,
        slug: branch.slug,
        restaurant_id: restaurantId,
        brand_name: bb.brand_name || rb.brand_name,
        tagline: bb.tagline || rb.tagline,
        description: bb.description || rb.description,
        public_email: rb.public_email,
        public_phone: rb.public_phone,
        website_url: rb.website_url,
        logo_url: bb.logo_url || rb.logo_url,
        banner_url: bb.banner_url || rb.banner_url,
        gallery_images: bb.gallery_images || rb.gallery_images || [],
        slider_images: bb.slider_images || rb.slider_images || [],
        about_section_1: bb.about_section_1 || rb.about_section_1,
        about_section_2: bb.about_section_2 || rb.about_section_2,
        social_links: rb.social_links || {},
        layout_type: bb.layout_type || rb.layout_type || 'DEFAULT',
        seo_title: rb.seo_title,
        seo_description: rb.seo_description,
        seo_keywords: rb.seo_keywords,
        theme_name: th.name,
        theme_category: th.category,
        primary_color: th.primary_color,
        secondary_color: th.secondary_color,
        accent_color: th.accent_color,
        background_color: th.background_color,
        text_color: th.text_color,
        text_secondary: th.text_secondary,
        font_family: th.font_family,
        heading_font: th.heading_font,
        border_radius: th.border_radius,
        shadow_intensity: th.shadow_intensity,
        custom_theme_colors: bb.custom_theme_colors || rb.custom_theme_colors,
        is_published: bb.is_published !== undefined ? bb.is_published : (rb.is_published !== undefined ? rb.is_published : true)
      };
    }


  // ===== ANALYTICS =====
  async recordLandingPageVisit(data) {
    const db = await this.getDb();
    const collection = db.collection('landing_page_analytics');
    
    const document = {
      restaurant_id: data.restaurantId, // Store as string
      branch_id: data.branchId, // Store as string
      visitor_ip: data.visitorIp,
      user_agent: data.userAgent,
      referrer: data.referrer,
      page_url: data.pageUrl,
      page_title: data.pageTitle,
      session_duration: null,
      pages_viewed: 1,
      bounce_rate: true,
      clicked_menu: false,
      clicked_contact: false,
      clicked_social: false,
      made_reservation: false,
      visited_at: new Date()
    };

    await collection.insertOne(document);
  }

  async getLandingPageAnalytics(restaurantId, branchId = null, dateRange = {}) {
    const db = await this.getDb();
    const collection = db.collection('landing_page_analytics');
    
    const match = { restaurant_id: restaurantId }; // Match by string
    
    if (branchId) {
      match.branch_id = branchId; // Match by string
    }
    
    if (dateRange.startDate) {
      match.visited_at = { $gte: new Date(dateRange.startDate) };
    }
    
    if (dateRange.endDate) {
      match.visited_at = { ...match.visited_at, $lte: new Date(dateRange.endDate) };
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: null,
          total_visits: { $sum: 1 },
          unique_visitors: { $addToSet: '$visitor_ip' },
          avg_session_duration: { $avg: '$session_duration' },
          menu_clicks: { $sum: { $cond: ['$clicked_menu', 1, 0] } },
          contact_clicks: { $sum: { $cond: ['$clicked_contact', 1, 0] } },
          reservations_made: { $sum: { $cond: ['$made_reservation', 1, 0] } }
        }
      },
      {
        $addFields: {
          unique_visitors: { $size: '$unique_visitors' }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || {
      total_visits: 0,
      unique_visitors: 0,
      avg_session_duration: 0,
      menu_clicks: 0,
      contact_clicks: 0,
      reservations_made: 0
    };
  }

  // ===== PACKAGE VALIDATION =====
  async validatePackageFeatures(restaurantId, feature) {
    // This should query PostgreSQL, not MongoDB
    // For now, return true to allow all features (fix later with proper PostgreSQL query)
    return true;
    
    /* TODO: Query from PostgreSQL
    const db = await this.getDb();
    const collection = db.collection('restaurants');
    
    const restaurant = await collection.findOne(
      { _id: restaurantId },
      { projection: { current_package: 1 } }
    );
    
    const currentPackage = restaurant?.current_package || 'FREE';
    
    const packageFeatures = {
      FREE: ['basic_theme', 'default_layout'],
      PRO: ['basic_theme', 'default_layout', 'custom_theme', 'multiple_layouts', 'gallery'],
      ENTERPRISE: ['basic_theme', 'default_layout', 'custom_theme', 'multiple_layouts', 'gallery', 'slider', 'analytics', 'custom_domain']
    };

    return packageFeatures[currentPackage]?.includes(feature) || false;
    */
  }
}

module.exports = { BrandingRepository };
