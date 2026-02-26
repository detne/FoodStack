// Script tự động tạo issues trong Jira qua REST API
// Cài đặt: npm install axios
// Chạy: node create-jira-issues.js

const axios = require('axios');
const fs = require('fs');

// CẤU HÌNH - Thay đổi theo thông tin của bạn
const JIRA_CONFIG = {
  domain: 'your-domain.atlassian.net', // VD: mycompany.atlassian.net
  email: 'your-email@example.com',
  apiToken: 'YOUR_API_TOKEN', // Tạo tại: https://id.atlassian.com/manage-profile/security/api-tokens
  projectKey: 'FoodStack' // Key của project
};

const jiraClient = axios.create({
  baseURL: `https://${JIRA_CONFIG.domain}/rest/api/3`,
  auth: {
    username: JIRA_CONFIG.email,
    password: JIRA_CONFIG.apiToken
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Đọc data từ CSV hoặc định nghĩa trực tiếp
const epics = [
  {
    key: 'AUTH-001',
    name: 'Authentication & Authorization',
    summary: 'Authentication & Authorization',
    description: 'Complete authentication system including user registration, login, password management, and email verification for restaurant owners and staff members.',
    priority: 'Highest',
    labels: ['auth', 'security', 'backend']
  },
  {
    key: 'REST-001',
    name: 'Restaurant Management',
    summary: 'Restaurant Management',
    description: 'Restaurant profile management including creation, updates, logo upload, statistics dashboard, and soft deletion for multi-tenant SaaS platform.',
    priority: 'High',
    labels: ['restaurant', 'tenant', 'backend']
  }
  // Thêm các Epic khác...
];

const stories = [
  {
    key: 'AUTH-002',
    summary: 'RegisterRestaurantUseCase',
    description: 'Implement restaurant owner registration flow with email verification. Create restaurant entity, owner user account, and send verification email. Validate unique email and business information.',
    priority: 'Highest',
    storyPoints: 5,
    labels: ['auth', 'registration', 'backend'],
    epicKey: 'AUTH-001'
  },
  {
    key: 'AUTH-003',
    summary: 'LoginUseCase',
    description: 'Implement secure login with email/password. Generate JWT access token (15min) and refresh token (30 days). Store refresh token in Redis. Log authentication events.',
    priority: 'Highest',
    storyPoints: 3,
    labels: ['auth', 'jwt', 'backend'],
    epicKey: 'AUTH-001'
  }
  // Thêm các Story khác...
];

// Hàm tạo Epic
async function createEpic(epic) {
  try {
    const response = await jiraClient.post('/issue', {
      fields: {
        project: { key: JIRA_CONFIG.projectKey },
        summary: epic.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: epic.description }]
          }]
        },
        issuetype: { name: 'Epic' },
        priority: { name: epic.priority },
        labels: epic.labels,
        customfield_10011: epic.name // Epic Name field (ID có thể khác, check trong Jira)
      }
    });
    
    console.log(`✓ Created Epic: ${epic.key} - ${epic.summary}`);
    return response.data.key; // Trả về Jira issue key
  } catch (error) {
    console.error(`✗ Failed to create Epic ${epic.key}:`, error.response?.data || error.message);
    return null;
  }
}

// Hàm tạo Story
async function createStory(story, epicJiraKey) {
  try {
    const response = await jiraClient.post('/issue', {
      fields: {
        project: { key: JIRA_CONFIG.projectKey },
        summary: story.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: story.description }]
          }]
        },
        issuetype: { name: 'Story' },
        priority: { name: story.priority },
        labels: story.labels,
        customfield_10016: story.storyPoints, // Story Points field (ID có thể khác)
        parent: { key: epicJiraKey } // Link to Epic
      }
    });
    
    console.log(`  ✓ Created Story: ${story.key} - ${story.summary}`);
    return response.data.key;
  } catch (error) {
    console.error(`  ✗ Failed to create Story ${story.key}:`, error.response?.data || error.message);
    return null;
  }
}

// Hàm chính
async function main() {
  console.log('🚀 Starting Jira issue creation...\n');
  
  const epicMapping = {}; // Map custom key to Jira key
  
  // Tạo tất cả Epic trước
  console.log('📋 Creating Epics...');
  for (const epic of epics) {
    const jiraKey = await createEpic(epic);
    if (jiraKey) {
      epicMapping[epic.key] = jiraKey;
    }
    await sleep(500); // Tránh rate limit
  }
  
  console.log('\n📝 Creating Stories...');
  // Tạo Stories và link vào Epic
  for (const story of stories) {
    const epicJiraKey = epicMapping[story.epicKey];
    if (epicJiraKey) {
      await createStory(story, epicJiraKey);
      await sleep(500);
    } else {
      console.log(`  ⚠ Skipping ${story.key} - Epic not found`);
    }
  }
  
  console.log('\n✅ Done! Check your Jira project.');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Chạy script
main().catch(console.error);
