const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'app_logo.png');
const dest = path.join(__dirname, 'apps/mobile/assets/images/app_logo.png');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Logo copied successfully!');
} else {
  console.log('Source logo not found at ' + src);
}
