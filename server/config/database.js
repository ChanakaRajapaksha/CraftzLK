const dns = require('dns');
const mongoose = require('mongoose');

// Windows/local DNS often refuses SRV lookups used by mongodb+srv URIs.
// Public resolvers fix querySrv ECONNREFUSED for MongoDB Atlas.
const DNS_SERVERS = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (DNS_SERVERS.length) {
  dns.setServers(DNS_SERVERS);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.CONNECTION_STRING, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;