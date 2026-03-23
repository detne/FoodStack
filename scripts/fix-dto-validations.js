/**
 * Script to fix all UUID validations in DTOs for MongoDB ObjectId compatibility
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all DTO files
const dtoFiles = glob.sync('src/dto/**/*.js');

function fixUUIDValidationInFile(filePath) {
  console.log(`Fixing UUID validation in ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace .uuid() with ObjectId validation (24 character hex string)
  const uuidRegex = /\.uuid\([^)]*\)/g;
  if (content.match(uuidRegex)) {
    content = content.replace(uuidRegex, '.regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")');
    changed = true;
  }
  
  // Also handle .uuid('message') format
  const uuidWithMessageRegex = /\.uuid\('([^']+)'\)/g;
  if (content.match(uuidWithMessageRegex)) {
    content = content.replace(uuidWithMessageRegex, '.regex(/^[0-9a-fA-F]{24}$/, "$1")');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Fix all DTO files
dtoFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixUUIDValidationInFile(filePath);
  }
});

console.log('All DTO UUID validation fixes completed!');