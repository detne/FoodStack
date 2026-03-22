/**
 * Script to fix all UUID usage in repositories for MongoDB compatibility
 */

const fs = require('fs');
const path = require('path');

const repositoryFiles = [
  'src/repository/customization.js',
  'src/repository/reservation.js',
  'src/repository/order.js'
];

function fixUUIDInFile(filePath) {
  console.log(`Fixing UUID in ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove UUID import
  content = content.replace(/const { v4: uuidv4 } = require\('uuid'\);\n?/g, '');
  content = content.replace(/const { v4: uuidv4 } = require\("uuid"\);\n?/g, '');
  
  // Remove id: uuidv4() from data objects
  content = content.replace(/\s*id: uuidv4\(\),?\n?/g, '');
  
  // Clean up any double commas or trailing commas
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,(\s*})/g, '$1');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
}

// Fix all repository files
repositoryFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixUUIDInFile(filePath);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('All UUID fixes completed!');