/**
 * Database Seed Script - Creates demo users
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Complaint.deleteMany({});
  console.log('🗑️  Cleared existing data');

  const salt = await bcrypt.genSalt(10);

  // Create demo users
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
  console.log('✅ Created demo users');

  // Create sample complaints
  await Complaint.create([
    {
      title: 'WiFi Not Working in Office',
      description: 'The office WiFi has been down since yesterday morning. Multiple users are affected and unable to work remotely. The router shows red light.',
      category: 'Network',
      priority: 'HIGH',
      status: 'Resolved',
      createdBy: user1._id,
      assignedAgent: agent1._id,
      resolvedAt: new Date(),
      messages: [
        { sender: user1._id, senderName: user1.name, senderRole: 'USER', text: 'Please fix this ASAP, it is affecting our work.' },
        { sender: agent1._id, senderName: agent1.name, senderRole: 'AGENT', text: 'I have escalated this to the network team. Will update soon.' },
        { sender: agent1._id, senderName: agent1.name, senderRole: 'AGENT', text: 'Issue resolved. The router was restarted and firmware updated.' },
      ],
    },
    {
      title: 'Software License Expired',
      description: 'Adobe Creative Suite license has expired on our design team machines. We are unable to complete ongoing projects.',
      category: 'Software',
      priority: 'HIGH',
      status: 'In Progress',
      createdBy: user1._id,
      assignedAgent: agent1._id,
      messages: [
        { sender: agent1._id, senderName: agent1.name, senderRole: 'AGENT', text: 'Working on license renewal. Should be resolved in 24 hours.' },
      ],
    },
    {
      title: 'Printer Not Responding',
      description: 'The HP printer on the 3rd floor is not responding to print commands. Paper jam error is shown but the tray is empty.',
      category: 'Hardware',
      priority: 'MEDIUM',
      status: 'Pending',
      createdBy: user2._id,
    },
    {
      title: 'Incorrect Invoice Amount',
      description: 'My last invoice shows an incorrect amount. I was charged double for the subscription plan.',
      category: 'Billing',
      priority: 'MEDIUM',
      status: 'Assigned',
      createdBy: user2._id,
      assignedAgent: agent2._id,
    },
    {
      title: 'Slow Response from Support Team',
      description: 'The support team is taking more than 5 days to respond to tickets. This needs immediate improvement.',
      category: 'Service',
      priority: 'LOW',
      status: 'Pending',
      createdBy: user1._id,
    },
  ]);

  console.log('✅ Created sample complaints');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Demo Credentials:');
  console.log('  Admin:  admin@demo.com  / admin123');
  console.log('  Agent:  agent@demo.com  / agent123');
  console.log('  User:   user@demo.com   / user123');
  console.log('\nRun: npm run dev to start the server');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
