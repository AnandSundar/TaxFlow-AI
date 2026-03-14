# <img src="https://raw.githubusercontent.com/nicologhielmetti/taxflow-ai/main/public/logo.svg" width="40" alt="TaxFlow AI Logo"/> TaxFlow AI

<p align="center">
  <a href="https://github.com/nicologhielmetti/taxflow-ai">
    <img src="https://img.shields.io/github/stars/nicologhielmetti/taxflow-ai?style=flat&color=FF6B6B" alt="GitHub Stars">
  </a>
  <a href="https://github.com/nicologhielmetti/taxflow-ai/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/nicologhielmetti/taxflow-ai?color=4ECDC4" alt="License">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript" alt="TypeScript">
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React">
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-20-green?logo=node.js" alt="Node.js">
  </a>
  <a href="https://openai.com/">
    <img src="https://img.shields.io/badge/OpenAI-GPT--4o-black?logo=openai" alt="OpenAI">
  </a>
</p>

<p align="center">
  <h1>
    <span style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
      TaxFlow AI
    </span>
  </h1>
  <em>Agentic AI workflows for modern tax professionals</em>
</p>

---

<p align="center">
  <a href="#-quick-start"><strong>Get Started</strong></a> ·
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="#-architecture"><strong>Architecture</strong></a> ·
  <a href="#-demo-workflow"><strong>Demo</strong></a> ·
  <a href="#-tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#-contributing"><strong>Contribute</strong></a>
</p>

---

<div align="center">

<!-- Demo GIF Placeholder - Replace with actual GIF -->
[![TaxFlow AI Demo](https://via.placeholder.com/800x450/1a1a2e/FF6B6B?text=TaxFlow+AI+Demo+GIF)](https://github.com/nicologhielmetti/taxflow-ai)

*TaxFlow AI in action: Automated document analysis, intelligent extraction, and compliance checking*

</div>

---

## 📋 Table of Contents

1. [About](#-about)
2. [Features](#-features)
3. [Architecture](#-architecture)
4. [System Overview](#-system-overview)
5. [Demo Workflow](#-demo-workflow)
6. [Quick Start](#-quick-start)
7. [Tech Stack](#-tech-stack)
8. [Screenshots](#-screenshots)
9. [Contributing](#-contributing)
10. [License](#-license)

---

## 🔥 About

TaxFlow AI is a **multi-agent AI platform** that automatically analyzes tax documents and assists tax professionals with complex workflows. Built with a sophisticated agent graph orchestration system, it leverages the power of Large Language Models to transform how tax professionals handle document processing, compliance checking, and client advisory services.

### Key Capabilities

- 🤖 **Intelligent Automation**: AI-powered document analysis and data extraction
- 🔍 **Compliance Checking**: Automated tax regulation compliance verification
- 💡 **Deduction Discovery**: AI identifies potential tax deductions and credits
- 📊 **Financial Summarization**: Instant financial summaries from complex documents
- 🔄 **Workflow Orchestration**: Multi-agent system for complex tax workflows
- 📚 **Knowledge Retrieval**: RAG-powered tax knowledge base access

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| <img src="https://img.icons8.com/color/24/000000/source-code.png" width="20"/> **Agent Graph Orchestration** | LangGraph-style directed acyclic graph (DAG) for orchestrating complex multi-agent workflows with conditional branching and parallel execution |
| <img src="https://img.icons8.com/color/24/000000/search.png" width="20"/> **RAG Knowledge System** | Retrieval-Augmented Generation powered by vector embeddings for accessing tax regulations, IRS guidelines, and client history |
| <img src="https://img.icons8.com/color/24/000000/document.png" width="20"/> **Document Intelligence Pipeline** | Multi-format document parsing (PDF, images, spreadsheets) with OCR-ready extraction pipelines |
| <img src="https://img.icons8.com/color/24/000000/analytics.png" width="20"/> **Observability & Tracing** | Full execution tracing with LangSmith-compatible tracing for debugging and optimization |
| <img src="https://img.icons8.com/color/24/000000/dashboard.png" width="20"/> **Modern Dashboard UI** | React-based responsive dashboard with real-time workflow status, agent execution views, and interactive timeline |

### Core Agent Types

| Agent | Function |
|-------|----------|
| 📄 **Document Intelligence Agent** | Parses and extracts data from tax documents (W-2s, 1099s, K-1s, etc.) |
| 💰 **Financial Extraction Agent** | Categorizes income, expenses, assets, and liabilities |
| 📚 **Tax Knowledge Agent** | Retrieves relevant tax regulations and precedents via RAG |
| 💡 **Deduction Discovery Agent** | Identifies potential deductions, credits, and tax-saving opportunities |
| ✅ **Compliance Check Agent** | Verifies adherence to federal and state tax regulations |
| 📝 **Summary Generator Agent** | Generates comprehensive client tax summaries and reports |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    TAXFLOW AI ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────────┐
                                    │   React Frontend │◄──────────────┐
                                    │   (Dashboard UI) │               │
                                    └────────┬─────────┘               │
                                             │                         │
                                             │ HTTP/WebSocket          │
                                             ▼                         │
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                      API GATEWAY / LOAD BALANCER                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                         ┌───────────────────┼───────────────────┐
                         │                   │                   │
                         ▼                   ▼                   ▼
              ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
              │   React App      │  │   Node.js API    │  │   Python/FastAPI │
              │   (Static)       │  │   (Express)      │  │   (Agent Engine) │
              └──────────────────┘  └────────┬─────────┘  └────────┬─────────┘
                                             │                    │
                                             │                    │
                                             ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA LAYER                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   SQLite    │  │ PostgreSQL  │  │  pgvector   │  │    Redis    │                 │
│  │  (Dev/DB)   │  │  (Prod/DB) │  │ (Embeddings)│  │   (Cache)   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    AI SERVICES LAYER                                 │
│                                                                                      │
│    ┌─────────────────────────────────────────────────────────────────────────┐      │
│    │                         AGENT GRAPH ORCHESTRATOR                         │      │
│    │  ┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐             │      │
│    │  │Document │    │Financial │    │   Tax   │    │ Deduction│             │      │
│    │  │Intellig.│───►│Extraction│───►│Knowledge│───►│Discovery │             │      │
│    │  └─────────┘    └──────────┘    └─────────┘    └──────────┘             │      │
│    │       │               │               │               │                 │      │
│    │       │               │               │               │                 │      │
│    │       ▼               ▼               ▼               ▼                 │      │
│    │  ┌─────────────────────────────────────────────────────────────┐        │      │
│    │  │                    COMPLIANCE CHECK AGENT                    │        │      │
│    │  └─────────────────────────────────────────────────────────────┘        │      │
│    │                              │                                        │      │
│    │                              ▼                                        │      │
│    │  ┌─────────────────────────────────────────────────────────────┐        │      │
│    │  │                  SUMMARY GENERATOR AGENT                    │        │      │
│    │  └─────────────────────────────────────────────────────────────┘        │      │
│    └─────────────────────────────────────────────────────────────────────────┘      │
│                                             │                                        │
│                                             ▼                                        │
│    ┌─────────────────────────────────────────────────────────────────────────┐      │
│    │                         RAG KNOWLEDGE SYSTEM                            │      │
│    │  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────────┐    │      │
│    │  │  Ingestion  │──►│  Embeddings  │──►│  Vector Search (pgvector)│    │      │
│    │  │  Pipeline   │    │  (OpenAI)    │    │                         │    │      │
│    │  └─────────────┘    └──────────────┘    └─────────────────────────┘    │      │
│    └─────────────────────────────────────────────────────────────────────────┘      │
│                                             │                                        │
│                                             ▼                                        │
│    ┌─────────────────────────────────────────────────────────────────────────┐      │
│    │                      OBSERVABILITY & TRACING                            │      │
│    │         ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │      │
│    │         │Execution Trace│    │  LangSmith   │    │  Metrics    │       │      │
│    │         │   (JSON)      │───►│  Compatible  │───►│  (Prometheus)│       │      │
│    │         └──────────────┘    └──────────────┘    └──────────────┘       │      │
│    └─────────────────────────────────────────────────────────────────────────┘      │
│                                             │                                        │
│                                             ▼                                        │
│    ┌─────────────────────────────────────────────────────────────────────────┐      │
│    │                         EXTERNAL SERVICES                                │      │
│    │    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │      │
│    │    │  OpenAI     │    │   IRS       │    │   Tax       │               │      │
│    │    │  GPT-4o API │    │   APIs      │    │   Databases │               │      │
│    │    └─────────────┘    └─────────────┘    └─────────────┘               │      │
│    └─────────────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Agent Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AGENT EXECUTION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌─────────────────┐
│  User Upload   │  Tax professional uploads client documents
│  Documents     │  (W-2, 1099, receipts, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Workflow      │  System creates a new workflow instance
│  Initialization│  with unique ID and execution context
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Document      │────►│  Parallel       │  All documents processed
│  Intelligence  │     │  Processing     │  simultaneously
│  Agent         │     └────────┬────────┘
└────────┬────────┘              │
         │                      │
         │   Extracted Data    │
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│  Financial     │────►│  Parallel       │
│  Extraction    │     │  Execution      │
│  Agent         │     └────────┬────────┘
└────────┬────────┘              │
         │                      │
         │   Financial Data    │
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│  Tax Knowledge  │     │  Deduction      │
│  Agent (RAG)    │     │  Discovery      │
│                 │     │  Agent          │
└────────┬────────┘     └────────┬────────┘
         │                      │
         │   Tax Regulations   │   Potential Deductions
         │   + Context        │   + Credits
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   Compliance Check  │  Cross-references with
         │   Agent            │  tax regulations
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Summary Generator  │  Generates final report
         │  Agent             │  + recommendations
         └──────────┬──────────┘
                    │
                    ▼
┌─────────────────────────────┐
│     COMPLETE / ERROR        │
│                             │
│  Returns:                   │
│  - Summary Report           │
│  - Identified Deductions    │
│  - Compliance Status        │
│  - Risk Assessment          │
│  - Preparer Notes           │
└─────────────────────────────┘
```

---

## 🔄 System Overview

### Multi-Agent Architecture

TaxFlow AI implements a sophisticated **multi-agent system** where specialized AI agents collaborate to handle different aspects of tax document processing:

1. **Document Intelligence Agent** (`document-intelligence.ts`)
   - Parses uploaded tax documents (PDFs, images, spreadsheets)
   - Extracts key information using AI vision models
   - Normalizes data into structured format

2. **Financial Extraction Agent** (`financial-extraction.ts`)
   - Categorizes income sources (W-2, 1099, K-1, etc.)
   - Identifies expenses and deductions
   - Builds comprehensive financial profile

3. **Tax Knowledge Agent** (`tax-knowledge.ts`)
   - Retrieves relevant tax regulations via RAG
   - Queries vector database for precedents
   - Provides context-aware tax guidance

4. **Deduction Discovery Agent** (`deduction-discovery.ts`)
   - Analyzes financial data for deduction opportunities
   - Matches against known deduction categories
   - Calculates potential tax savings

5. **Compliance Check Agent** (`compliance-check.ts`)
   - Verifies form completeness and accuracy
   - Cross-references with IRS guidelines
   - Flags potential audit triggers

6. **Summary Generator Agent** (`summary-generator.ts`)
   - Compiles all agent outputs into unified report
   - Generates preparer notes
   - Creates actionable recommendations

### Agent Memory System

Each agent has access to a persistent memory system that stores:
- **Conversation History**: Previous interactions with the agent
- **Execution Context**: Current workflow state and data
- **Client History**: Historical data for returning clients
- **Knowledge Cache**: Retrieved tax regulations and precedents

---

## 🚀 Demo Workflow

### "Client Tax Review" Workflow

This is the primary workflow that demonstrates TaxFlow AI's capabilities:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT TAX REVIEW WORKFLOW                                    │
│                                                                                      │
│  Step 1: UPLOAD ────────────────────────────────────────────────────────────────►    │
│  ┌──────────────────────────────────────────────────────────────────────────┐       │
│  │  📁 Upload Client Documents                                              │       │
│  │  • W-2 Forms, 1099s, K-1s                                               │       │
│  │  • Bank Statements, Investment Reports                                  │       │
│  │  • Receipts, Invoices, Expense Records                                  │       │
│  │  • Prior Year Tax Returns                                               │       │
│  └──────────────────────────────────────────────────────────────────────────┘       │
│                                        │                                             │
│                                        ▼                                             │
│  Step 2: EXTRACT ─────────────────────────────────────────────────────────────►    │
│  ┌──────────────────────────────────────────────────────────────────────────┐       │
│  │  🔍 Document Intelligence Agent                                          │       │
│  │  • Parse all document formats                                            │       │
│  │  • Extract key financial data                                            │       │
│  │  • Normalize into structured format                                      │       │
│  └──────────────────────────────────────────────────────────────────────────┘       │
│                                        │                                             │
│                                        ▼                                             │
│  Step 3: ANALYZE ────────────────────────────────────────────────────────────►    │
│  ┌──────────────────────────────────────────────────────────────────────────┐       │
│  │  💰 Financial Extraction Agent                                           │       │
│  │  • Categorize income sources                                            │       │
│  │  • Identify deductions and expenses                                      │       │
│  │  • Build financial profile                                               │       │
│  └──────────────────────────────────────────────────────────────────────────┘       │
│                                        │                                             │
│                                        ▼                                             │
│  Step 4: IDENTIFY ───────────────────────────────────────────────────────────►    │
│  ┌──────────────────────────────────────────────────────────────────────────┐       │
│  │  🔎 Tax Knowledge Agent + Deduction Discovery Agent                      │       │
│  │  • Retrieve relevant tax regulations (RAG)                               │       │
│  │  • Identify potential deductions                                         │       │
│  │  • Research tax-saving opportunities                                     │       │
│  └──────────────────────────────────────────────────────────────────────────┘       │
│                                        │                                             │
│                                        ▼                                             │
│  Step 5: CHECK ─────────────────────────────────────────────────────────────────►    │
│  ┌──────────────────────────────────────────────────────────────────────────┐       │
│  │  ✅ Compliance Check Agent                                               │       │
│  │  • Verify form completeness                                              │       │
│  │  • Check regulatory compliance                                           │       │
│  │  • Flag potential issues                                                 │       │
│  └──────────────────────────────────────────────────────────────────────────┘       │
│                                        │                                             │
│                                        ▼                                             │
│  Step 6: GENERATE ────────────────────────────────────────────────────────────    │
│  ┌──────────────────────────────────────────────────────────────────────────┐       │
│  │  📝 Summary Generator Agent                                              │       │
│  │  • Generate comprehensive summary                                        │       │
│  │  • Create preparer notes                                                 │       │
│  │  • Provide recommendations                                               │       │
│  └──────────────────────────────────────────────────────────────────────────┘       │
│                                        │                                             │
│                                        ▼                                             │
│                              ┌───────────────────┐                                 │
│                              │   ✓ WORKFLOW      │                                 │
│                              │   COMPLETE        │                                 │
│                              └───────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Example Output

After running the Client Tax Review workflow, you'll receive:

```json
{
  "workflow_id": "wf_20240315_143022",
  "status": "completed",
  "summary": {
    "total_income": 125000,
    "total_deductions": 28500,
    "taxable_income": 96500,
    "estimated_tax": 22150,
    "effective_rate": "17.7%"
  },
  "deductions": [
    {"category": "Standard Deduction", "amount": 13850, "verified": true},
    {"category": "Mortgage Interest", "amount": 8500, "verified": true},
    {"category": "State/Local Taxes", "amount": 5000, "verified": true},
    {"category": "Charitable Contributions", "amount": 1150, "verified": false}
  ],
  "risks": [
    {"severity": "low", "type": "missing_document", "description": "Form 8880 missing for retirement savings credit"}
  ],
  "notes": [
    "Client may qualify for Saver's Credit - recommend Form 8880",
    "Review charitable contribution receipts over $250"
  ],
  "compliance_status": "ready_for_review",
  "execution_time": "4.2 seconds"
}
```

---

## 🏁 Quick Start

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | ≥ 20.x | LTS recommended |
| **npm** | ≥ 10.x | Comes with Node.js |
| **Python** | ≥ 3.11 | For FastAPI backend |
| **OpenAI API Key** | - | Get from [platform.openai.com](https://platform.openai.com) |
| **PostgreSQL** (optional) | ≥ 15.x | For production |
| **Docker** (optional) | ≥ 24.x | For containerized deployment |

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/nicologhielmetti/taxflow-ai.git
cd taxflow-ai
```

#### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for FastAPI agent engine)
cd taxflow-ai/agents
pip install -r requirements.txt
```

#### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp taxflow-ai/infra/docker/.env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# Database Configuration (SQLite for development)
DATABASE_URL=sqlite:///./taxflow.db

# Application Settings
NODE_ENV=development
PORT=3000
API_PORT=3001
```

#### 4. Initialize the Database

```bash
# The database will be automatically created on first run
# For manual initialization:
npm run db:init
```

#### 5. Start the Application

**Development Mode:**

```bash
# Start both frontend and backend
npm run dev
```

**Frontend Only:**

```bash
npm run dev:frontend
```

**Backend Only:**

```bash
npm run dev:backend
```

#### 6. Access TaxFlow AI

Open your browser and navigate to:

```
http://localhost:3000
```

### Docker Deployment

```bash
# Navigate to Docker directory
cd taxflow-ai/infra/docker

# Build and run with Docker Compose
docker-compose up -d

# Or use the Makefile
make up
```

---

## 💻 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| <img src="https://img.icons8.com/color/24/000000/react-native.png" width="16"/> **React** | 18.x | UI Framework |
| <img src="https://img.icons8.com/color/24/000000/typescript.png" width="16"/> **TypeScript** | 5.x | Type Safety |
| <img src="https://img.icons8.com/color/24/000000/tailwind-css.png" width="16"/> **Tailwind CSS** | 3.x | Styling |
| <img src="https://img.icons8.com/color/24/000000/visual-studio-code-2019.png" width="16"/> **Vite** | 5.x | Build Tool |
| <img src="https://img.icons8.com/color/24/000000/recharts.png" width="16"/> **Recharts** | 2.x | Charts/Visualization |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| <img src="https://img.icons8.com/color/24/000000/nodejs.png" width="16"/> **Node.js** | 20.x | Runtime |
| <img src="https://img.icons8.com/color/24/000000/express.png" width="16"/> **Express** | 4.x | Web Framework |
| <img src="https://img.icons8.com/color/24/000000/python.png" width="16"/> **Python** | 3.11+ | AI/ML Services |
| <img src="https://img.icons8.com/color/24/000000/fastapi.png" width="16"/> **FastAPI** | 0.109+ | Agent API |
| <img src="https://img.icons8.com/color/24/000000/sql.png" width="16"/> **SQLite** | - | Development DB |
| <img src="https://img.icons8.com/color/24/000000/postgresql.png" width="16"/> **PostgreSQL** | 15.x | Production DB |
| <img src="https://img.icons8.com/color/24/000000/docker.png" width="16"/> **Docker** | 24.x | Containerization |
| <img src="https://img.icons8.com/color/24/000000/nginx.png" width="16"/> **Nginx** | 1.24 | Reverse Proxy |

### AI/ML

| Technology | Purpose |
|------------|---------|
| <img src="https://img.icons8.com/color/24/000000/artificial-intelligence.png" width="16"/> **OpenAI GPT-4o** | Primary LLM |
| <img src="https://img.icons8.com/color/24/000000/connection.png" width="16"/> **LangGraph** | Agent Orchestration |
| <img src="https://img.icons8.com/color/24/000000/database.png" width="16"/> **pgvector** | Vector Search |
| <img src="https://img.icons8.com/color/24/000000/artificial-intelligence.png" width="16"/> **LangSmith** | Observability |

---

## 📸 Screenshots

### Dashboard View

![Dashboard](https://via.placeholder.com/800x450/1a1a2e/4ECDC4?text=Dashboard+View)

*The main dashboard showing client list, recent activity, and key metrics*

---

### AI Chat Interface

![AI Chat](https://via.placeholder.com/800x450/1a1a2e/FF6B6B?text=AI+Chat+Interface)

*Conversational AI assistant with context awareness of client documents*

---

### Workflow Timeline

![Workflow Timeline](https://via.placeholder.com/800x450/1a1a2e/45B7D1?text=Workflow+Timeline)

*Real-time visualization of agent execution progress*

---

### Agent Execution View

![Agent Execution](https://via.placeholder.com/800x450/1a1a2e/FFB347?text=Agent+Execution+View)

*Detailed view of each agent's execution and outputs*

---

## 🤝 Contributing

We welcome contributions to TaxFlow AI! Please read our contributing guidelines before submitting PRs.

### Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/taxflow-ai.git

# Create a feature branch
git checkout -b feature/my-feature

# Make your changes and commit
git add .
git commit -m "Add my feature"

# Push and create PR
git push origin feature/my-feature
```

### Code Style

- Use **ESLint** and **Prettier** for code formatting
- Follow **Conventional Commits** for commit messages
- Write **tests** for new features
- Update **documentation** accordingly

---

## 📄 License

MIT License

Copyright (c) 2024 TaxFlow AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<div align="center">

![Star Badge](https://img.shields.io/github/stars/nicologhielmetti/taxflow-ai?style=flat&color=FF6B6B)
![Fork Badge](https://img.shields.io/github/forks/nicologhielmetti/taxflow-ai?style=flat&color=4ECDC4)
![Watchers Badge](https://img.shields.io/github/watchers/nicologhielmetti/taxflow-ai?style=flat&color=45B7D1)

*Built with ❤️ by tax professionals, for tax professionals*

</div>
