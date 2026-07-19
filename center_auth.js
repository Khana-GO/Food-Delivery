const fs = require('fs');

const filesToUpdate = [
  'apps/mobile/src/app/auth/login.tsx',
  'apps/mobile/src/app/auth/register.tsx',
  'apps/mobile/src/app/auth/otp.tsx'
];

filesToUpdate.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(
      /container:\s*\{\s*flexGrow:\s*1,\s*paddingHorizontal:\s*24,\s*paddingBottom:\s*40\s*\}/,
      "container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'center' }"
    );
    
    content = content.replace(
      /container:\s*\{\s*flexGrow:\s*1,\s*paddingHorizontal:\s*24,\s*paddingBottom:\s*24\s*\}/,
      "container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'center' }"
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } catch (e) {
    console.log(`Failed to update ${file}: ${e.message}`);
  }
});
