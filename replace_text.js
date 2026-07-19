const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'apps/mobile/src'));

let filesModified = 0;

for (const file of files) {
  if (file.includes('components\\ui\\Text.tsx') || file.includes('components/ui/Text.tsx')) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  
  const rnImportRegex = /import\s+{([^}]+)}\s+from\s+['"]react-native['"]/g;
  
  let needsTextImport = false;
  
  content = content.replace(rnImportRegex, (match, imports) => {
    if (imports.includes('Text')) {
      needsTextImport = true;
      let newImports = imports.split(',').map(i => i.trim()).filter(i => i !== 'Text' && i !== '');
      if (newImports.length === 0) {
        return `// import removed`;
      }
      return `import { ${newImports.join(', ')} } from 'react-native'`;
    }
    return match;
  });
  
  if (needsTextImport) {
    content = `import { Text } from '@/components/ui/Text';\n` + content;
    fs.writeFileSync(file, content, 'utf8');
    filesModified++;
  }
}

console.log(`Updated ${filesModified} files to use custom Text component.`);
