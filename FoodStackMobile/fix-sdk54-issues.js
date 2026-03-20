/**
 * Auto-fix script for SDK 54 compatibility issues
 */

const fs = require('fs');
const path = require('path');

// Fixes to apply
const FIXES = [
  {
    file: 'src/services/api-config.ts',
    search: /const { Platform } = require\('react-native'\);/g,
    replace: "import { Platform } from 'react-native';",
    description: 'Fix Platform import'
  },
  {
    file: 'src/services/api-config.ts',
    search: /const { Constants } = require\('expo-constants'\);/g,
    replace: "import Constants from 'expo-constants';",
    description: 'Fix Constants import'
  }
];

function applyFix(fix) {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fix.file}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = content.replace(fix.search, fix.replace);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${fix.description} in ${fix.file}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${fix.description} in ${fix.file}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
    return false;
  }
}

function createExpoGoInstructions() {
  const instructions = `# Quick Start Guide - Expo Go SDK 54

## 1. Setup (one time only)
\`\`\`bash
cd FoodStackMobile
npm run setup:sdk54
\`\`\`

## 2. Update IP Address
Edit \`src/services/api-config.ts\`:
\`\`\`typescript
const PHYSICAL_DEVICE_URL = 'http://YOUR_IP:3000/api/v1';
\`\`\`

## 3. Start Backend
\`\`\`bash
# In root directory
npm run dev
\`\`\`

## 4. Start Expo
\`\`\`bash
# In FoodStackMobile directory
npm start
\`\`\`

## 5. Open in Expo Go
- Install Expo Go app on your phone
- Scan QR code from terminal
- Make sure phone and computer are on same WiFi

## Test Login
- Email: customer@test.com
- Password: password123
`;

  fs.writeFileSync(path.join(__dirname, 'QUICK_START.md'), instructions);
  console.log('✅ Created QUICK_START.md');
}

function updatePackageScripts() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add helpful scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'setup:sdk54': 'rm -rf node_modules package-lock.json && npm install',
      'check:compatibility': 'node check-compatibility.js',
      'fix:sdk54': 'node fix-sdk54-issues.js'
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts');
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
}

// Main execution
console.log('🔧 Auto-fixing SDK 54 compatibility issues...\n');

let fixedCount = 0;

FIXES.forEach(fix => {
  if (applyFix(fix)) {
    fixedCount++;
  }
});

createExpoGoInstructions();
updatePackageScripts();

console.log(`\n📊 Summary: ${fixedCount} fixes applied`);
console.log('\n✅ SDK 54 compatibility fixes completed!');
console.log('\nNext steps:');
console.log('1. Run: npm run setup:sdk54');
console.log('2. Update IP address in api-config.ts');
console.log('3. Start backend: npm run dev');
console.log('4. Start Expo: npm start');
console.log('5. Test with Expo Go app (SDK 54 compatible)');

console.log('\n💡 See QUICK_START.md for detailed instructions');