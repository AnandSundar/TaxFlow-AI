# TaxFlow AI - Architecture Specification

**Project Identity:**
- **Name**: TaxFlow AI
- **Tagline**: "Agentic AI workflows for modern tax professionals"
- **Version**: 1.0.0
- **Description**: Multi-agent AI platform that automatically analyzes tax documents and assists tax professionals with complex workflows

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Folder Structure](#folder-structure)
4. [Agent Graph System](#agent-graph-system)
5. [RAG Knowledge System](#rag-knowledge-system)
6. [Document Intelligence Pipeline](#document-intelligence-pipeline)
7. [Observability System](#observability-system)
8. [UI/UX Design Specification](#uiux-design-specification)
9. [Docker Infrastructure](#docker-infrastructure)
10. [Example Workflow: Client Tax Review](#example-workflow-client-tax-review)
11. [API Specification](#api-specification)
12. [Data Models](#data-models)
13. [Security Considerations](#security-considerations)
14. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

TaxFlow AI is an advanced tax preparation assistance platform that leverages multi-agent AI systems to automate document analysis, extract financial data, identify deductions, and ensure compliance. The platform is designed to augment tax professionals' capabilities rather than replace them, providing intelligent assistance throughout the tax preparation workflow.

### Core Principles

1. **Agentic Automation**: Autonomous AI agents handle repetitive tasks while professionals focus on high-value judgment calls
2. **Knowledge-Augmented**: RAG system provides accurate, citeable tax regulation references
3. **Observable**: Full traceability of AI decisions for compliance and audit purposes
4. **Extensible**: Modular architecture allowing easy addition of new agents and workflows

---

## System Architecture Overview

```mermaid
flowchart TB
    subgraph Clients["Client Layer"]
        Web[Web Application]
        Mobile[Mobile App]
    end
    
    subgraph Gateway["API Gateway"]
        Auth[Authentication]
        Rate[Rate Limiting]
    end
    
    subgraph Services["Service Layer"]
        API[REST API]
        WebSocket[WebSocket Server]
    end
    
    subgraph Agents["Agent Framework"]
        Engine[Graph Engine]
        Nodes[Agent Nodes]
        Tools[Tool Registry]
        Memory[Shared Memory]
    end
    
    subgraph Knowledge["Knowledge Layer"]
        RAG[RAG Pipeline]
        Embed[Embedding Service]
        VecDB[Vector Database]
    end
    
    subgraph Document["Document Processing"]
        Upload[Upload Handler]
        OCR[OCR Pipeline]
        Extract[Entity Extraction]
    end
    
    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        Redis[(Redis)]
        S3[(S3/Storage)]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    Gateway --> Services
    Services --> API
    Services --> WebSocket
    API --> Agents
    API --> RAG
    API --> Document
    API --> Data
    Agents --> Tools
    Agents --> Memory
    RAG --> Embed
    RAG --> VecDB
    Document --> OCR
    Document --> Extract
```

---

## Folder Structure

```
taxagent-pro/
├── apps/
│   └── web/                    # Frontend (Next.js)
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── dashboard/
│       │   │   ├── clients/
│       │   │   ├── documents/
│       │   │   ├── workspace/
│       │   │   └── chat/
│       │   ├── components/
│       │   │   ├── ui/         # Reusable UI components
│       │   │   ├── dashboard/  # Dashboard components
│       │   │   ├── clients/    # Client management
│       │   │   ├── documents/ # Document viewer
│       │   │   ├── agents/     # Agent visualization
│       │   │   └── chat/       # Chat components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilities
│       │   ├── stores/         # State management
│       │   └── types/          # TypeScript types
│       ├── public/
│       ├── tailwind.config.ts
│       ├── next.config.js
│       └── package.json
│
├── services/
│   └── api/                    # Backend API (Node.js/Express)
│       ├── src/
│       │   ├── index.ts        # Entry point
│       │   ├── config/         # Configuration
│       │   ├── routes/         # API routes
│       │   ├── middleware/     # Express middleware
│       │   ├── services/       # Business logic
│       │   ├── utils/          # Utilities
│       │   └── types/          # TypeScript types
│       ├── prisma/
│       │   └── schema.prisma  # Database schema
│       └── package.json
│
├── agents/                     # Agent Framework
│   ├── src/
│   │   ├── index.ts            # Main export
│   │   ├── base/
│   │   │   ├── Agent.ts        # Base agent class
│   │   │   ├── Node.ts         # Agent node interface
│   │   │   └── Tool.ts         # Tool definition
│   │   ├── graph/
│   │   │   ├── GraphEngine.ts  # Orchestration engine
│   │   │   ├── GraphBuilder.ts # Graph builder DSL
│   │   │   ├── Executor.ts     # Execution engine
│   │   │   └── types.ts        # Graph types
│   │   ├── nodes/              # Individual agents
│   │   │   ├── index.ts
│   │   │   ├── DocumentIntelligence.ts
│   │   │   ├── FinancialExtraction.ts
│   │   │   ├── TaxKnowledge.ts
│   │   │   ├── DeductionDiscovery.ts
│   │   │   ├── ComplianceCheck.ts
│   │   │   ├── SummaryGenerator.ts
│   │   │   └── ChatAgent.ts
│   │   ├── tools/              # Tool registry
│   │   │   ├── index.ts
│   │   │   ├── database.ts
│   │   │   ├── rag.ts
│   │   │   ├── document.ts
│   │   │   └── calculation.ts
│   │   ├── memory/
│   │   │   ├── MemoryStore.ts
│   │   │   ├── ContextManager.ts
│   │   │   └── types.ts
│   │   ├── planner/
│   │   │   ├── WorkflowPlanner.ts
│   │   │   └── planner.types.ts
│   │   └── tracing/
│   │       ├── Tracer.ts
│   │       ├── ExecutionSpan.ts
│   │       └── tracing.types.ts
│   └── package.json
│
├── document-intelligence/       # Document Processing
│   ├── src/
│   │   ├── index.ts
│   │   ├── pipeline/
│   │   │   ├── DocumentPipeline.ts
│   │   │   ├── stages/
│   │   │   │   ├── UploadStage.ts
│   │   │   │   ├── ClassificationStage.ts
│   │   │   │   ├── OCRStage.ts
│   │   │   │   ├── ChunkingStage.ts
│   │   │   │   └── ExtractionStage.ts
│   │   │   └── PipelineContext.ts
│   │   ├── classifiers/
│   │   │   ├── DocumentClassifier.ts
│   │   │   └── types.ts
│   │   ├── ocr/
│   │   │   ├── OCREngine.ts
│   │   │   └── providers/
│   │   │       ├── OpenAIVision.ts
│   │   │       └── Tesseract.ts
│   │   ├── chunking/
│   │   │   ├── SemanticChunker.ts
│   │   │   └── strategies/
│   │   │       ├── RecursiveChunker.ts
│   │   │       ├── SemanticChunker.ts
│   │   │       └── LayoutChunker.ts
│   │   ├── extraction/
│   │   │   ├── EntityExtractor.ts
│   │   │   ├── extractors/
│   │   │   │   ├── FinancialExtractor.ts
│   │   │   │   ├── TaxExtractor.ts
│   │   │   │   └── PersonalExtractor.ts
│   │   │   └── schemas/
│   │   │       ├── financial.schema.ts
│   │   │       └── tax.schema.ts
│   │   └── storage/
│   │       ├── DocumentStore.ts
│   │       └── types.ts
│   └── package.json
│
├── rag/                        # RAG Knowledge System
│   ├── src/
│   │   ├── index.ts
│   │   ├── pipeline/
│   │   │   ├── IngestionPipeline.ts
│   │   │   ├── QueryPipeline.ts
│   │   │   └── CitationInjector.ts
│   │   ├── knowledge/
│   │   │   ├── TaxRegulation.ts
│   │   │   ├── IRSPublication.ts
│   │   │   └── forms/
│   │   ├── embeddings/
│   │   │   ├── EmbeddingService.ts
│   │   │   ├── providers/
│   │   │   │   ├── OpenAIEmbeddings.ts
│   │   │   │   └── LocalEmbeddings.ts
│   │   │   └── types.ts
│   │   ├── vector/
│   │   │   ├── VectorStore.ts
│   │   │   ├── pgvector.ts
│   │   │   └── hybrid.ts
│   │   ├── chunking/
│   │   │   ├── TextChunker.ts
│   │   │   └── strategies/
│   │   └── reranking/
│   │       ├── CrossEncoderReranker.ts
│   │       └── types.ts
│   └── package.json
│
├── infra/                      # Infrastructure
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.agent
│   │   └── nginx.conf
│   ├── kubernetes/
│   │   ├── base/
│   │   ├── overlays/
│   │   └── kustomization.yml
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   ├── agent-development.md
│   └── tax-regulations/
│       ├── index.md
│       └── 2024/
│
├── examples/                   # Example Workflows
│   ├── workflows/
│   │   ├── client-tax-review/
│   │   │   ├── workflow.json
│   │   │   └── prompts/
│   │   ├── deduction-discovery/
│   │   └── compliance-check/
│   └── scripts/
│       ├── run-workflow.ts
│       └── benchmark.ts
│
├── packages/                   # Shared packages
│   ├── types/
│   │   ├── index.ts
│   │   ├── agent.types.ts
│   │   ├── document.types.ts
│   │   └── api.types.ts
│   └── utils/
│       ├── logger.ts
│       └── validators.ts
│
├── .env.example
├── package.json
├── tsconfig.json
├── turbo.json
└── README.md
```

---

## Agent Graph System

### Overview

The Agent Graph System is the core orchestration layer that manages multiple AI agents working together to complete complex tax workflows. It uses a directed acyclic graph (DAG) structure where each node represents an agent and edges represent data flow between agents.

```mermaid
flowchart LR
    subgraph Input
        Docs[Documents]
    end
    
    subgraph Graph[Agent Graph]
        DI[Document<br/>Intelligence]
        FE[Financial<br/>Extraction]
        TK[Tax<br/>Knowledge]
        DD[Deduction<br/>Discovery]
        CC[Compliance<br/>Check]
        SG[Summary<br/>Generator]
    end
    
    subgraph Output
        Report[Tax Report]
        Chat[AI Chat]
    end
    
    Docs --> DI
    DI --> FE
    FE --> TK
    TK --> DD
    DD --> CC
    CC --> SG
    SG --> Report
    FE -.-> Chat
```

### Components

#### 1. Graph Engine (`GraphEngine.ts`)

The GraphEngine is responsible for:
- Loading and validating workflow graphs
- Managing node execution order
- Handling parallel execution where possible
- Propagating context between nodes
- Error handling and recovery

```typescript
interface GraphEngine {
  // Load a workflow graph definition
  loadGraph(definition: GraphDefinition): Promise<void>;
  
  // Execute the graph with initial context
  execute(context: ExecutionContext): Promise<ExecutionResult>;
  
  // Get current execution state
  getState(): GraphState;
  
  // Pause/Resume execution
  pause(): Promise<void>;
  resume(): Promise<void>;
  
  // Subscribe to execution events
  on(event: ExecutionEvent, handler: EventHandler): void;
}
```

#### 2. Agent Nodes

Each agent node is a specialized AI that performs a specific task:

| Node | Purpose | Input | Output |
|------|---------|-------|--------|
| DocumentIntelligence | Analyze and classify documents | Raw files | Classified documents with metadata |
| FinancialExtraction | Extract financial entities | Classified documents | Structured financial data |
| TaxKnowledge | Query tax regulations | Questions | Cited regulation answers |
| DeductionDiscovery | Identify potential deductions | Financial data | Deduction recommendations |
| ComplianceCheck | Verify tax compliance | All data | Compliance report |
| SummaryGenerator | Generate final report | All outputs | Formatted tax summary |

```typescript
interface AgentNode {
  // Unique identifier
  id: string;
  
  // Node configuration
  config: NodeConfig;
  
  // Input schemas
  inputSchema: z.ZodSchema;
  
  // Output schemas  
  outputSchema: z.ZodSchema;
  
  // Execute the agent
  execute(context: NodeContext): Promise<NodeResult>;
  
  // Validate inputs
  validate(input: unknown): ValidationResult;
  
  // Get tool definitions for this node
  getTools(): ToolDefinition[];
}
```

#### 3. Tool Registry

The Tool Registry provides agents with capabilities to interact with external systems:

```typescript
interface ToolRegistry {
  // Register a new tool
  register(tool: ToolDefinition): void;
  
  // Get tool by name
  get(name: string): ToolDefinition | undefined;
  
  // List all available tools
  list(): ToolDefinition[];
  
  // Execute a tool
  execute(name: string, args: ToolArgs): Promise<ToolResult>;
  
  // Search tools by capability
  search(capability: string): ToolDefinition[];
}

// Built-in tools
const builtInTools = {
  // Database operations
  query_database: {
    name: 'query_database',
    description: 'Query the client database',
    parameters: z.object({
      sql: z.string(),
      params: z.array(z.any()).optional()
    })
  },
  
  // RAG queries
  search_knowledge: {
    name: 'search_knowledge',
    description: 'Search tax regulations and publications',
    parameters: z.object({
      query: z.string(),
      year: z.number().optional(),
      topic: z.string().optional()
    })
  },
  
  // Document operations
  get_document: {
    name: 'get_document',
    description: 'Retrieve a document by ID',
    parameters: z.object({
      documentId: z.string()
    })
  },
  
  // Calculations
  calculate_tax: {
    name: 'calculate_tax',
    description: 'Calculate tax liability',
    parameters: z.object({
      income: z.number(),
      deductions: z.array(z.object({
        type: z.string(),
        amount: z.number()
      })),
      filingStatus: z.enum(['single', 'married_joint', 'married_separate', 'head_of_household'])
    })
  },
  
  // Citation lookup
  get_citation: {
    name: 'get_citation',
    description: 'Get IRS citation details',
    parameters: z.object({
      citation: z.string()
    })
  }
};
```

#### 4. Shared Context Memory

Manages state across agent executions:

```typescript
interface MemoryStore {
  // Store a value
  set(key: string, value: unknown): Promise<void>;
  
  // Get a value
  get<T>(key: string): Promise<T | undefined>;
  
  // Delete a value
  delete(key: string): Promise<void>;
  
  // Check if key exists
  has(key: string): Promise<boolean>;
  
  // Get all keys matching pattern
  keys(pattern: string): Promise<string[]>;
  
  // Clear all data
  clear(): Promise<void>;
}

// Context propagation between nodes
interface ContextManager {
  // Create a new execution context
  createContext(workflowId: string, initialData: Record<string, unknown>): ExecutionContext;
  
  // Get current context
  getContext(): ExecutionContext;
  
  // Update context
  updateContext(updates: Partial<ExecutionContext>): void;
  
  // Subscribe to context changes
  onContextChange(handler: (context: ExecutionContext) => void): void;
}
```

#### 5. Workflow Planner

Determines the optimal execution path:

```typescript
interface WorkflowPlanner {
  // Plan a workflow based on inputs
  plan(goal: string, inputs: Record<string, unknown>): Promise<WorkflowPlan>;
  
  // Optimize an existing plan
  optimize(plan: WorkflowPlan): Promise<WorkflowPlan>;
  
  // Validate a plan
  validate(plan: WorkflowPlan): ValidationResult;
  
  // Explain the plan
  explain(plan: WorkflowPlan): string;
}

interface WorkflowPlan {
  id: string;
  nodes: PlannedNode[];
  dependencies: NodeDependency[];
  estimatedCost: number;
  estimatedDuration: number;
}
```

---

## RAG Knowledge System

### Overview

The RAG (Retrieval-Augmented Generation) system provides tax agents with accurate, citeable information from tax regulations, IRS publications, and forms.

```mermaid
flowchart TB
    subgraph Ingestion["Ingestion Pipeline"]
        Raw[Raw Documents]
        Parse[Parser]
        Chunk[Chunker]
        Embed[Embedding Generator]
        Store[Vector Store]
    end
    
    subgraph Query["Query Pipeline"]
        QueryUser[User Query]
        EmbedQuery[Embed Query]
        Retrieve[Retrieve Chunks]
        Rerank[Rerank]
        Generate[Generate Answer]
        Cite[Add Citations]
    end
    
    Raw --> Parse
    Parse --> Chunk
    Chunk --> Embed
    Embed --> Store
    
    QueryUser --> EmbedQuery
    EmbedQuery --> Retrieve
    Retrieve --> Rerank
    Rerank --> Generate
    Generate --> Cite
```

### Components

#### 1. Document Ingestion

```typescript
interface IngestionPipeline {
  // Ingest a new document
  ingest(document: TaxDocument): Promise<IngestionResult>;
  
  // Batch ingest multiple documents
  batchIngest(documents: TaxDocument[]): Promise<BatchResult>;
  
  // Update an existing document
  update(documentId: string, document: TaxDocument): Promise<void>;
  
  // Delete a document
  delete(documentId: string): Promise<void>;
  
  // Get document status
  getStatus(documentId: string): Promise<IngestionStatus>;
}
```

#### 2. Semantic Chunking

```typescript
interface SemanticChunker {
  // Chunk a document semantically
  chunk(document: TextDocument, options: ChunkOptions): Promise<Chunk[]>;
  
  // Strategies available
  chunkWithStrategy(document: TextDocument, strategy: ChunkingStrategy): Promise<Chunk[]>;
}

interface ChunkOptions {
  chunkSize: number;        // Target chunk size in tokens
  chunkOverlap: number;     // Overlap between chunks
  strategy: ChunkingStrategy;
  preserveStructure: boolean;
  extractMetadata: boolean;
}

type ChunkingStrategy = 
  | 'recursive' 
  | 'semantic' 
  | 'layout' 
  | 'hybrid';

interface Chunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  metadata: ChunkMetadata;
  embedding?: number[];
}

interface ChunkMetadata {
  documentId: string;
  documentType: DocumentType;
  pageNumber?: number;
  section?: string;
  headings?: string[];
}
```

#### 3. Vector Embeddings

```typescript
interface EmbeddingService {
  // Generate embeddings for text
  embed(text: string): Promise<number[]>;
  
  // Generate embeddings for multiple texts (batch)
  embedBatch(texts: string[]): Promise<number[][]>;
  
  // Get embedding dimensions
  getDimensions(): number;
  
  // Get model name
  getModelName(): string;
}

// Provider interface
interface EmbeddingProvider {
  name: string;
  dimensions: number;
  maxBatchSize: number;
  embed(texts: string[]): Promise<number[][]>;
}
```

#### 4. Citation Injection

```typescript
interface CitationInjector {
  // Inject citations into generated text
  inject(response: string, sources: Source[]): Promise<CitedResponse>;
  
  // Format a citation
  formatCitation(source: Source, style: CitationStyle): string;
  
  // Generate bibliography
  generateBibliography(sources: Source[]): string;
}

interface CitedResponse {
  content: string;
  citations: Citation[];
  sources: Source[];
}

interface Citation {
  id: string;
  sourceId: string;
  location: CitationLocation;
  text: string;
}

interface Source {
  id: string;
  documentId: string;
  title: string;
  type: 'irs_publication' | 'regulation' | 'form' | 'ruling';
  url?: string;
  effectiveDate?: Date;
  jurisdiction: string;
}
```

---

## Document Intelligence Pipeline

### Overview

The document intelligence pipeline processes uploaded tax documents through multiple stages to extract structured financial data.

```mermaid
flowchart LR
    Upload[Upload] --> Classify[Classify]
    Classify --> OCR[OCR]
    OCR --> Chunk[Chunk]
    Chunk --> Extract[Extract]
    Extract --> Store[Store]
    
    subgraph Quality
        Q1[Quality Check]
        Q2[Validation]
    end
    
    Classify -.-> Q1
    Extract -.-> Q2
```

### Pipeline Stages

#### 1. Upload Handler

```typescript
interface UploadHandler {
  // Handle file upload
  handleUpload(files: UploadedFile[]): Promise<UploadResult>;
  
  // Validate file format
  validate(file: UploadedFile): ValidationResult;
  
  // Generate upload URL for direct uploads
  generateUploadUrl(metadata: FileMetadata): Promise<UploadUrl>;
  
  // Virus scan uploaded file
  scan(file: UploadedFile): Promise<ScanResult>;
}

interface UploadedFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  checksum: string;
}
```

#### 2. Document Classifier

```typescript
interface DocumentClassifier {
  // Classify a document
  classify(document: Document): Promise<ClassificationResult>;
  
  // Batch classify multiple documents
  batchClassify(documents: Document[]): Promise<ClassificationResult[]>;
  
  // Get confidence score
  getConfidence(classification: Classification): number;
}

type DocumentType = 
  | 'w2'
  | '1099'
  | '1098'
  | 'mortgage_statement'
  | 'investment_statement'
  | 'property_tax'
  | 'medical_records'
  | 'charity_receipt'
  | 'business_expense'
  | 'invoice'
  | 'receipt'
  | 'bank_statement'
  | 'credit_card_statement'
  | 'other';

interface ClassificationResult {
  type: DocumentType;
  confidence: number;
  subType?: string;
  metadata: ClassificationMetadata;
}
```

#### 3. OCR Pipeline

```typescript
interface OCREngine {
  // Perform OCR on image/document
  recognize(document: ImageDocument): Promise<OCRResult>;
  
  // Get text from PDF
  extractFromPDF(pdf: PDFDocument): Promise<OCRResult[]>;
  
  // Detect handwriting
  detectHandwriting(document: ImageDocument): Promise<HandwritingResult>;
}

interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: BoundingBox[];
  language: string;
  tables: Table[];
  detectedFields: Field[];
}
```

#### 4. Entity Extraction

```typescript
interface EntityExtractor {
  // Extract entities from document text
  extract(document: TextDocument): Promise<ExtractionResult>;
  
  // Extract specific entity type
  extractType(document: TextDocument, entityType: EntityType): Promise<Entity[]>;
}

interface ExtractionResult {
  entities: Entity[];
  relationships: Relationship[];
  confidence: number;
  warnings: ExtractionWarning[];
}

// Financial entity types
type EntityType = 
  | 'income'
  | 'deduction'
  | 'expense'
  | 'asset'
  | 'liability'
  | 'tax_credit'
  | 'withholding'
  | 'adjustment';

interface Entity {
  id: string;
  type: EntityType;
  value: number | string | boolean;
  confidence: number;
  source: {
    documentId: string;
    page: number;
    boundingBox?: BoundingBox;
  };
  metadata: Record<string, unknown>;
}
```

---

## Observability System

### Overview

The observability system provides full visibility into agent execution, enabling debugging, compliance auditing, and performance optimization.

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AgentEngine
    participant Agent1
    participant Agent2
    participant Tracer
    
    Client->>API: Start Workflow
    API->>AgentEngine: Execute
    AgentEngine->>Tracer: Start Span (workflow)
    AgentEngine->>Agent1: Execute Node
    Agent1->>Tracer: Start Span (agent1)
    Agent1-->>Tracer: Log (extracted data)
    Agent1-->>Tracer: End Span
    AgentEngine->>Agent2: Execute Node
    Agent2->>Tracer: Start Span (agent2)
    Agent2-->>Tracer: Log (analysis)
    Agent2-->>Tracer: End Span
    AgentEngine-->>Tracer: End Span
    API-->>Client: Results + Trace ID
```

### Components

#### 1. Execution Tracer

```typescript
interface Tracer {
  // Start a new trace
  startTrace(name: string, context: TraceContext): Trace;
  
  // Start a span within a trace
  startSpan(name: string, parent: Trace | Span): Span;
  
  // Add event to span
  addEvent(span: Span, event: SpanEvent): void;
  
  // Add log to span
  log(span: Span, fields: Record<string, unknown>): void;
  
  // Set span status
  setStatus(span: Span, status: SpanStatus): void;
  
  // End span
  endSpan(span: Span): void;
  
  // End trace
  endTrace(trace: Trace): void;
  
  // Get trace by ID
  getTrace(traceId: string): Promise<Trace>;
  
  // Query traces
  queryTraces(filter: TraceFilter): Promise<Trace[]>;
}

interface Trace {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  context: TraceContext;
  spans: Span[];
  status: TraceStatus;
  metadata: Record<string, unknown>;
}

interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  attributes: Record<string, unknown>;
  events: SpanEvent[];
  logs: SpanLog[];
  status: SpanStatus;
}
```

#### 2. Tool Usage Logging

```typescript
interface ToolLogger {
  // Log tool invocation
  logToolCall(toolCall: ToolCall): void;
  
  // Log tool result
  logToolResult(toolCallId: string, result: ToolResult): void;
  
  // Get tool usage statistics
  getStats(filter: ToolUsageFilter): Promise<ToolUsageStats>;
}

interface ToolCall {
  id: string;
  traceId: string;
  spanId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'success' | 'error';
  error?: string;
}
```

#### 3. Reasoning Traces

```typescript
interface ReasoningTracer {
  // Log agent reasoning
  logReasoning(span: Span, reasoning: ReasoningStep): void;
  
  // Log decision point
  logDecision(span: Span, decision: Decision): void;
  
  // Log model prompt
  logPrompt(span: Span, prompt: PromptLog): void;
  
  // Log model response
  logResponse(span: Span, response: ResponseLog): void;
}

interface ReasoningStep {
  step: number;
  thought: string;
  action?: string;
  observation?: string;
  timestamp: Date;
}
```

---

## UI/UX Design Specification

### Design System

**Color Palette**
- Primary: `#4F46E5` (Indigo 600)
- Primary Hover: `#4338CA` (Indigo 700)
- Secondary: `#0EA5E9` (Sky 500)
- Accent: `#10B981` (Emerald 500)
- Warning: `#F59E0B` (Amber 500)
- Error: `#EF4444` (Red 500)
- Background: `#F8FAFC` (Slate 50)
- Surface: `#FFFFFF`
- Text Primary: `#0F172A` (Slate 900)
- Text Secondary: `#64748B` (Slate 500)
- Border: `#E2E8F0` (Slate 200)

**Typography**
- Headings: "Inter", system-ui, sans-serif
- Body: "Inter", system-ui, sans-serif
- Monospace: "JetBrains Mono", monospace (for code/amounts)
- H1: 32px, font-weight: 700
- H2: 24px, font-weight: 600
- H3: 20px, font-weight: 600
- Body: 14px, font-weight: 400
- Small: 12px, font-weight: 400

**Spacing**
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

**Border Radius**
- sm: 4px, md: 8px, lg: 12px, xl: 16px, full: 9999px

### Page Layouts

#### 1. Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar (240px)  │  Main Content Area                          │
│                  │  ┌─────────────────────────────────────────┐ │
│ ○ Dashboard      │  │ Header: Page Title + Actions          │ │
│ ○ Clients        │  ├─────────────────────────────────────────┤ │
│ ○ Documents      │  │ Stats Cards (4 columns)                │ │
│ ○ AI Insights    │  │ - Total Cases                          │ │
│ ○ Settings       │  │ - In Progress                           │ │
│                  │  │ - Review Ready                          │ │
│ ─────────────    │  │ - Pending Action                        │ │
│ [User Avatar]    │  ├─────────────────────────────────────────┤ │
│                  │  │ Recent Activity / Timeline              │ │
│                  │  │ - Case updates                          │ │
│                  │  │ - Document uploads                      │ │
│                  │  │ - AI analysis completions               │ │
│                  │  ├─────────────────────────────────────────┤ │
│                  │  │ Quick Actions                           │ │
│                  │  │ [New Client] [Upload Documents]         │ │
│                  │  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 2. Case Workspace

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │  Case Workspace                                                    │
│         │  ┌──────────────────────────────────────────────────────────────┐ │
│ ← Back  │  │ Client Header: Name, Status, Filing Year                     │ │
│         │  ├────────────────────┬─────────────────────────────────────────┤ │
│ Client  │  │                    │                                         │ │
│ Info    │  │ Documents Panel    │ Analysis Panel                          │ │
│         │  │ - Upload zone      │ - Summary tab                           │ │
│         │  │ - Document list    │ - Deductions tab                        │ │
│         │  │ - Preview          │ - Risks tab                              │ │
│         │  │                    │ - Notes tab                              │ │
│ ─────── │  │                    ├─────────────────────────────────────────┤ │
│         │  │                    │ Workflow Timeline                        │ │
│ Actions │  │                    │ [Document] → [Extract] → [Analyze]       │ │
│         │  │                    │        → [Deductions] → [Compliance]     │ │
│         │  │                    │        → [Summary]                       │ │
└─────────┴──┴────────────────────┴─────────────────────────────────────────┘
```

#### 3. AI Chat

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar │  AI Assistant                                         │
│         │  ┌─────────────────────────────────────────────────┐ │
│ ─────── │  │ Chat Header: Tax Agent                           │ │
│         │  ├─────────────────────────────────────────────────┤ │
│ Threads │  │                                                 │ │
│ > Case1 │  │ Message History                                  │ │
│ > Case2 │  │ ┌─────────────────────────────────────────────┐  │ │
│ > Case3 │  │ │ User: What deductions can I claim?         │  │ │
│         │  │ └─────────────────────────────────────────────┘  │ │
│ ─────── │  │ ┌─────────────────────────────────────────────┐  │ │
│         │  │ │ AI: Based on your documents, here are      │  │ │
│         │  │ │ potential deductions:                      │  │ │
│         │  │ │ • Mortgage interest: $X (Form 1098)        │  │ │
│         │  │ │ • Charitable: $Y (Receipts)                │  │ │
│         │  │ │                                             │  │ │
│         │  │ │ [Source: IRC §163(h) | Pub 936]            │  │ │
│         │  │ └─────────────────────────────────────────────┘  │ │
│         │  ├─────────────────────────────────────────────────┤ │
│         │  │ Input: [Type message...] [Attach] [Send]       │ │
│         │  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 4. Agent Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│ Workflow Visualization                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │    ┌──────────┐     ┌──────────┐     ┌──────────┐           │ │
│ │    │ Document │────▶│ Financial│────▶│   Tax    │           │ │
│ │    │ Intell.  │     │ Extract  │     │ Knowledge│           │ │
│ │    └──────────┘     └──────────┘     └──────────┘           │ │
│ │         │               │               │                  │ │
│ │         │               │               ▼                  │ │
│ │         │               │         ┌──────────┐             │ │
│ │         │               │────────▶│ Deduction│             │ │
│ │         │               │         │Discovery │             │ │
│ │         │               │         └──────────┘             │ │
│ │         │               │               │                  │ │
│ │         │               │               ▼                  │ │
│ │         │               │         ┌──────────┐             │ │
│ │         │               └────────▶│Compliance│             │ │
│ │         │                         │  Check   │             │ │
│ │         │                         └──────────┘             │ │
│ │         │                              │                    │ │
│ │         ▼                              ▼                    │ │
│ │    ┌──────────┐                   ┌──────────┐              │ │
│ │    │ Summary  │◀──────────────────│   AI     │              │ │
│ │    │Generator │                   │  Chat    │              │ │
│ │    └──────────┘                   └──────────┘              │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Execution Details                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▶ Document Intelligence     2.3s    ✓ Complete              │ │
│ │   ├─ OCR Processing        1.1s                            │ │
│ │   ├─ Classification        0.8s    Type: W-2 (99%)        │ │
│ │   └─ Text Extraction       0.4s                            │ │
│ │ ▶ Financial Extraction     1.8s    ✓ Complete              │ │
│ │   ├─ Income Detection      0.9s    Found: $75,000         │ │
│ │   └─ Entity Mapping        0.9s    12 entities            │ │
│ │ ▶ Tax Knowledge            3.2s    ✓ Complete              │ │
│ │   ├─ Query RAG             2.8s    5 sources              │ │
│ │   └─ Citation Injection    0.4s    3 citations            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Docker Infrastructure

### Multi-Container Setup

```yaml
# docker-compose.yml
version: '3.9'

services:
  # Frontend Application
  web:
    build:
      context: ./apps/web
      dockerfile: ../infra/docker/Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_URL=http://api:4000
    depends_on:
      - api
    networks:
      - taxflow

  # Backend API
  api:
    build:
      context: ./services/api
      dockerfile: ../infra/docker/Dockerfile.api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/taxflow
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - document-storage:/app/uploads
    networks:
      - taxflow

  # Agent Service
  agents:
    build:
      context: ./agents
      dockerfile: ../infra/docker/Dockerfile.agent
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/taxflow
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    networks:
      - taxflow

  # PostgreSQL with pgvector
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=taxflow
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - taxflow

  # Redis for caching and session
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - taxflow

  # Document Storage (MinIO for S3-compatible)
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    networks:
      - taxflow

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/docker/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web
      - api
    networks:
      - taxflow

networks:
  taxflow:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  minio-data:
  document-storage:
```

### Dockerfile Examples

```dockerfile
# Dockerfile.api
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY ./src ./src

EXPOSE 4000

CMD ["node", "src/index.js"]
```

```dockerfile
# Dockerfile.web
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## Example Workflow: Client Tax Review

### Overview

The "Client Tax Review" is the primary workflow that demonstrates the complete agent system capabilities. It processes client documents through multiple stages to generate a comprehensive tax analysis.

```mermaid
flowchart TB
    subgraph Input
        Docs[Documents]
        ClientInfo[Client Info]
    end
    
    subgraph Stage1[Stage 1: Document Processing]
        Classify[Classify]
        ExtractText[Extract Text]
        Validate[Validate]
    end
    
    subgraph Stage2[Stage 2: Data Extraction]
        Income[Extract Income]
        Deductions[Extract Deductions]
        Assets[Extract Assets]
        Liabilities[Extract Liabilities]
    end
    
    subgraph Stage3[Stage 3: Analysis]
        RAG[Query Knowledge Base]
        Match[Match Deductions]
        Check[Compliance Check]
    end
    
    subgraph Stage4[Stage 4: Output]
        Report[Generate Report]
        Citations[Add Citations]
        Summary[Create Summary]
    end
    
    Docs --> Stage1
    ClientInfo --> Stage1
    Stage1 --> Stage2
    Stage2 --> Stage3
    Stage3 --> Stage4
```

### Workflow Definition

```json
{
  "id": "client-tax-review",
  "name": "Client Tax Review",
  "description": "Complete tax review workflow for a client",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "document-intelligence",
      "type": "agent",
      "agent": "DocumentIntelligenceAgent",
      "config": {
        "model": "gpt-4o",
        "temperature": 0.1,
        "maxTokens": 4000
      },
      "inputs": ["$documents"],
      "outputs": ["classifiedDocuments"],
      "retry": {
        "maxAttempts": 2,
        "backoff": "exponential"
      }
    },
    {
      "id": "financial-extraction",
      "type": "agent",
      "agent": "FinancialExtractionAgent",
      "config": {
        "model": "gpt-4o",
        "temperature": 0.0,
        "maxTokens": 6000
      },
      "inputs": ["$classifiedDocuments"],
      "outputs": ["financialData"],
      "dependsOn": ["document-intelligence"]
    },
    {
      "id": "tax-knowledge-query",
      "type": "agent",
      "agent": "TaxKnowledgeAgent",
      "config": {
        "model": "gpt-4o",
        "temperature": 0.2,
        "maxTokens": 4000,
        "tools": ["search_knowledge", "get_citation"]
      },
      "inputs": ["$financialData.questions"],
      "outputs": ["knowledgeResults"],
      "dependsOn": ["financial-extraction"],
      "parallel": true
    },
    {
      "id": "deduction-discovery",
      "type": "agent",
      "agent": "DeductionDiscoveryAgent",
      "config": {
        "model": "gpt-4o",
        "temperature": 0.3,
        "maxTokens": 5000
      },
      "inputs": ["$financialData", "$knowledgeResults"],
      "outputs": ["deductionRecommendations"],
      "dependsOn": ["tax-knowledge-query"]
    },
    {
      "id": "compliance-check",
      "type": "agent",
      "agent": "ComplianceCheckAgent",
      "config": {
        "model": "gpt-4o",
        "temperature": 0.1,
        "maxTokens": 4000,
        "strictMode": true
      },
      "inputs": ["$financialData", "$deductionRecommendations"],
      "outputs": ["complianceReport"],
      "dependsOn": ["deduction-discovery"]
    },
    {
      "id": "summary-generator",
      "type": "agent",
      "agent": "SummaryGeneratorAgent",
      "config": {
        "model": "gpt-4o",
        "temperature": 0.2,
        "maxTokens": 8000
      },
      "inputs": [
        "$financialData",
        "$deductionRecommendations",
        "$complianceReport"
      ],
      "outputs": ["finalReport"],
      "dependsOn": ["compliance-check"]
    }
  ],
  "output": {
    "report": "$finalReport",
    "trace": "$executionTrace"
  }
}
```

### Execution Flow

```
1. Upload Documents
   ├── W-2 form (Employment Income)
   ├── 1099-DIV (Dividend Income)
   ├── Mortgage Statement (1098)
   ├── Charity Receipts
   └── Medical Records

2. Document Intelligence Agent
   ├── Classifies each document
   ├── Extracts text via OCR
   └── Validates document completeness
   
   Output: { classified: [...], issues: [...] }

3. Financial Extraction Agent
   ├── Identifies income sources
   ├── Maps deductions to categories
   └── Extracts amounts with confidence
   
   Output: { income: [...], deductions: [...], assets: [...], liabilities: [...] }

4. Tax Knowledge Agent (Parallel)
   ├── Queries relevant tax regulations
   ├── Finds deduction eligibility rules
   └── Retrieves citation references
   
   Output: { regulations: [...], citations: [...] }

5. Deduction Discovery Agent
   ├── Matches financial data to deduction rules
   ├── Estimates deduction amounts
   └── Prioritizes by tax impact
   
   Output: { recommended: [...], potential: [...], rejected: [...] }

6. Compliance Check Agent
   ├── Validates deduction eligibility
   ├── Checks reporting requirements
   └── Flags potential audit risks
   
   Output: { valid: [...], warnings: [...], errors: [...] }

7. Summary Generator Agent
   ├── Compiles all analysis
   ├── Generates client-friendly summary
   ├── Creates preparer notes
   └── Adds citations and sources
   
   Output: { summary, deductions, risks, notes, nextSteps }
```

---

## API Specification

### REST Endpoints

#### Authentication
```
POST   /api/auth/login          # User login
POST   /api/auth/logout         # User logout
GET    /api/auth/me             # Get current user
POST   /api/auth/refresh         # Refresh token
```

#### Clients
```
GET    /api/clients             # List clients
POST   /api/clients             # Create client
GET    /api/clients/:id         # Get client details
PUT    /api/clients/:id         # Update client
DELETE /api/clients/:id         # Delete client
```

#### Documents
```
GET    /api/documents           # List documents
POST   /api/documents           # Upload document
GET    /api/documents/:id       # Get document
DELETE /api/documents/:id       # Delete document
GET    /api/documents/:id/download  # Download document
```

#### Workflows
```
GET    /api/workflows           # List workflows
POST   /api/workflows           # Start workflow
GET    /api/workflows/:id       # Get workflow status
POST   /api/workflows/:id/pause # Pause workflow
POST   /api/workflows/:id/resume # Resume workflow
DELETE /api/workflows/:id       # Cancel workflow
GET    /api/workflows/:id/trace # Get execution trace
```

#### Chat
```
GET    /api/chat/threads        # List chat threads
POST   /api/chat/threads        # Create chat thread
GET    /api/chat/threads/:id    # Get thread messages
POST   /api/chat/threads/:id/messages  # Send message
```

#### Knowledge
```
GET    /api/knowledge/search    # Search knowledge base
GET    /api/knowledge/documents # List knowledge documents
POST   /api/knowledge/ingest    # Ingest new document
```

### WebSocket Events

```typescript
// Workflow execution events
interface WorkflowEvents {
  'workflow:start': (data: { workflowId: string }) => void;
  'workflow:node:start': (data: { nodeId: string; nodeName: string }) => void;
  'workflow:node:complete': (data: { nodeId: string; duration: number }) => void;
  'workflow:node:error': (data: { nodeId: string; error: string }) => void;
  'workflow:complete': (data: { workflowId: string; result: unknown }) => void;
  'workflow:error': (data: { workflowId: string; error: string }) => void;
}

// Chat events
interface ChatEvents {
  'chat:message': (data: { message: ChatMessage }) => void;
  'chat:typing': (data: { userId: string }) => void;
}
```

---

## Data Models

### Core Entities

```typescript
// Client
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  filingStatus: FilingStatus;
  taxYear: number;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Document
interface Document {
  id: string;
  clientId: string;
  filename: string;
  mimeType: string;
  size: number;
  type: DocumentType;
  classification: ClassificationResult;
  storageUrl: string;
  uploadedAt: Date;
  processedAt?: Date;
}

// Workflow
interface Workflow {
  id: string;
  clientId: string;
  type: WorkflowType;
  status: WorkflowStatus;
  definition: WorkflowDefinition;
  currentNode?: string;
  result?: unknown;
  trace?: Trace;
  startedAt?: Date;
  completedAt?: Date;
}

// Agent Execution
interface AgentExecution {
  id: string;
  workflowId: string;
  nodeId: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  tools: ToolCall[];
  reasoning: ReasoningStep[];
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
}

// Chat
interface ChatThread {
  id: string;
  clientId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt: Date;
}

// Knowledge
interface KnowledgeDocument {
  id: string;
  title: string;
  type: KnowledgeType;
  content: string;
  embeddings: number[];
  metadata: KnowledgeMetadata;
  ingestedAt: Date;
}

type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household' | 'qualifying_surviving_spouse';
type ClientStatus = 'new' | 'in_progress' | 'review_ready' | 'completed' | 'filed';
type DocumentType = 'w2' | '1099' | '1098' | 'investment' | 'property' | 'medical' | 'charity' | 'business' | 'other';
type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
type ExecutionStatus = 'pending' | 'running' | 'success' | 'error' | 'cancelled';
type KnowledgeType = 'irs_publication' | 'regulation' | 'form' | 'ruling' | 'guide' | 'faq';
```

---

## Security Considerations

### Authentication & Authorization

1. **JWT-based Authentication**
   - Access tokens with 15-minute expiry
   - Refresh tokens with 7-day expiry
   - Secure HTTP-only cookies for refresh tokens

2. **Role-Based Access Control**
   - Roles: Admin, Tax Professional, Viewer
   - Permissions: Create, Read, Update, Delete, Execute

3. **API Key Management**
   - API keys for service-to-service communication
   - Keys stored encrypted in database
   - Automatic rotation support

### Data Security

1. **Encryption at Rest**
   - AES-256 for database fields
   - S3 server-side encryption for documents

2. **Encryption in Transit**
   - TLS 1.3 for all connections
   - Certificate pinning for mobile apps

3. **Data Masking**
   - PII fields encrypted in logs
   - Social Security Numbers masked in UI
   - Financial data access logged

### Compliance

1. **Audit Logging**
   - All data access logged
   - Immutable audit trail
   - 7-year retention policy

2. **Privacy**
   - GDPR compliance
   - CCPA compliance
   - Data export/deletion capabilities

---

## Performance & Scaling Considerations

### Performance Targets

| Metric | Target | Description |
|--------|--------|-------------|
| API Response Time | < 200ms (p95) | Average API endpoint latency |
| Document Processing | < 10s per page | OCR + extraction time |
| Workflow Execution | < 60s total | End-to-end tax review workflow |
| Chat Response | < 3s (p95) | AI chat message latency |
| Vector Search | < 100ms | RAG query response time |
| Page Load | < 2s | Frontend initial load |

### Horizontal Scaling Architecture

```mermaid
flowchart TB
    subgraph Client[Client Layer]
        LB[Load Balancer]
    end
    
    subgraph WebTier[Web Tier]
        Web1[Web Instance 1]
        Web2[Web Instance 2]
        WebN[Web Instance N]
    end
    
    subgraph APITier[API Tier]
        API1[API Instance 1]
        API2[API Instance 2]
        API3[API Instance 3]
    end
    
    subgraph AgentTier[Agent Workers]
        Agent1[Worker 1]
        Agent2[Worker 2]
        Agent3[Worker 3]
        AgentN[Worker N]
    end
    
    subgraph Cache[Cache Layer]
        RedisCluster[(Redis Cluster)]
    end
    
    subgraph DB[Data Layer]
        PG1[(Primary DB)]
        PG2[(Read Replica)]
        PG3[(Read Replica)]
    end
    
    LB --> Web1
    LB --> Web2
    LB --> WebN
    
    Web1 --> API1
    Web2 --> API2
    WebN --> API3
    
    API1 --> RedisCluster
    API2 --> RedisCluster
    API3 --> RedisCluster
    
    API1 --> Agent1
    API2 --> Agent2
    API3 --> Agent3
    
    Agent1 --> RedisCluster
    Agent2 --> RedisCluster
    
    API1 --> PG1
    API2 --> PG2
    API3 --> PG3
```

### Caching Strategy

The system implements a multi-layer caching strategy:

- **L1 (In-Memory)**: User sessions, tax rates, recent queries - 1 minute TTL, 100MB max
- **L2 (Redis)**: Workflow definitions, RAG query results, document metadata - 1 hour TTL, 10GB max
- **L3 (CDN)**: Frontend assets, uploaded documents, exported reports

### Database Optimization

Key optimization strategies include:

- **Connection Pooling**: Min 5, max 50 connections, 30s idle timeout
- **Vector Indexes**: Using ivfflat with 100 lists for efficient similarity search
- **Read Replicas**: 3 replicas with <100ms replication lag for read-heavy workloads
- **Query Optimization**: Strategic indexes on frequently queried columns (status, client_id, thread_id)

### Agent Execution Optimization

- **Parallel Execution**: Independent nodes run concurrently with max 5 parallel tasks
- **Result Caching**: 24-hour cache for identical agent inputs (excluding sensitive operations)
- **Streaming**: Real-time progress events sent to clients
- **Token Optimization**: Model routing (gpt-4o-mini for classification/queries, gpt-4o for complex analysis)

### Document Processing Optimization

- **GPU-Accelerated OCR**: AWS Textract with async processing
- **Parallel Page Processing**: 4 concurrent pages
- **Async Embeddings**: Background embedding generation with batch processing
- **Storage Optimization**: Gzip compression with lifecycle policies (Standard → Glacier after 90 days)

### RAG Performance Optimization

- **HNSW Algorithm**: Fast approximate nearest neighbor search
- **Hybrid Search**: 30% keyword (BM25) + 70% semantic weighting
- **Cross-Encoder Reranking**: Rerank top 20 results for improved accuracy
- **Query Caching**: 1-hour TTL for common queries

### Auto-Scaling Configuration

```yaml
# API scaling: 2-20 replicas based on CPU (70%) and memory (80%)
# Agent worker scaling: 1-10 replicas based on queue depth (10 tasks per worker)
```

### Monitoring Metrics

Key metrics tracked:

- **API**: Request rate, error rate, latency (p50/p95/p99), saturation
- **Agent**: Workflow throughput, node execution time, tool call latency, token usage
- **RAG**: Query latency, cache hit rate, recall@K
- **Database**: Query latency, connection pool usage, replication lag

### Capacity Planning

| Resource | Estimate |
|----------|----------|
| Concurrent Users | 100 |
| Storage Growth | 100GB/month |
| Vector Storage | 10GB/year |
| API Instances | 4 recommended (2-20) |
| Agent Workers | 4 recommended (1-10) |
| Estimated Monthly Cost | $1,600-7,500 |

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

- [ ] Set up monorepo structure with Turbo
- [ ] Configure PostgreSQL with pgvector
- [ ] Implement basic authentication
- [ ] Create database schema
- [ ] Set up Docker development environment

### Phase 2: Agent Framework (Weeks 5-8)

- [ ] Implement Graph Engine
- [ ] Create base Agent class
- [ ] Build Tool Registry
- [ ] Implement Memory Store
- [ ] Add basic tracing

### Phase 3: RAG System (Weeks 9-12)

- [ ] Build ingestion pipeline
- [ ] Implement semantic chunking
- [ ] Set up vector embeddings
- [ ] Create query pipeline
- [ ] Add citation injection

### Phase 4: Document Intelligence (Weeks 13-16)

- [ ] Build upload handler
- [ ] Implement document classifier
- [ ] Create OCR pipeline
- [ ] Build entity extraction
- [ ] Add validation

### Phase 5: UI/UX (Weeks 17-20)

- [ ] Migrate to Next.js
- [ ] Build dashboard views
- [ ] Create case workspace
- [ ] Implement chat interface
- [ ] Add workflow visualization

### Phase 6: Integration (Weeks 21-24)

- [ ] Connect all components
- [ ] End-to-end workflow testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

---

## Appendix

### A. Environment Variables

```bash
# Application
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taxflow

# Redis
REDIS_URL=redis://localhost:6379

# Storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=taxflow-documents
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# AI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Auth
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Logging
LOG_LEVEL=info
```

### B. Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 16, pgvector |
| Cache | Redis 7 |
| Storage | MinIO (S3-compatible) |
| AI | OpenAI GPT-4o |
| Auth | JWT, bcrypt |
| Container | Docker, Docker Compose |
| Monitoring | OpenTelemetry |

### C. Glossary

| Term | Definition |
|------|------------|
| Agent | An AI component that can execute specific tasks |
| Graph | Directed acyclic graph representing workflow |
| Node | A single step/agent in a workflow |
| Tool | A capability an agent can invoke |
| RAG | Retrieval-Augmented Generation |
| Chunk | A segment of text for embedding |
| Vector | Numerical representation of text |
| Trace | Complete execution history |
| Span | A single operation within a trace |
| Citation | Reference to a source document |

---

*Document Version: 1.0.0*
*Last Updated: 2024*
*Authors: TaxFlow AI Architecture Team*
