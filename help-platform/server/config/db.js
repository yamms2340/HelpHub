const mongoose = require('mongoose');

// Configure mongoose settings
mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false); // Disable command buffering
mongoose.set('debug', process.env.NODE_ENV === 'development'); // Only debug in development

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helphub';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Check your MONGODB_URI environment variable');
    process.exit(1);
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔴 MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;
