#!/usr/bin/env node

/**
 * Test script to verify agents are using their system prompts correctly
 */

async function testAgentChat() {
  console.log('Testing Agent Chat with System Prompts...\n');
  
  const apiUrl = 'http://localhost:3000';
  
  try {
    // First, get the list of agents
    console.log('1. Fetching agents...');
    const agentsResponse = await fetch(`${apiUrl}/api/agents`);
    
    if (!agentsResponse.ok) {
      throw new Error(`Failed to fetch agents: ${agentsResponse.status}`);
    }
    
    const agentsData = await agentsResponse.json();
    const agents = agentsData.agents || [];
    
    console.log(`Found ${agents.length} agents\n`);
    
    // Find the Adders Expert agent
    const addersExpert = agents.find(a => 
      a.name === 'Adders Expert' || 
      a.displayName === 'Adders Expert'
    );
    
    if (!addersExpert) {
      console.log('❌ Adders Expert not found');
      return;
    }
    
    console.log(`2. Testing Adders Expert (ID: ${addersExpert.id})`);
    console.log(`   System Prompt Length: ${addersExpert.systemPrompt?.length || 0} characters`);
    if (addersExpert.systemPrompt?.includes('Mock data')) {
      console.log('   ⚠️  Using mock data - real system prompts require Mentor backend');
    }
    console.log();
    
    // Test question about PTRS eligibility that should be in the prompt
    const testMessage = "What are the eligibility requirements for PTRS? Please list all requirements including road type, lanes, speed limit, etc.";
    
    console.log('3. Sending test message:');
    console.log(`   "${testMessage}"\n`);
    
    const messageResponse = await fetch(`${apiUrl}/api/agents/${addersExpert.id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: testMessage })
    });
    
    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      throw new Error(`Failed to send message: ${messageResponse.status} - ${error}`);
    }
    
    const messageData = await messageResponse.json();
    const aiResponse = messageData.response?.message;
    
    console.log('4. Agent Response:');
    console.log('=' .repeat(80));
    console.log(aiResponse);
    console.log('=' .repeat(80));
    
    // Check if response contains expected PTRS details
    console.log('\n5. Response Analysis:');
    const expectedTerms = ['tertiary', 'secondary', 'primary', '2', '45 mph', 'centerline'];
    const foundTerms = expectedTerms.filter(term => 
      aiResponse.toLowerCase().includes(term.toLowerCase())
    );
    
    if (foundTerms.length >= 4) {
      console.log('✅ Response appears to be using the system prompt!');
      console.log(`   Found ${foundTerms.length}/${expectedTerms.length} expected terms: ${foundTerms.join(', ')}`);
    } else {
      console.log('❌ Response may not be using the full system prompt');
      console.log(`   Only found ${foundTerms.length}/${expectedTerms.length} expected terms: ${foundTerms.join(', ')}`);
      console.log('   Expected to find: tertiary, secondary, primary, 2 lanes, 45 mph, centerline');
    }
    
    // Also test another agent to compare
    console.log('\n' + '='.repeat(80) + '\n');
    
    const dukeRules = agents.find(a => 
      a.name === 'Duke Rules Agent' || 
      a.displayName === 'Duke Rules Agent'
    );
    
    if (dukeRules) {
      console.log(`6. Testing Duke Rules Agent (ID: ${dukeRules.id})`);
      console.log(`   System Prompt Length: ${dukeRules.systemPrompt?.length || 0} characters\n`);
      
      const dukeMessage = "What are Duke University's policies on academic integrity?";
      
      const dukeResponse = await fetch(`${apiUrl}/api/agents/${dukeRules.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: dukeMessage })
      });
      
      if (dukeResponse.ok) {
        const dukeData = await dukeResponse.json();
        console.log('Duke Rules Agent Response Preview:');
        console.log(dukeData.response?.message?.substring(0, 200) + '...\n');
      }
    }
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    console.log('\nMake sure the service is running:');
    console.log('cd /Users/morganstern/keryk_sandbox && npm run dev');
  }
}

// Run the test
testAgentChat();