const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎉 Completing Bagajatin Backend Setup...\n');

const tasks = [
  {
    name: 'Creating directory structure',
    action: () => {
      const dirs = [
        'uploads/profiles',
        'uploads/services', 
        'uploads/reviews',
        'uploads/documents',
        'uploads/misc',
        'logs'
      ];
      
      dirs.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
        }
      });
    }
  },
  {
    name: 'Generating environment file',
    action: () => {
      const envPath = path.join(__dirname, '..', '.env');
      if (!fs.existsSync(envPath)) {
        execSync('node scripts/setup-env.js');
      }
    }
  },
  {
    name: 'Generating API documentation',
    action: () => {
      execSync('node scripts/generateDocs.js');
    }
  },
  {
    name: 'Installing dependencies',
    action: () => {
      console.log('   Installing npm packages...');
      execSync('npm install', { stdio: 'inherit' });
    }
  }
];

// Execute tasks
tasks.forEach((task, index) => {
  try {
    console.log(`${index + 1}. ${task.name}...`);
    task.action();
    console.log('   ✅ Complete\n');
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
  }
});

console.log('🎊 Setup Complete! Next steps:\n');
console.log('1. Edit .env file with your configuration');
console.log('2. Start MongoDB service');
console.log('3. Run: npm run seed (to populate sample data)');
console.log('4. Run: npm run dev (to start development server)\n');
console.log('📚 Documentation:');
console.log('   - API Docs: ./API_DOCS.md');
console.log('   - Setup Guide: ./SETUP.md');
console.log('   - README: ./README.md\n');
console.log('🚀 Happy coding!');