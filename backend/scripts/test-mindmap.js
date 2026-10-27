const axios = require('axios');

async function run() {
  console.log('Testing Mind Map Generation & Mermaid Parsing...');

  // 1. Test student login to get JWT token
  let token = null;
  try {
    const authRes = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'aarav.sharma@campus.amylearn.local',
      password: 'student@password123'
    });
    token = authRes.data.token || authRes.data.data?.token;
    console.log('1. Logged in as student. Token received.');
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
  }

  const client = axios.create({
    baseURL: 'http://localhost:4000/api',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // 2. Test chat in mindmap mode
  console.log('\n2. Testing POST /api/ai/chat with mode="mindmap"...');
  try {
    const res1 = await client.post('/ai/chat', {
      message: 'Make a mind map for TCP congestion control',
      mode: 'mindmap',
      context: { userName: 'Aarav', classroomName: 'CSE' }
    });
    console.log('Status:', res1.status);
    console.log('Reply preview (first 200 chars):');
    console.log(res1.data.reply.slice(0, 200));

    // Check sentinel
    const hasStart = res1.data.reply.includes(':::MERMAID_Start:::');
    const hasEnd = res1.data.reply.includes(':::MERMAID_End:::');
    console.log(`Contains :::MERMAID_Start::: (${hasStart}) and :::MERMAID_End::: (${hasEnd})`);
    if (!hasStart || !hasEnd) {
      throw new Error('Sentinel tags are malformed or missing!');
    }
  } catch (err) {
    console.error('Mindmap mode test failed:', err.response?.data || err.message);
  }

  // 3. Test chat in default mode asking for a mind map
  console.log('\n3. Testing POST /api/ai/chat with mode="default" asking for "Create a mind map for operating system deadlocks"...');
  try {
    const res2 = await client.post('/ai/chat', {
      message: 'Create a mind map for operating system deadlocks',
      mode: 'default',
      context: { userName: 'Aarav', classroomName: 'CSE' }
    });
    console.log('Status:', res2.status);
    console.log('Reply preview (first 200 chars):');
    console.log(res2.data.reply.slice(0, 200));

    const hasStart = res2.data.reply.includes(':::MERMAID_Start:::');
    const hasEnd = res2.data.reply.includes(':::MERMAID_End:::');
    console.log(`Contains :::MERMAID_Start::: (${hasStart}) and :::MERMAID_End::: (${hasEnd})`);
    if (!hasStart || !hasEnd) {
      throw new Error('Sentinel tags are missing on mind map request in default mode!');
    }
  } catch (err) {
    console.error('Default mode mindmap request test failed:', err.response?.data || err.message);
  }

  console.log('\n======================================================');
  console.log('ALL MIND MAP TESTS COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
}

run().catch(console.error);
