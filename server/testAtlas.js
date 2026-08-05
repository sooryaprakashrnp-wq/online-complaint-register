const mongoose = require('mongoose');

const uri = 'mongodb+srv://sooryaprakashrnp_db_user:FioUFZeRNcOJmxqv@crcluster0.qsjbkzj.mongodb.net/complaint_db?appName=CRCluster0&retryWrites=true&w=majority';

console.log('⏳ Connecting to MongoDB Atlas...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(conn => {
    console.log('✅ CONNECTED SUCCESSFULLY TO MONGODB ATLAS!');
    console.log('Host:', conn.connection.host);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MONGODB CONNECTION FAILED:', err.message);
    process.exit(1);
  });
