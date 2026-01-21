const fs = require('fs');
const path = require('path');

const directories = [
  'uploads',
  'uploads/profiles',
  'uploads/services',
  'uploads/reviews',
  'uploads/documents',
  'uploads/misc'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
    
    // Create .gitkeep file
    fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
  }
});

console.log('Upload directories setup complete!');