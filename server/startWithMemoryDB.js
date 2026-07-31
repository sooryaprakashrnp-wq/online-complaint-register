/**
 * In-memory MongoDB database runner & seeder
 */
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

const startInMemoryDB = async () => {
  console.log('🚀 Starting MongoMemoryServer...');
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'complaint_db' }
  });
  const uri = mongod.getUri();
  console.log(`✅ MongoDB Memory Server running at: ${uri}`);

  await mongoose.connect(uri);
  console.log('✅ Connected to In-Memory MongoDB!');


  // Seed Initial Data — plain-text passwords (User model pre-save hook hashes them)
  await User.deleteMany({});
  await Complaint.deleteMany({});

  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'ADMIN',
      phone: '+91 9000000001',
      isActive: true,
    },
    {
      name: 'Agent One',
      email: 'agent@demo.com',
      password: 'agent123',
      role: 'AGENT',
      phone: '+91 9000000002',
      isActive: true,
    },
    {
      name: 'Agent Two',
      email: 'agent2@demo.com',
      password: 'agent123',
      role: 'AGENT',
      phone: '+91 9000000003',
      isActive: true,
    },
    {
      name: 'Soorya Prakash',
      email: 'user@demo.com',
      password: 'user123',
      role: 'USER',
      phone: '+91 9000000004',
      isActive: true,
    },
    {
      name: 'Demo User 2',
      email: 'user2@demo.com',
      password: 'user123',
      role: 'USER',
      phone: '+91 9000000005',
      isActive: true,
    },
  ]);


  const [admin, agent1, agent2, user1, user2] = users;

  await Complaint.create([
    {
      title: 'WiFi Not Working in Office',
      description: 'The office WiFi has been down since yesterday morning. Multiple users are affected and unable to work remotely.',
      category: 'Network',
      priority: 'HIGH',
      status: 'Resolved',
      createdBy: user1._id,
      assignedAgent: agent1._id,
      resolvedAt: new Date(),
      messages: [
        { sender: user1._id, senderName: user1.name, senderRole: 'USER', text: 'Please fix this ASAP.' },
        { sender: agent1._id, senderName: agent1.name, senderRole: 'AGENT', text: 'Working on it.' },
        { sender: agent1._id, senderName: agent1.name, senderRole: 'AGENT', text: 'Issue resolved.' },
      ],
    },
    {
      title: 'Software License Expired',
      description: 'Adobe Creative Suite license expired on design team machines.',
      category: 'Software',
      priority: 'HIGH',
      status: 'In Progress',
      createdBy: user1._id,
      assignedAgent: agent1._id,
      messages: [
        { sender: agent1._id, senderName: agent1.name, senderRole: 'AGENT', text: 'License renewal in progress.' },
      ],
    },
    {
      title: 'Printer Not Responding',
      description: 'The HP printer on 3rd floor is not responding to print commands.',
      category: 'Hardware',
      priority: 'MEDIUM',
      status: 'Pending',
      createdBy: user2._id,
    },
    {
      title: 'Incorrect Invoice Amount',
      description: 'My last invoice shows an incorrect charge amount.',
      category: 'Billing',
      priority: 'MEDIUM',
      status: 'Assigned',
      createdBy: user2._id,
      assignedAgent: agent2._id,
    },
  ]);

  console.log('🎉 Database seeded successfully!');
  console.log('🚀 Starting Express Server...');
  require('./server.js');
};

startInMemoryDB().catch(err => {
  console.error('❌ Failed to start DB:', err);
});
