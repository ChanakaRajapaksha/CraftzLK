const dns = require('dns').promises;
require('dotenv/config');

const DNS_SERVERS = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (DNS_SERVERS.length) {
  require('dns').setServers(DNS_SERVERS);
}

async function testConnection() {
  const connectionString = process.env.CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ CONNECTION_STRING not found in .env file');
    return;
  }

  console.log('📋 Connection String (masked):');
  const masked = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log(`   ${masked.substring(0, 100)}...\n`);

  // Extract hostname
  let hostname;
  if (connectionString.startsWith('mongodb+srv://')) {
    const match = connectionString.match(/mongodb\+srv:\/\/[^@]+@([^/]+)/);
    if (match) {
      hostname = match[1];
    }
  }

  if (hostname) {
    console.log(`🔍 Testing DNS resolution for: ${hostname}`);
    const srvRecord = `_mongodb._tcp.${hostname}`;
    
    try {
      const records = await dns.resolveSrv(srvRecord);
      console.log(`✅ DNS SRV resolution successful!`);
      console.log(`   Found ${records.length} SRV record(s):`);
      records.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.name}:${record.port} (priority: ${record.priority}, weight: ${record.weight})`);
      });
    } catch (dnsError) {
      console.error(`❌ DNS SRV resolution failed:`);
      console.error(`   Error: ${dnsError.message}`);
      console.error(`   SRV Record: ${srvRecord}`);
      console.error(`\n💡 This means your DNS cannot resolve the MongoDB Atlas hostname.`);
      console.error(`\n   Solutions:`);
      console.error(`   1. Verify the connection string from MongoDB Atlas dashboard`);
      console.error(`   2. Check your internet connection`);
      console.error(`   3. Try flushing DNS: ipconfig /flushdns`);
      console.error(`   4. Check firewall/proxy settings`);
      return;
    }

    // Test regular DNS resolution
    try {
      console.log(`\n🔍 Testing regular DNS resolution for: ${hostname}`);
      const addresses = await dns.resolve4(hostname);
      console.log(`✅ DNS A record resolution successful!`);
      console.log(`   IP addresses: ${addresses.join(', ')}`);
    } catch (dnsError) {
      console.error(`⚠️  DNS A record resolution failed: ${dnsError.message}`);
    }
  }

  // Test MongoDB connection
  console.log(`\n🔄 Testing MongoDB connection...`);
  const mongoose = require('mongoose');
  
  try {
    const conn = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connection successful!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    await mongoose.disconnect();
    console.log(`\n✅ All tests passed!`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed:`);
    console.error(`   Error: ${error.message}`);
  }
}

testConnection().catch(console.error);




