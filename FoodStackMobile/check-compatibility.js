/**
 * Compatibility Checker for Expo SDK 50 (SDK 54 compatible)
 * Kiểm tra và báo cáo các vấn đề tương thích
 */

const fs = require('fs');
const path = require('path');

// Các packages có thể gây vấn đề với SDK 50/54
const INCOMPATIBLE_PACKAGES = [
  '@tanstack/react-query',
  'lottie-react-native',
];

// Các import patterns cần kiểm tra
const IMPORT_PATTERNS = [
  { pattern: /from ['"]expo-camera['"]/, issue: 'expo-camera import may need update for SDK 50' },
  { pattern: /Camera\./, issue: 'Camera usage may need update for SDK 50' },
  { pattern: /Constants\./, issue: 'Constants usage may need expo-constants import' },
  { pattern: /require\(['"]expo-constants['"]\)/, issue: 'Should use import instead of require for expo-constants' },
];

function checkPackageJson() {
  console.log('🔍 Checking package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    let issues = [];
    
    INCOMPATIBLE_PACKAGES.forEach(pkg => {
      if (dependencies[pkg]) {
        issues.push(`❌ ${pkg} may not be compatible with SDK 50/54`);
      }
    });
    
    // Check Expo SDK version
    if (dependencies.expo) {
      const expoVersion = dependencies.expo.replace(/[~^]/, '');
      if (!expoVersion.startsWith('50.')) {
        issues.push(`⚠️  Expo version ${expoVersion} - should be ~50.0.0 for SDK 54 compatibility`);
      } else {
        console.log(`✅ Expo SDK version: ${expoVersion} (SDK 54 compatible)`);
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ package.json looks good!');
    } else {
      console.log('\n📋 Package issues found:');
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    return issues;
  } catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    return [];
  }
}

function checkSourceFiles() {
  console.log('\n🔍 Checking source files...');
  
  const srcDir = path.join(__dirname, 'src');
  let issues = [];
  
  function checkFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(__dirname, filePath);
      
      IMPORT_PATTERNS.forEach(({ pattern, issue }) => {
        if (pattern.test(content)) {
          issues.push(`⚠️  ${relativePath}: ${issue}`);
        }
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          checkFile(filePath);
        }
      });
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  if (fs.existsSync(srcDir)) {
    walkDir(srcDir);
  }
  
  if (issues.length === 0) {
    console.log('✅ Source files look good!');
  } else {
    console.log('\n📋 Source file issues found:');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  return issues;
}

function checkAppConfig() {
  console.log('\n🔍 Checking app.json...');
  
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    let issues = [];
    
    // Check SDK version in app.json
    if (appJson.expo && appJson.expo.sdkVersion) {
      if (!appJson.expo.sdkVersion.startsWith('50.')) {
        issues.push(`⚠️  app.json sdkVersion: ${appJson.expo.sdkVersion} - should be 50.x.x for SDK 54 compatibility`);
      }
    }
    
    // Check plugins
    if (appJson.expo && appJson.expo.plugins) {
      const plugins = appJson.expo.plugins;
      plugins.forEach(plugin => {
        const pluginName = typeof plugin === 'string' ? plugin : plugin[0];
        if (pluginName === 'expo-camera') {
          console.log('✅ expo-camera plugin configured');
        }
      });
    }
    
    if (issues.length === 0) {
      console.log('✅ app.json looks good!');
    } else {
      console.log('\n📋 App config issues found:');
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    return issues;
  } catch (error) {
    console.error('❌ Error reading app.json:', error.message);
    return [];
  }
}

function generateReport(allIssues) {
  console.log('\n📊 COMPATIBILITY REPORT');
  console.log('========================');
  
  if (allIssues.length === 0) {
    console.log('🎉 No compatibility issues found!');
    console.log('\n✅ Your app should work with Expo Go SDK 54');
  } else {
    console.log(`⚠️  Found ${allIssues.length} potential issues:`);
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    console.log('\n🔧 Recommended actions:');
    console.log('1. Run setup-sdk54.bat/sh to reinstall dependencies');
    console.log('2. Update any incompatible packages');
    console.log('3. Test the app with Expo Go (SDK 54)');
  }
  
  console.log('\n📱 To test with Expo Go:');
  console.log('1. Install Expo Go app on your phone');
  console.log('2. Run: npm start');
  console.log('3. Scan QR code with Expo Go');
}

// Main execution
console.log('🚀 FoodStack Mobile - SDK 54 Compatibility Check');
console.log('================================================\n');

const packageIssues = checkPackageJson();
const sourceIssues = checkSourceFiles();
const configIssues = checkAppConfig();

const allIssues = [...packageIssues, ...sourceIssues, ...configIssues];
generateReport(allIssues);

console.log('\n💡 For detailed setup instructions, see EXPO_GO_SETUP.md');