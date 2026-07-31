const axios = require('axios');

async function testFullFlow() {
  const baseURL = 'http://localhost:5000/api';
  console.log('1. Testing Health Endpoint...');
  const health = await axios.get('http://localhost:5000/api/health');
  console.log('   Health OK:', health.data.success);

  console.log('2. Testing User Authentication (Login)...');
  const userLogin = await axios.post(`${baseURL}/auth/login`, { email: 'user@demo.com', password: 'user123' });
  const userToken = userLogin.data.token;
  console.log('   User Login OK:', userLogin.data.user.name);

  console.log('3. Submitting New Complaint as User...');
  const newComplaint = await axios.post(`${baseURL}/complaints`, {
    title: 'System Verification Test Issue',
    description: 'Testing full-stack integration and transfer from user to agent in detail.',
    category: 'Software',
    priority: 'HIGH'
  }, { headers: { Authorization: `Bearer ${userToken}` } });
  const complaintId = newComplaint.data.complaint._id;
  console.log('   Complaint Created ID:', complaintId);

  console.log('4. Logging in as Admin...');
  const adminLogin = await axios.post(`${baseURL}/auth/login`, { email: 'admin@demo.com', password: 'admin123' });
  const adminToken = adminLogin.data.token;
  console.log('   Admin Login OK:', adminLogin.data.user.name);

  console.log('5. Fetching Agents list as Admin...');
  const agentsRes = await axios.get(`${baseURL}/agents`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const agent = agentsRes.data.agents[0];
  console.log('   Found Agent:', agent.name, `(${agent._id})`);

  console.log('6. Assigning Complaint to Agent as Admin...');
  const assignRes = await axios.put(`${baseURL}/agents/assign`, {
    complaintId,
    agentId: agent._id
  }, { headers: { Authorization: `Bearer ${adminToken}` } });
  console.log('   Assign OK:', assignRes.data.message);

  console.log('7. Logging in as Agent...');
  const agentLogin = await axios.post(`${baseURL}/auth/login`, { email: agent.email, password: 'agent123' });
  const agentToken = agentLogin.data.token;
  console.log('   Agent Login OK:', agentLogin.data.user.name);

  console.log('8. Fetching Agent Dashboard Complaints...');
  const agentDashboard = await axios.get(`${baseURL}/agents/dashboard`, { headers: { Authorization: `Bearer ${agentToken}` } });
  const assignedComplaint = agentDashboard.data.complaints.find(c => c._id === complaintId);
  console.log('   Assigned Complaint Received by Agent:', !!assignedComplaint);

  console.log('9. Agent Updating Status to In Progress...');
  await axios.put(`${baseURL}/complaints/${complaintId}`, { status: 'In Progress' }, { headers: { Authorization: `Bearer ${agentToken}` } });
  
  console.log('10. Agent Sending Chat Message...');
  await axios.post(`${baseURL}/complaints/${complaintId}/message`, { text: 'I am resolving this issue now.' }, { headers: { Authorization: `Bearer ${agentToken}` } });
  console.log('   Chat Message Sent!');

  console.log('11. Agent Marking Complaint as Resolved...');
  await axios.put(`${baseURL}/complaints/${complaintId}`, { status: 'Resolved' }, { headers: { Authorization: `Bearer ${agentToken}` } });
  console.log('   Complaint Status Updated to Resolved!');

  console.log('12. Submitting Feedback as User...');
  const fbRes = await axios.post(`${baseURL}/feedback`, {
    complaintId,
    rating: 5,
    comment: 'Excellent resolution!'
  }, { headers: { Authorization: `Bearer ${userToken}` } });
  console.log('   Feedback Submitted OK:', fbRes.data.message);

  console.log('\n🎉 ALL SYSTEM WORKFLOW TESTS PASSED SUCCESSFULLY!');
}

testFullFlow().catch(err => {
  console.error('❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});
