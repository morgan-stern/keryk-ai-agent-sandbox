# Keryk AI Agent Sandbox

A lightweight, mobile-friendly web application for demonstrating Keryk AI agents through text and voice interactions.

## Features

- 🤖 **Single Agent Interactions** - Focused conversations with one agent at a time
- 💬 **Text Chat Mode** - Traditional messaging interface with typing indicators
- 🎤 **Voice Chat Mode** - Real-time voice conversations using OpenAI Realtime API
- 📱 **Mobile First** - Optimized for touch devices and small screens
- 🌙 **Dark Mode Default** - Easy on the eyes in any lighting condition
- 🔒 **Secure Access** - Firebase authentication with sandbox permissions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with authentication enabled
- OpenAI API key (for voice features)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd keryk-ai-agent-sandbox
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Keryk AI Agent Sandbox
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
keryk-ai-agent-sandbox/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions and configurations
├── public/              # Static assets
└── .taskmaster/         # TaskMaster project management
```

## Technology Stack

- **Framework**: Next.js 15
- **UI**: React 19 with Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (read-only)
- **Voice**: OpenAI Realtime API
- **Styling**: Tailwind CSS with dark mode

## Development Workflow

This project uses TaskMaster AI for project management:

```bash
# View all tasks
task-master list

# Get next task
task-master next

# Mark task complete
task-master set-status --id=<id> --status=done
```

## Contributing

Please refer to the TaskMaster tasks in `.taskmaster/tasks/` for the current development roadmap.

## License

[License Type] - See LICENSE file for details
