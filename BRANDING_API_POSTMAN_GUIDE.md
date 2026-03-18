# Branch Branding API - Postman Testing Guide

## API Endpoint
**GET** `/api/v1/owner/branches/:branchId/branding`

## Authentication
- **Type**: Bearer Token
- **Required**: Yes (Owner/Manager role)

## Postman Setup Instructions

### 1. Create New Request
1. Open Postman
2. Click "New" → "Request"
3. Name: "Get Branch Branding Settings"
4. Method: **GET**
5. URL: `{{base_url}}/api/v1/owner/branches/{{branch_id}}/branding`

### 2. Environment Variables
Create these environment variables in Postman:
- `base_url`: `http://localhost:3000` (or your server URL)
- `branch_id`: Your actual branch ID
- `access_token`: Will be set after login

### 3. Authorization Setup
1. Go to "Authorization" tab
2. Type: "Bearer Token"
3. Token: `{{access_token}}`

### 4. Pre-request Script (Optional)
If you want to auto-login before each request:

```javascript
// Pre-request script to get access token
pm.sendRequest({
    url: pm.environment.get("base_url") + "/api/v1/auth/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json',
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: "your-owner-email@example.com",
            password: "your-password"
        })
    }
}, function (err, response) {
    if (response.code === 200) {
        const jsonData = response.json();
        pm.environment.set("access_token", jsonData.data.accessToken);
    }
});
```

## Test Cases

### Test Case 1: Valid Owner Request
**Request:**
```
GET /api/v1/owner/branches/{valid-branch-id}/branding
Authorization: Bearer {valid-owner-token}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "branchId": "branch_123",
    "slug": "hilldevil-downtown",
    "logoUrl": "https://cdn.example.com/logo.png",
    "bannerUrl": "https://cdn.example.com/banner.jpg",
    "tagline": "Best BBQ in Town",
    "selectedThemeId": "theme_midnight",
    "themeColors": {
      "primary": "#1a1a2e",
      "secondary": "#16213e",
      "accent": "#e94560"
    },
    "layoutType": "modern",
    "galleryImages": [
      {"url": "https://...", "caption": "Interior"},
      {"url": "https://...", "caption": "Food"}
    ],
    "sliderImages": [
      {"url": "https://...", "caption": "Welcome"}
    ],
    "operatingHours": {
      "monday": {"open": "09:00", "close": "22:00"},
      "tuesday": {"open": "09:00", "close": "22:00"}
    },
    "socialLinks": {
      "facebook": "https://facebook.com/hilldevil",
      "instagram": "https://instagram.com/hilldevil"
    },
    "isPublished": true,
    "customDomain": null,
    "seoTitle": "Hill Devil Restaurant - Downtown",
    "seoDescription": "Best BBQ restaurant in downtown",
    "seoKeywords": "bbq, restaurant, downtown",
    "allowedFeatures": {
      "logo": true,
      "banner": true,
      "gallery": true,
      "maxGalleryImages": 10
    }
  }
}
```

### Test Case 2: Branch Not Found
**Request:**
```
GET /api/v1/owner/branches/invalid-branch-id/branding
Authorization: Bearer {valid-token}
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Branch not found"
}
```

### Test Case 3: Unauthorized Access
**Request:**
```
GET /api/v1/owner/branches/{branch-id}/branding
Authorization: Bearer {invalid-token}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Test Case 4: Forbidden Access (Not Owner)
**Request:**
```
GET /api/v1/owner/branches/{other-owner-branch-id}/branding
Authorization: Bearer {valid-token-different-owner}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "You do not have permission to access this branch"
}
```

## Quick Test Steps

1. **Login First:**
   ```
   POST /api/v1/auth/login
   {
     "email": "owner@example.com",
     "password": "password123"
   }
   ```

2. **Copy Access Token** from login response

3. **Test Branding Endpoint:**
   ```
   GET /api/v1/owner/branches/{your-branch-id}/branding
   Headers: Authorization: Bearer {access-token}
   ```

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check if token is valid and not expired
2. **403 Forbidden**: Verify the user owns the branch
3. **404 Not Found**: Confirm branch ID exists in database
4. **500 Internal Error**: Check server logs for database connection issues

### Debug Tips:
- Check server console for detailed error logs
- Verify branch exists: `GET /api/v1/branches/{branch-id}`
- Verify user authentication: Check JWT payload
- Test with different branch IDs owned by the same user