⚡ BugEZ Pro — AI-Powered Code Review, Bug Detection & Automated Repair Platform

BugEZ Pro is a full-stack AI-powered code analysis platform designed to help developers detect bugs, identify security vulnerabilities, analyze performance issues, generate fixes, and create unit tests from a single workspace.

It supports individual files, multi-file projects, ZIP uploads, and public GitHub repositories, providing AI-driven insights with severity-based issue tracking and automated code repair.

🚀 Live Demo

Open BugEZ Pro

Replace YOUR_DEPLOYED_LINK with the deployed URL shown above.

✨ Key Features
🔍 AI-Powered Code Analysis

Analyze source code using AI to identify:

Logic and syntax errors
Potential bugs
Security vulnerabilities
Performance bottlenecks
Time and space complexity issues
Edge cases and failure scenarios
Code quality improvements
🛠️ Automated Code Repair

Use Fix My Code to automatically generate improved code.

Includes:

AI-generated fixes
Original vs. fixed code comparison
Side-by-side visual diff
Unified diff view
One-click Apply to Editor
Explanation of the proposed changes
🛡️ Severity-Based Bug Matrix

Automatically organize detected issues into a structured risk matrix.

Severity levels:

🔴 Critical
🟠 High
🟡 Medium
🟢 Low

Issues can also be filtered by:

Bug
Security
Performance
Search
Source-code line
🧪 AI Unit Test Generator

Generate unit tests automatically based on the analyzed code.

Supports popular testing approaches including:

Jest
Pytest
JUnit
GoogleTest
Other language-specific testing frameworks

Generated tests focus on:

Normal cases
Edge cases
Invalid inputs
Failure scenarios
Boundary conditions
📁 Multi-Language File Analysis

Upload source files directly using drag-and-drop.

Supported file types include:

.py
.java
.cpp
.c
.js
.ts
.jsx
.tsx
.go
.rs

The application automatically detects the programming language using the filename extension and code structure.

🗂️ Multi-File & ZIP Project Analysis

Upload complete projects instead of analyzing files individually.

BugEZ Pro can inspect:

Multiple source files
ZIP project archives
Cross-file dependencies
Import relationships
Interfaces
Module structure
Architecture-level issues
🐙 GitHub Repository Inspector

Analyze public GitHub repositories directly from BugEZ Pro.

Features include:

Repository URL analysis
Branch selection
File exploration
Source-code retrieval
Multi-file repository auditing
AI-powered repository analysis
📜 Persistent Audit History

Keep track of previous analyses through persistent audit history.

Stored information can include:

Code analyses
Bug reports
Fixes
Bug matrices
Generated unit tests

Users can also export and restore analysis data.

🤖 Multi-Model AI Architecture

BugEZ Pro is designed with a flexible AI architecture supporting multiple AI providers and models.

Primary AI:

Google Gemini

Optional AI providers:

Groq
LLaMA
Qwen

The backend securely handles AI API communication instead of exposing API credentials in the frontend.

🏗️ System Architecture
                 ┌─────────────────────────┐
                 │       User / Browser     │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │   React + TypeScript UI  │
                 │      Tailwind CSS        │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │     Express Backend      │
                 │        server.ts         │
                 └────────────┬────────────┘
                              │
                  ┌───────────┴───────────┐
                  ▼                       ▼
        ┌──────────────────┐    ┌──────────────────┐
        │   Gemini API      │    │    Groq API      │
        │   AI Analysis     │    │ Optional Models  │
        └──────────────────┘    └──────────────────┘
                  │
                  ▼
        ┌─────────────────────────┐
        │   Audit History Store   │
        │   JSON Persistence      │
        └─────────────────────────┘
🧩 Application Workflow
Upload / Select Code
        ↓
Language Detection
        ↓
AI Code Analysis
        ↓
┌───────────────┬───────────────┬───────────────┐
│ Bug Detection │ Security Scan │ Performance   │
└───────────────┴───────────────┴───────────────┘
        ↓
Severity-Based Bug Matrix
        ↓
AI Fix Generation
        ↓
Visual Code Diff
        ↓
Apply Fix
        ↓
Generate Unit Tests
        ↓
Save Audit History
🛠️ Tech Stack
Frontend
React
TypeScript
Tailwind CSS
Vite
Lucide React
JSZip
Backend
Node.js
Express.js
TypeScript
WebSockets
AI & APIs
Google Gemini API
Groq API
GitHub REST API
Deployment
Render
GitHub
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

Project structure may vary depending on the current implementation.

🚀 Getting Started
1. Clone the Repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd BugEZ-Pro
2. Install Dependencies
npm install
3. Configure Environment Variables

Create a .env file:

GEMINI_API_KEY=your_gemini_api_key

If Groq support is enabled in your current configuration, add its corresponding API key as well.

⚠️ Never commit .env or API keys to GitHub.

4. Run Development Server
npm run dev
5. Create Production Build
npm run build
6. Start Production Server
npm start
🔐 Security

BugEZ Pro keeps AI credentials on the backend instead of exposing them directly in the frontend.

Environment variables are used for API credentials:

GEMINI_API_KEY

Sensitive configuration files such as .env are excluded through .gitignore.

🌐 Deployment

BugEZ Pro is deployed as a Node.js Web Service on Render.

The production deployment consists of:

GitHub Repository
       ↓
Render Build
       ↓
npm install
       ↓
npm run build
       ↓
Express Server
       ↓
Live BugEZ Pro Application
🚀 Live Application

Launch BugEZ Pro

🎯 Use Cases

BugEZ Pro can be useful for:

👨‍💻 Developers reviewing code
🎓 Students learning programming
🐛 Debugging programming assignments
🔐 Identifying common security issues
⚡ Finding performance bottlenecks
🧪 Generating test cases
📚 Understanding unfamiliar code
🔎 Reviewing GitHub repositories
🛠️ Rapidly prototyping code fixes
💡 Why BugEZ Pro?

Traditional debugging often requires switching between multiple tools for:

Code Review → Bug Detection → Security Analysis → Fixing → Testing

BugEZ Pro brings these workflows into a single AI-assisted development environment.

Analyze → Understand → Fix → Test

📌 Project Highlights
⚡ Real-time AI-powered code analysis
🐛 Automated bug detection
🔐 Security vulnerability analysis
📊 Severity-ranked bug matrix
🛠️ AI-generated code fixes
🔀 Visual code diffs
🧪 Automated unit test generation
📁 Multi-file and ZIP analysis
🐙 GitHub repository inspection
📜 Persistent audit history
🤖 Multi-model AI architecture
🌐 Production deployment on Render
👩‍💻 Author

Kavinayasri J

GitHub: @kavinayasri02
