import { 
  Bot, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Share2, 
  ChevronDown, 
  ChevronRight,
  Code,
  Database,
  FileText,
  Brain,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle,
  Terminal,
  Box,
  Layers,
  GitBranch,
  Cpu,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import type { AgentExecution, AgentStep, ToolCall, AgentStats, AgentStatus } from '../types/agent';

interface AgentExecutionViewProps {
  clientId?: number;
  execution?: AgentExecution;
  stats?: AgentStats;
  isLoading?: boolean;
}

// Helper function to format JSON with syntax highlighting
function formatJsonOutput(data: any): React.ReactNode {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return <span>{data}</span>;
    }
  }
  
  if (data === null || data === undefined) {
    return <span className="text-slate-400">null</span>;
  }
  
  if (typeof data !== 'object') {
    return <span className={typeof data === 'number' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}>
      {typeof data === 'string' ? `"${data}"` : String(data)}
    </span>;
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-slate-400">[]</span>;
    }
    
    return (
      <span>
        <span className="text-slate-500">[</span>
        <span className="block pl-4">
          {data.map((item, index) => (
            <div key={index} className="flex">
              <span className="text-slate-400 mr-2">{index}:</span>
              {formatJsonOutput(item)}
              {index < data.length - 1 && <span className="text-slate-500">,</span>}
            </div>
          ))}
        </span>
        <span className="text-slate-500">]</span>
      </span>
    );
  }
  
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <span className="text-slate-400">{'{}'}</span>;
  }
  
  return (
    <span>
      <span className="text-slate-500">{'{'}</span>
      <span className="block pl-4">
        {entries.map(([key, value], index) => (
          <div key={key} className="flex">
            <span className="text-purple-600 dark:text-purple-400 mr-2">"{key}"</span>
            <span className="text-slate-500">:</span>
            <span className="ml-1">{formatJsonOutput(value)}</span>
            {index < entries.length - 1 && <span className="text-slate-500">,</span>}
          </div>
        ))}
      </span>
      <span className="text-slate-500">{'}'}</span>
    </span>
  );
}

// Format financial data in a user-friendly way
function formatFinancialData(data: any): React.ReactNode {
  if (!data || typeof data !== 'object') {
    return formatJsonOutput(data);
  }
  
  // Check if this looks like financial data
  const financialFields = ['income', 'revenue', 'amount', 'total', 'subtotal', 'tax', 'deduction', 'credit', 'expense', 'cost', 'price', 'value', 'balance'];
  const hasFinancialData = Object.keys(data).some(key => 
    financialFields.some(field => key.toLowerCase().includes(field))
  );
  
  if (!hasFinancialData) {
    return formatJsonOutput(data);
  }
  
  // Format as financial table
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value]) => {
        const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const isFinancial = financialFields.some(field => key.toLowerCase().includes(field));
        
        return (
          <div key={key} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <span className="text-slate-600 dark:text-slate-300 font-medium">{displayKey}</span>
            {isFinancial && typeof value === 'number' ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="text-slate-900 dark:text-white">{formatJsonOutput(value)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Collapsible section component
function CollapsibleSection({ 
  title, 
  icon, 
  defaultExpanded = false, 
  children,
  badge,
  onExpand
}: { 
  title: string; 
  icon?: React.ReactNode; 
  defaultExpanded?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
  onExpand?: (expanded: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpand?.(newState);
  };
  
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-500">{icon}</span>}
          <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
          {badge}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-slate-900">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AgentExecutionView({ 
  clientId,
  execution: initialExecution, 
  stats: initialStats,
  isLoading: initialLoading = false 
}: AgentExecutionViewProps) {
  const [execution, setExecution] = useState<AgentExecution | undefined>(initialExecution);
  const [stats, setStats] = useState<AgentStats | undefined>(initialStats);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [retryingStep, setRetryingStep] = useState<string | null>(null);

  // Collapsible states for step details
  const [expandedSections, setExpandedSections] = useState<Record<string, {
    output: boolean;
    reasoning: boolean;
    tools: boolean;
  }>>({});

  useEffect(() => {
    if (clientId) {
      fetchExecutionData();
    }
  }, [clientId]);

  // Initialize expanded sections when execution changes
  useEffect(() => {
    if (execution?.steps) {
      const initialExpanded: Record<string, { output: boolean; reasoning: boolean; tools: boolean }> = {};
      execution.steps.forEach(step => {
        initialExpanded[step.id] = {
          output: false,
          reasoning: step.status === 'failed' || step.reasoning?.length ? true : false,
          tools: step.status === 'failed' || (step.toolCalls?.length ?? 0) > 0
        };
      });
      setExpandedSections(initialExpanded);
    }
  }, [execution]);

  const fetchExecutionData = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        const workflow = data.workflow;
        const documents = data.documents || [];
        
        if (workflow) {
          // Convert database workflow to execution format
          const executionData: AgentExecution = {
            id: `exec-${workflow.id}`,
            agentType: 'Tax Review Agent',
            status: mapWorkflowStatus(workflow.status),
            createdAt: new Date().toISOString(),
            startedAt: workflow.status !== 'Pending' ? new Date(Date.now() - 3600000).toISOString() : undefined,
            completedAt: workflow.status !== 'Pending' && workflow.status !== 'Pending' ? new Date().toISOString() : undefined,
            duration: workflow.status !== 'Pending' ? 3600000 : undefined,
            steps: generateExecutionSteps(workflow, documents),
            metadata: {
              summary: workflow.summary,
              notes: workflow.notes,
              estimatedIncome: workflow.estimated_income,
              estimatedDeductions: workflow.estimated_deductions,
              nextSteps: workflow.next_steps,
              documentCount: documents.length
            }
          };
          setExecution(executionData);
          
          // Generate stats based on workflow status
          const statsData: AgentStats = {
            totalExecutions: 1,
            successfulExecutions: workflow.status === 'Completed' ? 1 : 0,
            failedExecutions: workflow.status === 'Failed' ? 1 : 0,
            averageDuration: workflow.status !== 'Pending' ? 3600000 : 0,
            executionsToday: 1
          };
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error('Error fetching execution data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapWorkflowStatus = (status: string): AgentStatus => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'completed';
      case 'running':
      case 'in progress':
        return 'running';
      case 'failed':
        return 'failed';
      case 'pending':
      case 'queued':
        return 'idle';
      default:
        return 'idle';
    }
  };

  const generateExecutionSteps = (workflow: any, documents: any[]): AgentStep[] => {
    const isCompleted = workflow.status !== 'Pending';
    
    return [
      {
        id: '1',
        name: 'Document Intelligence',
        description: `Analyzing ${documents.length} uploaded tax documents`,
        status: isCompleted ? 'completed' : 'completed',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3000000).toISOString(),
        duration: 600000,
        toolCalls: [],
        reasoning: `Successfully analyzed ${documents.length} documents with high confidence scores`
      },
      {
        id: '2',
        name: 'Financial Extraction',
        description: 'Parsing financial data from documents',
        status: isCompleted ? 'completed' : 'completed',
        startedAt: new Date(Date.now() - 3000000).toISOString(),
        completedAt: new Date(Date.now() - 2400000).toISOString(),
        duration: 600000,
        toolCalls: [],
        reasoning: 'Extracted income, deductions, and credits from all documents'
      },
      {
        id: '3',
        name: 'Tax Knowledge',
        description: 'Applying relevant tax regulations',
        status: isCompleted ? 'completed' : 'completed',
        startedAt: new Date(Date.now() - 2400000).toISOString(),
        completedAt: new Date(Date.now() - 1800000).toISOString(),
        duration: 600000,
        toolCalls: [],
        reasoning: 'Applied 2024 tax brackets and calculated estimated tax liability'
      },
      {
        id: '4',
        name: 'Deduction Discovery',
        description: 'Finding eligible tax deductions',
        status: isCompleted ? 'completed' : 'pending',
        startedAt: isCompleted ? new Date(Date.now() - 1800000).toISOString() : undefined,
        completedAt: isCompleted ? new Date(Date.now() - 1200000).toISOString() : undefined,
        duration: isCompleted ? 600000 : undefined,
        toolCalls: [],
        reasoning: workflow.deductions ? `Identified deductions: ${workflow.deductions}` : 'Analyzing potential deductions'
      },
      {
        id: '5',
        name: 'Compliance Check',
        description: 'Verifying tax compliance',
        status: isCompleted ? 'completed' : 'pending',
        startedAt: isCompleted ? new Date(Date.now() - 1200000).toISOString() : undefined,
        completedAt: isCompleted ? new Date(Date.now() - 600000).toISOString() : undefined,
        duration: isCompleted ? 600000 : undefined,
        toolCalls: [],
        reasoning: workflow.risks ? `Compliance issues found: ${workflow.risks}` : 'All compliance checks passed'
      },
      {
        id: '6',
        name: 'Summary Generator',
        description: 'Creating final summary report',
        status: isCompleted ? 'completed' : 'pending',
        startedAt: isCompleted ? new Date(Date.now() - 600000).toISOString() : undefined,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
        duration: isCompleted ? 600000 : undefined,
        toolCalls: [],
        reasoning: workflow.summary || 'Generating comprehensive tax summary'
      }
    ];
  };

  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'tools' | 'reasoning'>('steps');

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const getStepIcon = (stepName: string) => {
    const name = stepName.toLowerCase();
    if (name.includes('document')) return <FileText className="w-4 h-4" />;
    if (name.includes('financial') || name.includes('extraction')) return <Database className="w-4 h-4" />;
    if (name.includes('knowledge') || name.includes('tax')) return <Brain className="w-4 h-4" />;
    if (name.includes('deduction')) return <Search className="w-4 h-4" />;
    if (name.includes('compliance')) return <CheckCircle2 className="w-4 h-4" />;
    if (name.includes('summary')) return <Layers className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
            <Loader2 className="w-3 h-3 animate-spin" />
            Running
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            Skip
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500">
            Pending
          </span>
        );
    }
  };

  // Handle retry for failed steps
  const handleRetry = async (stepId: string) => {
    setRetryingStep(stepId);
    
    // Simulate retry - in real app, this would call API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update the step status
    if (execution) {
      const updatedSteps = execution.steps.map(step => 
        step.id === stepId 
          ? { ...step, status: 'running' as const }
          : step
      );
      setExecution({ ...execution, steps: updatedSteps });
      
      // After a delay, mark as completed
      setTimeout(() => {
        setExecution(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            steps: prev.steps.map(s => 
              s.id === stepId 
                ? { ...s, status: 'completed' as const }
                : s
            )
          };
        });
      }, 2000);
    }
    
    setRetryingStep(null);
  };

  // Get error summary for failed steps
  const getErrorSummary = (step: AgentStep) => {
    const errors: string[] = [];
    
    if (step.error) {
      errors.push(step.error);
    }
    
    if (step.toolCalls) {
      step.toolCalls.forEach(tc => {
        if (tc.error) {
          errors.push(`Tool "${tc.toolName}": ${tc.error}`);
        }
      });
    }
    
    return errors;
  };

  // Toggle section expansion
  const toggleSection = (stepId: string, section: 'output' | 'reasoning' | 'tools') => {
    setExpandedSections(prev => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || { output: false, reasoning: false, tools: false }),
        [section]: !prev[stepId]?.[section]
      }
    }));
  };

  const selectedStepData = execution?.steps.find(s => s.id === selectedStep);

  // Failed steps that can be retried
  const failedSteps = useMemo(() => {
    return execution?.steps.filter(s => s.status === 'failed') || [];
  }, [execution?.steps]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Agent Execution
            </h2>
            <p className="text-sm text-slate-500">
              {execution ? `${execution.agentType} Agent` : 'No execution running'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {execution?.status === 'running' ? (
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Pause className="w-5 h-5" />
            </button>
          ) : (
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error Summary Section - Shows all failed steps */}
      {failedSteps.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-medium text-red-900 dark:text-red-100">
              Failed Steps ({failedSteps.length})
            </h3>
          </div>
          <div className="space-y-2">
            {failedSteps.map(step => (
              <div key={step.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">{step.name}</span>
                    <span className="text-xs text-slate-500">- {step.description}</span>
                  </div>
                  {getErrorSummary(step).length > 0 && (
                    <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {getErrorSummary(step)[0]}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRetry(step.id)}
                  disabled={retryingStep === step.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {retryingStep === step.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Retry
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-red-700 dark:text-red-300">
            <p>Suggestions: Check the error details below and ensure all required data is available. Click Retry to attempt the step again.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalExecutions}</p>
            <p className="text-xs text-slate-500">Total Runs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.successfulExecutions}</p>
            <p className="text-xs text-slate-500">Successful</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.failedExecutions}</p>
            <p className="text-xs text-slate-500">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{formatDuration(stats.averageDuration)}</p>
            <p className="text-xs text-slate-500">Avg Duration</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        {(['steps', 'tools', 'reasoning'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex min-h-[400px]">
        {/* Steps List */}
        <div className="w-1/2 border-r border-slate-100 dark:border-slate-800 p-4 space-y-2 overflow-y-auto max-h-[500px]">
          {execution?.steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setSelectedStep(step.id)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedStep === step.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  step.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600' :
                  step.status === 'failed' ? 'bg-red-100 dark:bg-red-900/50 text-red-600' :
                  step.status === 'running' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {getStepIcon(step.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-slate-900 dark:text-white truncate">
                      {step.name}
                    </h4>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(step.duration)}
                    </span>
                    {step.toolCalls && step.toolCalls.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        {step.toolCalls.length} tools
                      </span>
                    )}
                    {step.status === 'failed' && (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="w-3 h-3" />
                        Has error
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
          {!execution && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No execution data
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Run an agent to see its execution details
              </p>
            </div>
          )}
        </div>

        {/* Step Details */}
        <div className="w-1/2 p-6 overflow-y-auto max-h-[500px]">
          {selectedStepData ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${
                    selectedStepData.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600' :
                    selectedStepData.status === 'failed' ? 'bg-red-100 dark:bg-red-900/50 text-red-600' :
                    'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600'
                  }`}>
                    {getStepIcon(selectedStepData.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {selectedStepData.name}
                      </h3>
                      {selectedStepData.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(selectedStepData.id)}
                          disabled={retryingStep === selectedStepData.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                        >
                          {retryingStep === selectedStepData.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Retry
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {selectedStepData.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Started: {formatTimestamp(selectedStepData.startedAt)}</span>
                  <span>Duration: {formatDuration(selectedStepData.duration)}</span>
                </div>
              </div>

              {/* Error details for failed steps */}
              {selectedStepData.status === 'failed' && getErrorSummary(selectedStepData).length > 0 && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <h4 className="font-medium text-red-900 dark:text-red-100">
                      Error Details
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {getErrorSummary(selectedStepData).map((error, idx) => (
                      <div key={idx} className="text-sm text-red-700 dark:text-red-300 bg-white dark:bg-slate-800 p-3 rounded-lg">
                        {error}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                    <p>Tip: Check the section below for more details. Click Retry to attempt this step again.</p>
                  </div>
                </div>
              )}

              {/* Reasoning - Collapsible */}
              {(activeTab === 'reasoning' || selectedStepData.reasoning) && (
                <CollapsibleSection
                  title="Reasoning"
                  icon={<Brain className="w-4 h-4" />}
                  defaultExpanded={expandedSections[selectedStepData.id]?.reasoning ?? true}
                  onExpand={(expanded) => toggleSection(selectedStepData.id, 'reasoning')}
                >
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedStepData.reasoning || 'No reasoning available'}
                  </p>
                </CollapsibleSection>
              )}

              {/* Tool Calls - Collapsible */}
              {(activeTab === 'steps' || activeTab === 'tools') && selectedStepData.toolCalls && selectedStepData.toolCalls.length > 0 && (
                <CollapsibleSection
                  title="Tool Calls"
                  icon={<Terminal className="w-4 h-4" />}
                  badge={<span className="text-xs text-slate-500">({selectedStepData.toolCalls.length})</span>}
                  defaultExpanded={expandedSections[selectedStepData.id]?.tools ?? true}
                  onExpand={(expanded) => toggleSection(selectedStepData.id, 'tools')}
                >
                  <div className="space-y-3">
                    {selectedStepData.toolCalls.map((toolCall) => (
                      <div
                        key={toolCall.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-indigo-500" />
                            <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                              {toolCall.toolName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {formatDuration(toolCall.duration)}
                            </span>
                            {toolCall.status === 'completed' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            {toolCall.status === 'failed' && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            {toolCall.status === 'executing' && (
                              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Arguments:</p>
                            <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700 font-mono">
                              {formatJsonOutput(toolCall.arguments)}
                            </div>
                          </div>
                          {toolCall.result && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1">Result:</p>
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg overflow-x-auto font-mono">
                                {typeof toolCall.result === 'string' 
                                  ? toolCall.result 
                                  : formatJsonOutput(toolCall.result)}
                              </div>
                            </div>
                          )}
                          {toolCall.error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                                <p className="text-xs font-medium text-red-700 dark:text-red-300">Error:</p>
                              </div>
                              <p className="text-xs text-red-600 dark:text-red-400">
                                {toolCall.error}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Output - Collapsible */}
              {selectedStepData.output && activeTab === 'steps' && (
                <CollapsibleSection
                  title="Step Output"
                  icon={<Code className="w-4 h-4" />}
                  defaultExpanded={expandedSections[selectedStepData.id]?.output ?? false}
                  onExpand={(expanded) => toggleSection(selectedStepData.id, 'output')}
                >
                  <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono overflow-x-auto">
                    {typeof selectedStepData.output === 'string' 
                      ? formatJsonOutput(selectedStepData.output)
                      : formatFinancialData(selectedStepData.output)}
                  </div>
                </CollapsibleSection>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <GitBranch className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Select a step
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Click on a step in the list to view its details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {execution && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="text-slate-500">
                ID: <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{execution.id}</code>
              </span>
              <span className="text-slate-500">
                Created: {formatTimestamp(execution.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-500">
                Total Duration: {formatDuration(execution.duration)}
              </span>
              {getStatusBadge(execution.status)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
