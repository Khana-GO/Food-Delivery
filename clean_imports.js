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

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace multiple occurrences of the import with a single one
  const importStatement = "import { Text } from '@/components/ui/Text';\n";
  const regex = new RegExp(`(import \\{ Text \\} from '@\\/components\\/ui\\/Text';\\s*)+`, 'g');
  
  content = content.replace(regex, importStatement);
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned duplicate imports in ${file}`);
  }
}
