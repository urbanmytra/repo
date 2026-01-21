const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const resetDatabase = async () => {
  try {
    console.log('⚠️  WARNING: This will delete ALL data in the database!');
    console.log('🔄 Resetting database...');
    
    // Drop all collections
    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      await collection.drop();
      console.log(`✅ Dropped collection: ${collection.collectionName}`);
    }
    
    console.log('🎉 Database reset completed successfully!');
    console.log('💡 Run "npm run seed" to populate with sample data.');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

const confirmReset = () => {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Are you sure you want to reset the database? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      rl.close();
      connectDB().then(resetDatabase);
    } else {
      console.log('❌ Database reset cancelled.');
      rl.close();
      process.exit(0);
    }
  });
};

if (require.main === module) {
  confirmReset();
}

module.exports = { resetDatabase };