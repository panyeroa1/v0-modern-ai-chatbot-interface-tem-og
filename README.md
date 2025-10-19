# Eburon AI - Advanced AI Chatbot with Coding Agent

*Powered by Ollama Cloud and Emilio AI*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/emilsites-projects/v0-modern-ai-chatbot-interface-tem)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/rTWjpQ6FJHP)

## Overview

Eburon AI is an advanced chatbot interface featuring multiple AI models powered by Ollama Cloud, with a specialized coding agent that operates in continuous execution loops. Built with Next.js 15, React 19, and integrated with Neon PostgreSQL for conversation persistence.

## Features

### 🤖 Multiple AI Models
- **Emilio-120b** (gpt-oss:120b-cloud) - Large general-purpose model
- **Emilio-flash-20b** (gpt-oss:20b-cloud) - Fast lightweight model
- **Aquilles-V3.1** (deepseek-v3.1:671b-cloud) - Advanced reasoning model
- **Alex-Coder** (qwen3-coder:480b-cloud) - Specialized coding agent

### 🛠️ Eburon Coding Agent (Alex-Coder)
The Alex-Coder model features a specialized agentic system inspired by Manus.im:

**Continuous Execution Loop:**
- Iterative problem-solving until completion
- Real-time tool execution with visual feedback
- Automatic error detection and debugging
- Progress tracking and status indicators

**Available Tools:**
1. **Web Search** - Real-time web search via Ollama Cloud API
2. **Error Analysis** - Intelligent error diagnosis and fix suggestions
3. **Code Execution** - Sandboxed code testing and validation
4. **Documentation Reader** - Fetch and parse official documentation
5. **Code Validator** - Syntax, type, and best practice validation

**Capabilities:**
- Full-stack web development (React, Next.js, TypeScript, Python)
- Database design and optimization
- API development and integration
- Modern UI/UX implementation
- Real-time debugging and testing
- DevOps and deployment automation

### 💾 Database Integration
- **Neon PostgreSQL** for conversation and message persistence
- Automatic conversation history loading
- Real-time message synchronization
- User session management

### 🎨 Modern UI/UX
- Dark/Light theme support
- Responsive design for all devices
- Real-time streaming responses
- Tool execution indicators
- Conversation management (pin, search, organize)
- Template system for quick prompts

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Neon PostgreSQL
- **AI Models**: Ollama Cloud (GPT-OSS, DeepSeek, Qwen3-Coder)
- **Deployment**: Vercel

## Environment Variables

Required environment variables (set in Vercel or `.env.local`):

\`\`\`bash
# Database Configuration
DATABASE_URL=your_neon_database_url
POSTGRES_URL=your_postgres_url

# Upstash Redis Configuration (for caching and session management)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Upstash Vector Configuration (for conversation search indexing)
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token

# Upstash Search Configuration (custom search implementation)
UPSTASH_SEARCH_REST_URL=your_upstash_search_url
UPSTASH_SEARCH_REST_TOKEN=your_upstash_search_token

# Ollama Cloud API
OLLAMA_API_KEY=your_ollama_api_key

# Authentication (if using NextAuth.js)
NEXTAUTH_SECRET=your_super_secret_jwt_token_here
NEXTAUTH_URL=http://localhost:3000
\`\`\`

Copy `.env.example` to `.env.local` and fill in your actual values.

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`
3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   # Fill in your actual environment variable values
   \`\`\`
4. Build the application:
   \`\`\`bash
   pnpm run build --no-lint
   \`\`\`
5. Start the production server:
   \`\`\`bash
   pnpm start
   \`\`\`
6. Open [http://localhost:3000](http://localhost:3000)

### Development Mode
For development with hot-reloading:
\`\`\`bash
pnpm run dev
\`\`\`

### Restarting the Application
To restart the application (works with PM2, Docker, and direct Next.js):
\`\`\`bash
npm run restart
\`\`\`

See [RESTART_GUIDE.md](./RESTART_GUIDE.md) for detailed restart instructions.

## Database Setup

Run the SQL migration scripts in order:

\`\`\`bash
# Create tables
psql $DATABASE_URL -f scripts/001_create_conversations_and_messages.sql

# Fix user_id type (if needed)
psql $DATABASE_URL -f scripts/002_fix_user_id_type.sql
\`\`\`

## Usage

### General Chat
1. Select any model from the dropdown (Emilio-120b, Emilio-flash-20b, Aquilles-V3.1)
2. Start a new conversation
3. Chat naturally with the AI

### Coding Agent (Alex-Coder)
1. Select "Alex-Coder" from the model dropdown
2. Ask for coding tasks, debugging, or development help
3. Watch as the agent:
   - Searches the web for documentation
   - Analyzes errors and suggests fixes
   - Executes code to verify solutions
   - Iterates until the task is complete

**Example Prompts:**
- "Build a REST API with authentication using Next.js"
- "Debug this TypeScript error: [paste error]"
- "Create a responsive dashboard with charts"
- "Optimize this SQL query for better performance"

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── chat/          # Main chat API with streaming
│   │   ├── conversations/ # Conversation CRUD
│   │   ├── messages/      # Message retrieval
│   │   └── tools/         # Tool execution endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AIAssistantUI.jsx  # Main UI component
│   ├── ChatPane.jsx       # Chat interface
│   ├── Composer.jsx       # Message input
│   ├── Header.jsx         # Top navigation
│   ├── Sidebar.jsx        # Conversation sidebar
│   └── ...
├── lib/
│   ├── system-prompt.ts         # General AI prompt
│   ├── coding-agent-prompt.ts   # Coding agent prompt
│   └── tools.ts                 # Tool definitions and handlers
└── scripts/
    └── *.sql              # Database migrations
\`\`\`

## Deployment

Your project is live at:

**[https://vercel.com/emilsites-projects/v0-modern-ai-chatbot-interface-tem](https://vercel.com/emilsites-projects/v0-modern-ai-chatbot-interface-tem)**

Continue building on:

**[https://v0.app/chat/projects/rTWjpQ6FJHP](https://v0.app/chat/projects/rTWjpQ6FJHP)**

## How It Works

1. User sends a message through the Composer
2. Message is saved to Neon database
3. Request is sent to Ollama Cloud API with appropriate model
4. For Alex-Coder: Tools are enabled and executed as needed
5. Response streams back in real-time
6. Assistant message is saved to database
7. UI updates with streaming content and tool execution status

## Contributing

This project is automatically synced with v0.app. Make changes through the v0 interface for automatic deployment.

## License

MIT

---

**Built with ❤️ by Emilio AI**
