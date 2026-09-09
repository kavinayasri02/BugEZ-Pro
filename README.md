# ⚡ BugEZ Pro — AI Code Analyzer & Repair Platform

A modern, full-stack AI-powered code analysis, vulnerability scanner, and automated repair platform built with React, TypeScript, Tailwind CSS, Vite, and Node.js.

## ✨ Features

- **🚀 Real-Time Streaming Code Analysis**: Token-by-token streaming code audits analyzing logic, time/space complexity, syntax pitfalls, and security risks.
- **🛠️ "Fix My Code" Mode with Visual Diffs**: Side-by-side split view and unified color-coded diff showing changes with a 1-click "Apply to Editor" button.
- **🛡️ Severity-Tagged Bug Matrix**: Structured issue table with Critical, High, Medium, and Low severity badges, category filtering (Bug, Performance, Security), search, and line jumps.
- **🧪 Unit Test Generator**: Automated unit test suite generator (supporting pytest, Jest, JUnit, GoogleTest, etc.) with coverage for edge cases and failure modes.
- **📁 Drag & Drop File Upload**: Upload `.py`, `.java`, `.cpp`, `.js`, `.ts`, `.go`, `.rs` and more, with instant client-side file reading.
- **🧠 Intelligent Language Auto-Detection**: Instant heuristic detection from filename extensions and code tokens.
- **🗂️ Multi-File & ZIP Project Analysis**: Upload zip packages or multiple files to conduct cross-module import analysis, interface validation, and architecture audits.
- **🐙 Public GitHub Repository Inspector**: Fetch and audit public GitHub repositories directly via GitHub REST APIs with branch selection and code exploration.
- **📜 Persistent Audit History**: Every analysis, fix, bug matrix, and test suite is saved to a persistent database with JSON export and instant restoration into the editor.
- **🤖 Multi-Model AI Selector**: Powered by Gemini 3.8 Flash & Gemini 3.1 Pro with optional Groq support (LLaMA 3.3 70B, LLaMA 3.1 8B, Qwen 3.6).

## 🏗️ Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, JSZip, diff.
- **Backend**: Express server (`server.ts`) proxying Gemini SDK (`@google/genai`) and Groq API calls securely.
- **Persistence**: File-based database store in `data/bugez_history.json`.

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
npm start
```
