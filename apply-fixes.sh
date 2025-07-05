#\!/bin/bash

# Update import
sed -i '' 's|import { useAgent } from '\''@/hooks/useAgent'\''|import { useAgentAPI } from '\''@/hooks/useAgentAPI'\''|' src/components/ChatInterface.tsx

# Update hook usage  
sed -i '' 's|const { agent, loading, error } = useAgent(agentId)|const { agent, loading, error } = useAgentAPI(agentId)|' src/components/ChatInterface.tsx

# Fix modal placement - move modal inside the div
# Find line 380 and replace the space before modal with proper indentation
sed -i '' '380c\
\
      {/* Agent Configuration Modal */}' src/components/ChatInterface.tsx

# Move the closing div to the very end
sed -i '' '$c\
      )}\
    </div>\
  )\
}' src/components/ChatInterface.tsx

echo "Applied fixes"
