const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files in packages
const files = glob.sync('packages/**/*.ts', { ignore: ['**/node_modules/**'] });

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Fix i18n."string" syntax
    const i18nPattern = /i18n\.\"([^"]+)\"/g;
    const i18nMatches = content.match(i18nPattern);
    if (i18nMatches) {
      content = content.replace(i18nPattern, (match, string) => {
        // Convert template string syntax
        const templateString = string.replace(/\$\{([^}]+)\}/g, '${$1}');
        return `\`${templateString}\``;
      });
      modified = true;
    }

    // Fix msg"string" syntax
    const msgPattern = /msg\"([^"]+)\"/g;
    const msgMatches = content.match(msgPattern);
    if (msgMatches) {
      content = content.replace(msgPattern, (match, string) => {
        // Convert template string syntax
        const templateString = string.replace(/\$\{([^}]+)\}/g, '${$1}');
        return `\`${templateString}\``;
      });
      modified = true;
    }

    // Fix broken i18n.msg"string" patterns
    const i18nMsgPattern = /i18n\.\s*msg\"([^"]+)\"/g;
    const i18nMsgMatches = content.match(i18nMsgPattern);
    if (i18nMsgMatches) {
      content = content.replace(i18nMsgPattern, (match, string) => {
        const templateString = string.replace(/\$\{([^}]+)\}/g, '${$1}');
        return `\`${templateString}\``;
      });
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`Fixed i18n syntax in: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('i18n syntax fix completed');
