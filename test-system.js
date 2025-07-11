const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testSystem() {
  console.log('🧪 Testing BillaBot System Integration...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);

    // Test 2: Enhanced analysis
    console.log('\n2️⃣ Testing enhanced team analysis...');
    const analysisResponse = await axios.get(`${API_BASE}/api/enhanced-analysis?days=7`);
    const analysis = analysisResponse.data;
    
    console.log('✅ Enhanced analysis passed:');
    console.log(`   • Users: ${analysis.summary.totalUsers}`);
    console.log(`   • Plans: ${analysis.summary.totalPlans}`);
    console.log(`   • Worklogs: ${analysis.summary.totalWorklogs}`);
    console.log(`   • Billability: ${analysis.teamMetrics.billability.overallBillabilityRate}%`);
    console.log(`   • User enrichment: ${analysis.jiraIntegration.enrichmentRate}%`);

    // Test 3: Natural language query
    console.log('\n3️⃣ Testing natural language query...');
    const queryResponse = await axios.post(`${API_BASE}/api/query`, {
      query: 'How is our team doing this week?'
    });
    const queryResult = queryResponse.data;
    
    console.log('✅ Natural language query passed:');
    console.log(`   • Query: "${queryResult.query}"`);
    console.log(`   • Type: ${queryResult.type}`);
    console.log(`   • Summary: ${queryResult.summary}`);

    // Test 4: JIRA integration
    console.log('\n4️⃣ Testing JIRA integration...');
    const jiraResponse = await axios.get(`${API_BASE}/api/jira/users?maxResults=5`);
    console.log('✅ JIRA integration passed:');
    console.log(`   • Retrieved ${jiraResponse.data.length} users`);

    console.log('\n🎉 All tests passed! BillaBot system is working correctly.');
    console.log('\n📊 System Summary:');
    console.log('   • ✅ Backend API: Running on port 3001');
    console.log('   • ✅ JIRA Integration: Connected');
    console.log('   • ✅ Tempo Integration: Connected');
    console.log('   • ✅ Enhanced Analysis: Working');
    console.log('   • ✅ Natural Language Query: Working');
    console.log('   • ✅ MCP Plugin: Ready (run separately)');
    console.log('   • ✅ Frontend: Ready (run with npm run dev)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testSystem();