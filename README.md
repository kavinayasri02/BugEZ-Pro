# ⚡ BugEZ Pro — AI Code Analyzer & Repair Platform

A modern, full-stack AI-powered code analysis, vulnerability scanning, and automated code repair platform designed to help developers detect bugs, identify security vulnerabilities, analyze performance issues, generate fixes, and create unit tests from a single workspace.

Built with React, TypeScript, Tailwind CSS, Vite, Node.js, and Express, BugEZ Pro combines AI-powered analysis with an interactive developer workspace for reviewing, fixing, and testing source code.

**🚀 Live Demo:** https://bugez-pro-3ed3.onrender.com/

## ✨ **Features**

- **🚀 Real-Time Streaming Code Analysis**: Performs AI-powered code audits with real-time streaming results, analyzing logic errors, syntax issues, time and space complexity, performance bottlenecks, security risks, and potential edge cases.

- **🛠️ "Fix My Code" Mode with Visual Diffs**: Automatically generates AI-powered code fixes and provides side-by-side comparison between the original and corrected code, including unified and split diff views with a 1-click "Apply to Editor" option.

- **🛡️ Severity-Tagged Bug Matrix**: Organizes detected issues into a structured risk matrix with Critical, High, Medium, and Low severity levels, along with category filtering for Bugs, Performance, and Security issues.

- **🧪 Unit Test Generator**: Generates automated unit test suites based on the analyzed code, covering normal cases, edge cases, invalid inputs, boundary conditions, and potential failure scenarios across frameworks such as Jest, pytest, JUnit, and GoogleTest.

- **📁 Drag & Drop File Upload**: Supports uploading individual source files through a simple drag-and-drop interface with instant client-side file reading for multiple programming languages including `.py`, `.java`, `.cpp`, `.js`, `.ts`, `.go`, `.rs`, and more.

- **🧠 Intelligent Language Auto-Detection**: Automatically identifies the programming language using filename extensions and code patterns, reducing the need for manual language selection.

- **🗂️ Multi-File & ZIP Project Analysis**: Allows users to upload complete projects or ZIP packages and analyze multiple files together, enabling cross-module import analysis, interface validation, dependency inspection, and architecture-level auditing.

- **🐙 Public GitHub Repository Inspector**: Fetches and analyzes public GitHub repositories directly using GitHub REST APIs, with support for repository exploration, branch selection, file inspection, and multi-file code auditing.

- **📜 Persistent Audit History**: Stores previous analyses, generated fixes, bug matrices, and unit test results in a persistent JSON-based history store, with support for exporting and restoring audit data.

- **🤖 Multi-Model AI Architecture**: Uses Google Gemini for AI-powered code analysis and repair, with an extensible architecture that can support additional AI providers such as Groq and different LLM models.

- **🔐 Secure AI API Integration**: AI API requests are handled through the Express backend so API credentials are not exposed directly in the frontend application.

## 🏗️ **Architecture**

- **Frontend**: React, TypeScript, Tailwind CSS, Vite, Lucide Icons, JSZip, and interactive code editing components.

- **Backend**: Node.js and Express server (`server.ts`) responsible for API communication, AI request handling, code analysis workflows, GitHub repository integration, and WebSocket-based communication.

- **AI Layer**: Google Gemini SDK (`@google/genai`) powers code analysis, bug detection, code repair, explanations, and unit test generation.

- **Repository Integration**: GitHub REST API is used to retrieve and inspect source files from public repositories.

- **Persistence**: File-based JSON store in `data/bugez_history.json` maintains audit history and allows previous analysis results to be restored.

- **Communication**: WebSockets enable real-time communication and streaming responses between the frontend and backend.

## 🔄 **Application Workflow**

```text
Upload Code / GitHub Repository
              ↓
     Language Detection
              ↓
      AI Code Analysis
              ↓
 ┌────────────┬────────────┬─────────────┐
 │ Bug Scan   │ Security   │ Performance │
 └────────────┴────────────┴─────────────┘
              ↓
      Severity Bug Matrix
              ↓
       AI Fix Generation
              ↓
       Visual Code Diff
              ↓
        Apply Fix to Code
              ↓
      Generate Unit Tests
              ↓
       Save Audit History


## 🔍🧩 **Supported Analysis**

- **🐛 Bug Detection** — Identifies logic errors, syntax issues, runtime problems, and potential defects in source code.
- **🔐 Security Analysis** — Detects common security vulnerabilities, unsafe coding practices, and potential security risks.
- **⚡ Performance Analysis** — Identifies inefficient code, performance bottlenecks, and time/space complexity concerns.
- **🧠 Code Quality Analysis** — Reviews code structure, readability, maintainability, and potential improvements.
- **📊 Complexity Analysis** — Evaluates algorithmic time and space complexity and highlights inefficient approaches.
- **🧪 Test Coverage Analysis** — Identifies edge cases, failure scenarios, and missing test scenarios for generating comprehensive unit tests.
- **🔗 Multi-File Analysis** — Examines imports, dependencies, interfaces, and relationships between multiple source files.
- **🏗️ Architecture Analysis** — Reviews project structure, module organization, dependencies, and potential architectural issues.
- **🛠️ Automated Code Repair** — Generates AI-powered fixes for detected issues and provides visual differences between original and corrected code.

## 🛠️ **Tech Stack**

### **Frontend**

- **React** — Component-based UI development
- **TypeScript** — Type-safe application development
- **Tailwind CSS** — Responsive and utility-first styling
- **Vite** — Fast development and production build tooling
- **Lucide React** — Modern interface icons
- **JSZip** — ZIP file extraction and multi-file project handling

### **Backend**

- **Node.js** — Server-side JavaScript runtime
- **Express.js** — Backend API and server framework
- **TypeScript** — Backend type safety
- **WebSockets** — Real-time communication and streaming

### **AI & APIs**

- **Google Gemini API** — AI-powered code analysis, repair, and test generation
- **@google/genai** — Official Google Gemini SDK
- **GitHub REST API** — Public repository and source-code inspection
- **Groq API** — Additional LLM provider support

### **Deployment**

- **GitHub** — Source code management and version control
- **Render** — Production hosting and deployment

📂 Project Structure
BugEZ-Pro/
│
├── src/
│   ├── components/
│   ├── services/
│   ├── types/
│   └── ...
│
├── public/
│
├── data/
│   └── bugez_history.json
│
├── server.ts
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── .gitignore
└── README.md


🛠️ Getting Started

# Clone the repository
git clone https://github.com/kavinayasri02/BugEZ-Pro.git

# Navigate to the project
cd BugEZ-Pro

# Install dependencies
npm install

# Start development server
npm run dev

# Create production build
npm run build

# Start production server
npm start

🔑 Environment Variables
Create a .env file in the project root and configure the required API credentials:
GEMINI_API_KEY=your_gemini_api_key
If additional AI providers are enabled in the application, configure their corresponding environment variables as required.
⚠️ Never commit .env files or API keys to GitHub. Keep sensitive credentials in environment variables.

🔐 Security

BugEZ Pro is designed to keep AI API credentials on the backend rather than exposing them directly in the browser.

The application uses environment variables for sensitive configuration such as:

GEMINI_API_KEY

The .gitignore configuration prevents sensitive files and generated dependencies from being committed:

node_modules/
dist/
.env
🌐 Deployment

BugEZ Pro is deployed as a Node.js Web Service using Render.

The production workflow is:

GitHub Repository
       ↓
Render Deployment
       ↓
npm install
       ↓
npm run build
       ↓
Express Server
       ↓
Live Application

🚀 Live Application: https://bugez-pro-3ed3.onrender.com/

🎯 Use Cases

BugEZ Pro can be used for:

👨‍💻 Developer Code Review: Quickly review source code and identify potential problems.
🎓 Learning & Education: Help students understand programming errors and improve their code.
🐛 Debugging: Detect potential bugs and generate AI-assisted corrections.
🔐 Security Review: Identify common security vulnerabilities and risky coding patterns.
⚡ Performance Optimization: Analyze inefficient algorithms and potential performance bottlenecks.
🧪 Test Generation: Automatically create test cases for existing code.
🔎 Repository Analysis: Inspect and analyze public GitHub repositories.
🛠️ Rapid Prototyping: Quickly experiment with AI-generated fixes and improvements.
💡 Why BugEZ Pro?

Traditional debugging often requires developers to switch between multiple tools for code review, bug detection, security analysis, fixing, and test generation.

BugEZ Pro combines these workflows into a single AI-assisted development environment.

Analyze → Understand → Fix → Test

The goal is to provide developers with a faster and more interactive way to understand problems in their code and move from error detection to working solutions.

📌 Project Highlights
⚡ Real-time AI-powered code analysis
🐛 Automated bug detection
🔐 Security vulnerability analysis
📊 Severity-ranked bug matrix
🛠️ AI-generated code fixes
🔀 Visual code diffs
🧪 Automated unit test generation
📁 Multi-file and ZIP project analysis
🐙 GitHub repository inspection
🧠 Automatic language detection
📜 Persistent audit history
🤖 Gemini-powered AI architecture
🌐 Production deployment on Render

👩‍💻 Author
Kavinayasri J
GitHub: https://github.com/kavinayasri02

⭐ Support
If you find BugEZ Pro useful, consider giving the repository a ⭐ on GitHub.
Feedback, improvements, and contributions are always welcome.
