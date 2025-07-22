
# LegisAI - AI-Powered Legislative Knowledge Base

A modern, sophisticated legislative knowledge base with AI-powered analysis capabilities and a full-featured IDE interface.

## Features

### 🏛️ Legislative Analysis
- **AI-Interpreted Bills**: Get intelligent analysis of legislative documents
- **Multi-Provider AI Support**: Compatible with OpenAI GPT-4, Anthropic Claude, and Groq Llama
- **Real-time Search**: Filter and search through legislative content
- **Bill Tracking**: Monitor status and progress of legislation

### 🛠️ Development Environment
- **Integrated IDE**: Full-featured development environment
- **File Management**: Create, edit, and organize project files
- **AI Assistant**: Get coding help and legislative analysis
- **Terminal Access**: Execute commands directly in the browser
- **Live Preview**: See changes in real-time
- **Version Control**: Git integration for project management

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Modern, sophisticated interface
- **Responsive Layout**: Works on all device sizes
- **Dynamic Theming**: Red/blue political party color coding
- **Smooth Animations**: Elegant transitions and interactions

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd legis-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up AI integration** (optional)
   - Add your API keys to Secrets:
     - `OPENAI_API_KEY` for GPT-4
     - `ANTHROPIC_API_KEY` for Claude
     - `GROQ_API_KEY` for Llama

4. **Run the development server**
   ```bash
   npm start
   ```
   Or click the Run button in Replit!

5. **Access the application**
   - Open the webview to use the IDE interface
   - Navigate to `/api/preview` to see the legislative knowledge base

## Technology Stack

- **Backend**: Node.js with Express and TypeScript
- **Frontend**: Vanilla JavaScript with modern CSS
- **AI Integration**: OpenAI, Anthropic, and Groq APIs
- **Deployment**: Replit with cloud hosting
- **Styling**: CSS3 with glassmorphism effects

## API Endpoints

### Legislative Data
- `GET /api/bills` - Get all bills with optional search and filtering
- `GET /api/bills/:id` - Get specific bill details
- `GET /api/integrations/status` - Check AI provider connection status
- `POST /api/chat` - Chat with AI assistant about legislation

### Development Tools
- `GET /api/files` - Get project file structure
- `GET /api/files/*` - Get file content
- `POST /api/files/*` - Save file content
- `POST /api/terminal` - Execute terminal commands

## Project Structure

```
legis-ai/
├── public/
│   ├── index.html      # Main IDE interface
│   ├── styles.css      # Modern styling with glassmorphism
│   └── script.js       # Frontend JavaScript logic
├── index.ts            # Express server with all APIs
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support, please check the Replit Community Hub or create an issue in the repository.

---

Built with ❤️ for legislative transparency and modern development workflows.
