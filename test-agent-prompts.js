#!/usr/bin/env node
/**
 * Test script to verify agent system prompts are available in keryk_sandbox
 */

async function testAgentPrompts() {
  console.log('🔍 Testing Agent System Prompts in Keryk Sandbox\n');
  
  try {
    // Test the keryk_sandbox API endpoint
    console.log('1️⃣ Testing keryk_sandbox /api/agents endpoint...');
    const response = await fetch('http://localhost:3000/api/agents');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data.agents?.length || 0} agents`);
    console.log(`📊 Data source: ${data.source || 'unknown'}`);
    
    // Check each agent for system prompts
    console.log('\n2️⃣ Checking system prompts:');
    data.agents?.forEach((agent, index) => {
      const hasPrompt = !!agent.systemPrompt;
      const promptLength = agent.systemPrompt?.length || 0;
      
      console.log(`\n${index + 1}. ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Has systemPrompt: ${hasPrompt ? '✅ Yes' : '❌ No'}`);
      if (hasPrompt) {
        console.log(`   Prompt length: ${promptLength} characters`);
        console.log(`   First 100 chars: "${agent.systemPrompt.substring(0, 100)}..."`);
      }
    });
    
    // Check if we're getting real data from Curator
    const lumosAgent = data.agents?.find(a => a.name.includes('Lumos'));
    if (lumosAgent && lumosAgent.systemPrompt) {
      const promptLength = lumosAgent.systemPrompt.length;
      console.log('\n3️⃣ Lumos Agent Check:');
      console.log(`   Prompt length: ${promptLength} characters`);
      if (promptLength > 10000) {
        console.log('   ✅ Full system prompt from Curator!');
      } else if (promptLength > 100) {
        console.log('   ⚠️  Partial prompt (possibly truncated)');
      } else {
        console.log('   ❌ Mock prompt detected');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure keryk_sandbox is running on port 3001');
  }
}

// Run the test
testAgentPrompts();