# ⚡ **BugEZ Pro — AI Code Analyzer & Repair Platform**

BugEZ Pro is a modern, full-stack AI-powered code analysis and repair platform designed to help developers detect bugs, identify security vulnerabilities, analyze performance issues, generate automated fixes, and create unit tests from a single development environment.

The platform combines AI-powered code analysis with multi-file project auditing, GitHub repository inspection, visual code diffs, severity-based issue tracking, and persistent audit history.

---

## ✨ **Features**

- **🚀 Real-Time Code Analysis** — Analyze source code and receive AI-powered insights for bugs, security issues, performance problems, complexity, and code quality.

- **🐛 Automated Bug Detection** — Identifies syntax errors, logical issues, runtime risks, incorrect implementations, and potential defects.

- **🛡️ Security Vulnerability Detection** — Detects common security vulnerabilities, unsafe coding practices, insecure implementations, and potential security risks.

- **⚡ Performance Analysis** — Identifies inefficient algorithms, performance bottlenecks, unnecessary operations, and time/space complexity concerns.

- **🛠️ AI-Powered Code Repair** — Generates improved versions of problematic code and provides AI-assisted solutions for detected issues.

- **🔀 Visual Code Diff** — Displays the differences between the original and corrected code, making changes easier to review.

- **📊 Severity-Ranked Bug Matrix** — Organizes detected issues according to Critical, High, Medium, and Low severity levels.

- **🧪 Unit Test Generation** — Automatically generates unit tests covering normal cases, edge cases, failure scenarios, and potential regressions.

- **📁 Drag & Drop File Upload** — Upload supported source files directly into the platform for analysis.

- **🧠 Automatic Language Detection** — Detects programming languages using file extensions and source-code patterns.

- **🗂️ Multi-File & ZIP Analysis** — Analyze complete projects containing multiple source files, imports, dependencies, and module relationships.

- **🐙 GitHub Repository Inspector** — Inspect and analyze public GitHub repositories using the GitHub REST API.

- **📜 Persistent Audit History** — Store previous analysis results and restore them whenever required.

- **🤖 AI Model Integration** — Uses Google Gemini as the primary AI provider with support for additional AI model integrations.

---

## 🔄 **Application Workflow**

BugEZ Pro follows a structured workflow that takes developers from code submission to analysis, repair, testing, and audit history.

**1. Upload Code / GitHub Repository**  
Submit individual source files, multiple files, ZIP projects, or a public GitHub repository.

**2. Language Detection**  
The platform automatically identifies the programming language and prepares the submitted code for analysis.

**3. AI Code Analysis**  
The AI engine analyzes the submitted source code for bugs, security vulnerabilities, performance issues, complexity, and code-quality concerns.

**4. Bug Detection**  
Potential bugs and logical problems are identified and categorized.

**5. Security Analysis**  
The submitted code is reviewed for common vulnerabilities and unsafe coding practices.

**6. Performance Analysis**  
Algorithms and implementation patterns are evaluated for inefficiencies and performance bottlenecks.

**7. Severity-Based Bug Matrix**  
Detected issues are organized according to severity levels such as Critical, High, Medium, and Low.

**8. AI Fix Generation**  
The platform generates suggested fixes for detected issues.

**9. Visual Code Diff**  
The original and corrected code are compared so developers can clearly review the proposed changes.

**10. Apply Fix to Code**  
Developers can apply the generated corrections to the code editor.

**11. Generate Unit Tests**  
The platform generates unit tests to validate the corrected implementation and cover important edge cases.

**12. Save Audit History**  
Analysis results, fixes, bug findings, and generated tests can be stored for future reference.

---

## 🔍🧩 **Supported Analysis**

- **🐛 Bug Detection** — Identifies logic errors, syntax issues, runtime problems, and potential defects in source code.

- **🔐 Security Analysis** — Detects common security vulnerabilities, unsafe coding practices, and potential security risks.

- **⚡ Performance Analysis** — Identifies inefficient code, performance bottlenecks, and time/space complexity concerns.

- **🧠 Code Quality Analysis** — Reviews code structure, readability, maintainability, organization, and potential improvements.

- **📊 Complexity Analysis** — Evaluates algorithmic time and space complexity and highlights inefficient approaches.

- **🧪 Test Coverage Analysis** — Identifies edge cases, failure scenarios, and missing test scenarios for comprehensive test generation.

- **🔗 Multi-File Analysis** — Examines imports, dependencies, interfaces, and relationships between multiple source files.

- **🏗️ Architecture Analysis** — Reviews project structure, module organization, dependencies, and potential architectural issues.

- **🛠️ Automated Code Repair** — Generates AI-powered fixes for detected issues and provides visual differences between original and corrected code.

---

## 🛠️ **Tech Stack**

### **Frontend**

- **React** — Component-based user interface development.
- **TypeScript** — Type-safe application development.
- **Tailwind CSS** — Responsive and utility-first styling.
- **Vite** — Fast development and production build tooling.
- **Lucide React** — Modern and reusable interface icons.
- **JSZip** — ZIP extraction and multi-file project handling.

### **Backend**

- **Node.js** — Server-side JavaScript runtime.
- **Express.js** — Backend API and server framework.
- **TypeScript** — Backend type safety and development.
- **WebSockets** — Real-time communication and streaming support.

### **AI & APIs**

- **Google Gemini API** — AI-powered code analysis, repair, and test generation.
- **@google/genai** — Google Gemini SDK integration.
- **GitHub REST API** — Public repository and source-code inspection.
- **Groq API** — Additional LLM provider support.

### **Development & Deployment**

- **GitHub** — Source-code management and version control.
- **Render** — Production hosting and deployment.

---

## 📂 **Project Structure**

- **📁 `src/`** — Main frontend application source code.
  - **📁 `components/`** — Reusable React components.
  - **📁 `services/`** — Application services and API-related functionality.
  - **📁 `types/`** — TypeScript type definitions.

- **📁 `public/`** — Public static assets.

- **📁 `data/`** — Persistent application data.
  - **📄 `bugez_history.json`** — Stored audit history.

- **📄 `server.ts`** — Express backend server and AI API integration.

- **📄 `package.json`** — Project dependencies and scripts.

- **📄 `package-lock.json`** — Locked dependency versions.

- **📄 `vite.config.ts`** — Vite configuration.

- **📄 `tsconfig.json`** — TypeScript configuration.

- **📄 `.gitignore`** — Git ignore configuration.

- **📄 `README.md`** — Project documentation.

---

## 🛠️ **Getting Started**

### **1. Clone the Repository**

Clone the BugEZ Pro repository to your local development environment.

### **2. Navigate to the Project**

Open the project directory in your terminal or VS Code.

### **3. Install Dependencies**

Install all required project dependencies using npm.

### **4. Configure Environment Variables**

Create a `.env` file and add the required API credentials.

### **5. Start the Development Server**

Run the development server and open the application in your browser.

### **6. Create a Production Build**

Build the application for production deployment.

### **7. Start the Production Server**

Run the production server to serve the application.

---

## 🔑 **Environment Variables**

BugEZ Pro requires an API key for AI-powered code analysis.

The required environment variable is:

**`GEMINI_API_KEY`** — Google Gemini API key used by the backend for AI-powered analysis and code generation.

The API key should be stored securely as an environment variable and must never be exposed directly in frontend source code.

> ⚠️ **Never commit `.env` files, API keys, or other sensitive credentials to GitHub.**

---

## 🔐 **Security**

BugEZ Pro is designed to keep sensitive AI credentials on the backend rather than exposing them directly in the browser.

Security considerations include:

- **🔑 Environment-Based Credentials** — API keys are loaded through environment variables.

- **🛡️ Backend API Proxying** — AI provider requests are handled through the backend server.

- **🚫 Sensitive File Protection** — Environment files and generated dependencies are excluded from version control.

- **🔒 API Key Protection** — Secret credentials should never be hardcoded into source files or committed to public repositories.

---

## 🌐 **Deployment**

BugEZ Pro is deployed as a **Node.js Web Service using Render**.

The production deployment process follows this workflow:

**GitHub Repository → Render Deployment → Dependency Installation → Production Build → Express Server → Live Application**

### **🚀 Live Application**

**https://bugez-pro-3ed3.onrender.com/**

---

## 🎯 **Use Cases**

BugEZ Pro can be used for:

- **👨‍💻 Developer Code Review** — Quickly review source code and identify potential problems.

- **🎓 Learning & Education** — Help students understand programming errors and improve their coding skills.

- **🐛 Debugging** — Detect potential bugs and generate AI-assisted corrections.

- **🔐 Security Review** — Identify common security vulnerabilities and risky coding patterns.

- **⚡ Performance Optimization** — Analyze inefficient algorithms and potential performance bottlenecks.

- **🧪 Test Generation** — Automatically create test cases for existing code.

- **🔎 Repository Analysis** — Inspect and analyze public GitHub repositories.

- **🗂️ Project Analysis** — Analyze multi-file and ZIP-based software projects.

- **🛠️ Rapid Prototyping** — Quickly experiment with AI-generated fixes and code improvements.

---

## 💡 **Why BugEZ Pro?**

Traditional debugging often requires developers to switch between multiple tools and workflows:

**Code Review → Bug Detection → Security Analysis → Performance Analysis → Fixing → Testing**

BugEZ Pro combines these activities into a **single AI-assisted development environment**.

The platform provides a simple workflow:

**Analyze → Understand → Fix → Test**

This helps developers move from identifying a problem to understanding, correcting, and validating the solution within one platform.

---

## 📌 **Project Highlights**

- ⚡ **Real-Time AI-Powered Code Analysis**
- 🐛 **Automated Bug Detection**
- 🔐 **Security Vulnerability Analysis**
- ⚡ **Performance Analysis**
- 📊 **Severity-Ranked Bug Matrix**
- 🛠️ **AI-Generated Code Fixes**
- 🔀 **Visual Code Diffs**
- 🧪 **Automated Unit Test Generation**
- 📁 **Multi-File and ZIP Project Analysis**
- 🐙 **GitHub Repository Inspection**
- 🧠 **Automatic Language Detection**
- 📜 **Persistent Audit History**
- 🤖 **Gemini-Powered AI Architecture**
- 🌐 **Production Deployment on Render**

---

## 🚀 **Future Enhancements**

Potential future improvements for BugEZ Pro include:

- **🔄 Additional AI Model Providers** — Expand support for more LLM providers and specialized coding models.

- **🔐 Private Repository Support** — Enable secure analysis of private repositories with authenticated access.

- **📈 Advanced Analytics** — Provide detailed project quality metrics and historical analysis trends.

- **🧪 Automated Test Execution** — Run generated tests automatically and display test results.

- **📊 Code Quality Dashboard** — Introduce project-level quality scores and detailed analytics.

- **👥 Team Collaboration** — Enable developers to share audits, findings, and fixes with team members.

---

## 👩‍💻 **Author**

**Kavinayasri J**

**GitHub:**  
**https://github.com/kavinayasri02**

---

## ⭐ **Support**

If you find **BugEZ Pro** useful, consider giving the repository a ⭐ on GitHub. Feedback, improvements, and contributions are always welcome.

---

## 📄 **License**

This project is created for development, learning, and demonstration purposes.
