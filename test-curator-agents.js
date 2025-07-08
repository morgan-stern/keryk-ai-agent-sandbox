#!/usr/bin/env node

/**
 * Test script to verify Curator agent data is being fetched correctly
 * This checks both the Mentor backend and keryk_sandbox API routes
 */

async function testCuratorAgents() {
  console.log('Testing Curator Agent Data Fetching...\n');
  
  const mentorBackendUrl = 'http://localhost:8080';
  const kerykApiUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check Mentor backend curator-data endpoint
    console.log('1. Testing Mentor Backend /api/curator-data/agents...');
    const mentorResponse = await fetch(`${mentorBackendUrl}/api/curator-data/agents`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      }
    });
    
    if (mentorResponse.ok) {
      const mentorData = await mentorResponse.json();
      console.log(`✅ Mentor backend returned ${mentorData.agents?.length || 0} agents`);
      
      if (mentorData.agents && mentorData.agents.length > 0) {
        console.log('\nAgent details from Mentor:');
        mentorData.agents.forEach((agent, index) => {
          console.log(`\n${index + 1}. ${agent.name} (ID: ${agent.id})`);
          console.log(`   Description: ${agent.description}`);
          console.log(`   System Prompt Length: ${agent.configuration?.systemPrompt?.length || 0} characters`);
          if (agent.configuration?.systemPrompt) {
            console.log(`   System Prompt Preview: ${agent.configuration.systemPrompt.substring(0, 100)}...`);
          }
        });
      }
    } else {
      console.log(`❌ Mentor backend error: ${mentorResponse.status} ${mentorResponse.statusText}`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test 2: Check keryk_sandbox API endpoint
    console.log('2. Testing Keryk Sandbox /api/agents...');
    const kerykResponse = await fetch(`${kerykApiUrl}/api/agents`);
    
    if (kerykResponse.ok) {
      const kerykData = await kerykResponse.json();
      console.log(`✅ Keryk API returned ${kerykData.agents?.length || 0} agents`);
      console.log(`   Source: ${kerykData.source || 'unknown'}`);
      
      if (kerykData.agents && kerykData.agents.length > 0) {
        console.log('\nAgent details from Keryk:');
        kerykData.agents.forEach((agent, index) => {
          console.log(`\n${index + 1}. ${agent.name} (ID: ${agent.id})`);
          console.log(`   Description: ${agent.description}`);
          console.log(`   System Prompt Length: ${agent.systemPrompt?.length || 0} characters`);
          if (agent.systemPrompt) {
            console.log(`   System Prompt Preview: ${agent.systemPrompt.substring(0, 100)}...`);
          }
        });
        
        // Check for specific agents mentioned by user
        const specificAgents = ['Duke Rules Agent', 'Adders Expert', 'MUTCD_TA_Specialist'];
        console.log('\n' + '='.repeat(80) + '\n');
        console.log('3. Checking specific agents mentioned by user:');
        
        specificAgents.forEach(agentName => {
          const agent = kerykData.agents.find(a => 
            a.name === agentName || 
            a.displayName === agentName ||
            a.name.toLowerCase().includes(agentName.toLowerCase())
          );
          
          if (agent) {
            console.log(`\n✅ Found ${agentName}:`);
            console.log(`   ID: ${agent.id}`);
            console.log(`   System Prompt Length: ${agent.systemPrompt?.length || 0} characters`);
            if (agent.systemPrompt && agent.systemPrompt.length > 100) {
              console.log(`   ✅ Has full system prompt (not a mock)`);
            } else {
              console.log(`   ❌ Has placeholder/mock system prompt`);
            }
          } else {
            console.log(`\n❌ ${agentName} not found in response`);
          }
        });
      }
    } else {
      console.log(`❌ Keryk API error: ${kerykResponse.status} ${kerykResponse.statusText}`);
    }
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    console.log('\nMake sure both services are running:');
    console.log('1. Mentor backend: cd /Users/morganstern/mentor/packages/backend && npm run dev');
    console.log('2. Keryk sandbox: cd /Users/morganstern/keryk_sandbox && npm run dev');
  }
}

// Run the test
testCuratorAgents();