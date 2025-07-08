#!/usr/bin/env node

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

async function addTestAgents() {
  const log = (msg) => process.stdout.write(msg + '\n');
  
  try {
    // Initialize Firebase Admin
    const serviceAccountPath = path.join(__dirname, '..', 'sme-interview-platform-f46ddf880bf2.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      log('❌ Service account file not found: ' + serviceAccountPath);
      process.exit(1);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    const db = getFirestore();
    log('✅ Firebase Admin initialized');
    
    // Test agents with proper structure
    const testAgents = [
      {
        id: 'traffic-agent',
        name: 'Traffic Law Expert',
        displayName: 'Traffic Law Expert',
        description: 'Expert in traffic laws, MUTCD standards, and road safety regulations',
        domainId: 'traffic',
        specialization: ['traffic-law', 'mutcd', 'road-safety'],
        systemPrompt: 'You are an expert in traffic laws and MUTCD standards. Provide accurate, helpful information about traffic regulations.',
        configuration: {
          systemPrompt: 'You are an expert in traffic laws and MUTCD standards. Provide accurate, helpful information about traffic regulations.',
          temperature: 0.7,
          maxTokens: 2048,
          model: 'gpt-4'
        },
        capabilities: {
          supportsVoice: true,
          supportsInterruptions: true,
          supportsFunctionCalling: true
        },
        tools: [],
        handoffConfig: {
          canHandoff: true,
          handoffAgents: ['legal-agent', 'safety-agent']
        },
        knowledgeDomain: {
          name: 'Traffic Law',
          description: 'Traffic laws and MUTCD standards',
          expertiseAreas: ['traffic-signals', 'road-signs', 'traffic-control']
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          tags: ['traffic', 'law', 'mutcd'],
          rating: 4.8,
          responseTime: 125
        },
        isActive: true,
        llmConfig: {
          model: 'gpt-4',
          systemPrompt: 'You are an expert in traffic laws and MUTCD standards. Provide accurate, helpful information about traffic regulations, road signs, signals, and safety requirements. Always cite specific MUTCD sections when applicable.',
          temperature: 0.7,
          maxTokens: 2048,
          responseStyle: 'detailed'
        },
        voiceConfig: {
          enabled: true,
          personality: 'professional',
          speechRate: 1.0,
          language: 'en-US'
        },
        curatorBinding: {
          corpusIds: ['traffic-corpus'],
          analysisTypes: ['legal', 'technical'],
          knowledgeLabels: ['traffic-law'],
          vectorCollections: ['traffic-vectors'],
          searchIndexes: ['traffic-search'],
          contextWindowSize: 2048
        },
        accessRoles: [],
        metrics: {
          totalSessions: 0,
          avgSessionDuration: 0,
          satisfactionScore: 0
        }
      },
      {
        id: 'legal-agent',
        name: 'Legal Assistant',
        displayName: 'Legal Assistant',
        description: 'AI legal assistant for general legal information and document analysis',
        domainId: 'legal',
        specialization: ['legal-research', 'contracts', 'compliance'],
        systemPrompt: 'You are a legal assistant. Provide general legal information while being clear that you are not providing legal advice.',
        configuration: {
          systemPrompt: 'You are a legal assistant. Provide general legal information while being clear that you are not providing legal advice.',
          temperature: 0.5,
          maxTokens: 2048,
          model: 'gpt-4'
        },
        capabilities: {
          supportsVoice: true,
          supportsInterruptions: true,
          supportsFunctionCalling: true
        },
        tools: [],
        handoffConfig: {
          canHandoff: true,
          handoffAgents: ['traffic-agent']
        },
        knowledgeDomain: {
          name: 'Legal',
          description: 'General legal information and guidance',
          expertiseAreas: ['contracts', 'compliance', 'regulations']
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          tags: ['legal', 'contracts', 'compliance'],
          rating: 4.9,
          responseTime: 180
        },
        isActive: true,
        llmConfig: {
          model: 'gpt-4',
          systemPrompt: 'You are a knowledgeable legal assistant. Provide clear, accurate general legal information while always noting that you cannot provide legal advice. Help users understand legal concepts, terminology, and processes.',
          temperature: 0.5,
          maxTokens: 2048,
          responseStyle: 'detailed'
        },
        voiceConfig: {
          enabled: true,
          personality: 'professional',
          speechRate: 1.0,
          language: 'en-US'
        },
        curatorBinding: {
          corpusIds: ['legal-corpus'],
          analysisTypes: ['legal', 'regulatory'],
          knowledgeLabels: ['legal-docs'],
          vectorCollections: ['legal-vectors'],
          searchIndexes: ['legal-search'],
          contextWindowSize: 2048
        },
        accessRoles: [],
        metrics: {
          totalSessions: 0,
          avgSessionDuration: 0,
          satisfactionScore: 0
        }
      },
      {
        id: 'safety-agent',
        name: 'Safety Advisor',
        displayName: 'Safety Advisor',
        description: 'Expert in workplace and road safety regulations and best practices',
        domainId: 'safety',
        specialization: ['workplace-safety', 'road-safety', 'emergency-response'],
        systemPrompt: 'You are a safety expert. Provide comprehensive safety guidance and best practices.',
        configuration: {
          systemPrompt: 'You are a safety expert. Provide comprehensive safety guidance and best practices.',
          temperature: 0.6,
          maxTokens: 2048,
          model: 'gpt-4'
        },
        capabilities: {
          supportsVoice: true,
          supportsInterruptions: true,
          supportsFunctionCalling: true
        },
        tools: [],
        handoffConfig: {
          canHandoff: true,
          handoffAgents: ['traffic-agent', 'legal-agent']
        },
        knowledgeDomain: {
          name: 'Safety',
          description: 'Safety regulations and best practices',
          expertiseAreas: ['workplace-safety', 'road-safety', 'emergency-procedures']
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          tags: ['safety', 'regulations', 'emergency'],
          rating: 4.7,
          responseTime: 95
        },
        isActive: true,
        llmConfig: {
          model: 'gpt-4',
          systemPrompt: 'You are a safety expert specializing in workplace and road safety. Provide practical, actionable safety advice and help users understand safety regulations, best practices, and emergency procedures.',
          temperature: 0.6,
          maxTokens: 2048,
          responseStyle: 'detailed'
        },
        voiceConfig: {
          enabled: true,
          personality: 'friendly',
          speechRate: 1.0,
          language: 'en-US'
        },
        curatorBinding: {
          corpusIds: ['safety-corpus'],
          analysisTypes: ['safety', 'regulatory'],
          knowledgeLabels: ['safety-regs'],
          vectorCollections: ['safety-vectors'],
          searchIndexes: ['safety-search'],
          contextWindowSize: 2048
        },
        accessRoles: [],
        metrics: {
          totalSessions: 0,
          avgSessionDuration: 0,
          satisfactionScore: 0
        }
      }
    ];
    
    // Add agents to Firestore
    const batch = db.batch();
    
    for (const agent of testAgents) {
      const agentRef = db.collection('mentor_agents').doc(agent.id);
      batch.set(agentRef, agent, { merge: true });
      log(`📝 Prepared agent: ${agent.name} (${agent.id})`);
    }
    
    await batch.commit();
    log('\n✅ Successfully added test agents to Firebase');
    
    // Verify they were saved
    const snapshot = await db.collection('mentor_agents').get();
    log(`\n📊 Total agents in database: ${snapshot.size}`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      log(`  - ${data.name} (${doc.id}) - Active: ${data.isActive}`);
    });
    
  } catch (error) {
    log('❌ Error: ' + error.message);
    process.exit(1);
  }
}

addTestAgents().then(() => {
  process.stdout.write('\n✅ Done!\n');
  process.exit(0);
}).catch(error => {
  process.stderr.write('\n❌ Failed: ' + error.message + '\n');
  process.exit(1);
});