const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/TSX files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'documentation') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to replace remaining Lingui usage in a file
function replaceLinguiInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace msg`string` with "string"
    const msgRegex = /msg`([^`]*)`/g;
    if (content.match(msgRegex)) {
      content = content.replace(msgRegex, '"$1"');
      modified = true;
    }

    // Replace _(msg`string`) with "string"
    const underscoreMsgRegex = /_\(msg`([^`]*)`\)/g;
    if (content.match(underscoreMsgRegex)) {
      content = content.replace(underscoreMsgRegex, '"$1"');
      modified = true;
    }

    // Replace _(variable) with variable (for non-string variables)
    const underscoreVarRegex = /_\(([^)]+)\)/g;
    if (content.match(underscoreVarRegex)) {
      content = content.replace(underscoreVarRegex, '$1');
      modified = true;
    }

    // Remove i18n.loadAndActivate calls
    const i18nRegex = /i18n\.loadAndActivate\(\{[^}]+\}\);\s*\n?/g;
    if (content.match(i18nRegex)) {
      content = content.replace(i18nRegex, '');
      modified = true;
    }

    // Remove getTranslations imports and usage
    const getTranslationsImportRegex = /import\s*{\s*getTranslations\s*}\s*from\s*['"]@documenso\/lib\/utils\/i18n['"];?\s*\n?/g;
    if (content.match(getTranslationsImportRegex)) {
      content = content.replace(getTranslationsImportRegex, '');
      modified = true;
    }

    const getTranslationsUsageRegex = /const\s+messages\s*=\s*await\s+getTranslations\([^)]+\);\s*\n?/g;
    if (content.match(getTranslationsUsageRegex)) {
      content = content.replace(getTranslationsUsageRegex, '');
      modified = true;
    }

    // Remove messages from destructuring
    content = content.replace(/,\s*messages\s*/g, '');
    content = content.replace(/messages,\s*/g, '');

    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('Fixing remaining Lingui usage...');

// Find all TypeScript files
const tsFiles = findTsFiles('.');

console.log(`Found ${tsFiles.length} TypeScript files`);

// Process each file
tsFiles.forEach(file => {
  if (!file.includes('node_modules') && !file.includes('.git')) {
    replaceLinguiInFile(file);
  }
});

console.log('Lingui cleanup completed!');
