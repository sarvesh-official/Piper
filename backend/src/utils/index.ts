import mongoose from 'mongoose';


export const connectToDatabase = async (): Promise<mongoose.Connection> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Successfully connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Optional: Implementing connection event handlers
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
