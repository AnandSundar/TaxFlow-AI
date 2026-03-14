import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Circle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Bot,
  FileText,
  Brain,
  Shield,
  Lightbulb,
  FileCheck,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { WorkflowExecution, TimelineEvent, WorkflowNodeType } from '../types/workflow';
import type { AgentExecution, AgentStep, AgentStatus } from '../types/agent';

interface WorkflowTimelineProps {
  clientId?: number;
  execution?: WorkflowExecution | AgentExecution;
  events?: TimelineEvent[];
  isLoading?: boolean;
}

export default function WorkflowTimeline({ 
  clientId,
  execution: initialExecution, 
  events = [], 
  isLoading: initialLoading = false 
}: WorkflowTimelineProps) {
  const [execution, setExecution] = useState<WorkflowExecution | AgentExecution | undefined>(initialExecution);
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    // Update current time every second for elapsed time display
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchWorkflowData();
    }
  }, [clientId]);

  const fetchWorkflowData = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        const workflow = data.workflow;
        
        if (workflow) {
          // Convert database workflow to execution format
          const executionData: AgentExecution = {
            id: `workflow-${workflow.id}`,
            agentType: 'Tax Review',
            status: mapWorkflowStatus(workflow.status),
            createdAt: new Date().toISOString(),
            duration: undefined,
            steps: generateWorkflowSteps(workflow),
            metadata: {
              summary: workflow.summary,
              notes: workflow.notes,
              estimatedIncome: workflow.estimated_income,
              estimatedDeductions: workflow.estimated_deductions,
              nextSteps: workflow.next_steps
            }
          };
          setExecution(executionData);
        }
      }
    } catch (error) {
      console.error('Error fetching workflow data:', error);
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

  const generateWorkflowSteps = (workflow: any): AgentStep[] => {
    const steps: AgentStep[] = [
      {
        id: '1',
        name: 'Document Intelligence',
        description: 'Analyzing uploaded documents',
        status: 'completed',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3000000).toISOString(),
        duration: 600000,
        toolCalls: []
      },
      {
        id: '2',
        name: 'Financial Extraction',
        description: 'Extracting financial data from documents',
        status: 'completed',
        startedAt: new Date(Date.now() - 3000000).toISOString(),
        completedAt: new Date(Date.now() - 2400000).toISOString(),
        duration: 600000,
        toolCalls: []
      },
      {
        id: '3',
        name: 'Tax Knowledge',
        description: 'Applying tax regulations and rules',
        status: 'completed',
        startedAt: new Date(Date.now() - 2400000).toISOString(),
        completedAt: new Date(Date.now() - 1800000).toISOString(),
        duration: 600000,
        toolCalls: []
      },
      {
        id: '4',
        name: 'Deduction Discovery',
        description: 'Finding eligible tax deductions',
        status: workflow.status === 'Pending' ? 'pending' : 'completed',
        startedAt: workflow.status !== 'Pending' ? new Date(Date.now() - 1800000).toISOString() : undefined,
        completedAt: workflow.status !== 'Pending' ? new Date(Date.now() - 1200000).toISOString() : undefined,
        duration: workflow.status !== 'Pending' ? 600000 : undefined,
        toolCalls: []
      },
      {
        id: '5',
        name: 'Compliance Check',
        description: 'Verifying tax compliance',
        status: workflow.status === 'Pending' ? 'pending' : 'completed',
        startedAt: workflow.status !== 'Pending' ? new Date(Date.now() - 1200000).toISOString() : undefined,
        completedAt: workflow.status !== 'Pending' ? new Date(Date.now() - 600000).toISOString() : undefined,
        duration: workflow.status !== 'Pending' ? 600000 : undefined,
        toolCalls: []
      },
      {
        id: '6',
        name: 'Summary Generator',
        description: 'Creating final summary report',
        status: workflow.status === 'Pending' ? 'pending' : 'completed',
        startedAt: workflow.status !== 'Pending' ? new Date(Date.now() - 600000).toISOString() : undefined,
        completedAt: workflow.status !== 'Pending' ? new Date().toISOString() : undefined,
        duration: workflow.status !== 'Pending' ? 600000 : undefined,
        toolCalls: [],
        reasoning: workflow.summary || undefined
      }
    ];
    return steps;
  };
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    setIsPaused(false);
    // Reset execution state if needed - this would typically call an API
    console.log('Restart workflow');
  }, []);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'document-intelligence':
        return <FileText className="w-4 h-4" />;
      case 'financial-extraction':
        return <Brain className="w-4 h-4" />;
      case 'tax-knowledge':
        return <Lightbulb className="w-4 h-4" />;
      case 'deduction-discovery':
        return <Sparkles className="w-4 h-4" />;
      case 'compliance-check':
        return <Shield className="w-4 h-4" />;
      case 'summary-generator':
        return <FileCheck className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
      case 'skipped':
        return <Circle className="w-5 h-5 text-slate-400" />;
      default:
        return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStepStatus = (step: AgentStep) => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'failed') return 'failed';
    if (step.status === 'running') return 'running';
    if (step.status === 'skipped') return 'skipped';
    return 'pending';
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatElapsedTime = (startTime?: string, endTime?: string) => {
    if (!startTime) return '';
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : currentTime;
    const elapsed = end - start;
    
    if (elapsed < 0) return '';
    if (elapsed < 1000) return `${elapsed}ms`;
    if (elapsed < 60000) return `${Math.floor(elapsed / 1000)}s`;
    
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const steps = 'steps' in (execution || {}) ? (execution as AgentExecution).steps : [];
  const nodes = 'nodes' in (execution || {}) ? (execution as WorkflowExecution).nodes : [];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Workflow Progress</h3>
            <p className="text-sm text-slate-500">Loading execution details...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!execution && events.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Workflow Progress</h3>
            <p className="text-sm text-slate-500">No active execution</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Ready to execute
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Start a workflow to see the execution progress here.
          </p>
        </div>
      </div>
    );
  }

  const isWorkflowExecution = (exec: any): exec is WorkflowExecution => {
    return 'progress' in exec && 'nodes' in exec;
  };

  const progress = isWorkflowExecution(execution) ? execution.progress : 0;
  const currentNode = isWorkflowExecution(execution) ? execution.currentNode : undefined;
  const status = execution?.status || 'idle';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Agent Execution</h3>
            <p className="text-sm text-slate-500">
              {status === 'running' ? 'Executing workflow...' : 
               status === 'completed' ? 'Completed successfully' :
               status === 'failed' ? 'Execution failed' : 'Ready'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'running' ? (
            <button 
              onClick={isPaused ? handleResume : handlePause}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          ) : (
            <button 
              onClick={handleRestart}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'running' && (
        <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {progress}% Complete
            </span>
            <span className="text-sm text-slate-500">
              {currentNode || 'Processing...'}
            </span>
          </div>
          <div className="w-full h-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
        {steps.length > 0 ? (
          steps.map((step, index) => {
            const isExpanded = expandedSteps.has(step.id);
            const stepStatus = getStepStatus(step);
            
            return (
              <div
                key={step.id}
                className={`rounded-xl border transition-colors ${
                  stepStatus === 'completed' 
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' 
                    : stepStatus === 'failed'
                    ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                    : stepStatus === 'running'
                    ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                }`}
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className="flex flex-col items-center">
                    {getStatusIcon(stepStatus)}
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-6 mt-1 ${
                        stepStatus === 'completed' ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        stepStatus === 'pending' ? 'text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {step.name}
                      </h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        stepStatus === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' :
                        stepStatus === 'failed' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                        stepStatus === 'running' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {stepStatus === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                        {stepStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                      {step.startedAt && (
                        <span className="font-mono">
                          {formatTime(step.startedAt)}
                        </span>
                      )}
                      {stepStatus === 'running' && step.startedAt && (
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {formatElapsedTime(step.startedAt, step.completedAt)}
                        </span>
                      )}
                      <span className="font-mono">
                        {formatDuration(step.duration)}
                      </span>
                      {(step.toolCalls && step.toolCalls.length > 0) || step.reasoning ? (
                        isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                      ) : null}
                    </div>
                </button>

                {/* Expanded Step Details */}
                {(isExpanded || (step.reasoning && step.toolCalls?.length === 0)) && (
                  <div className="px-4 pb-4 ml-9 space-y-2">
                    {step.reasoning && (
                      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                          Reasoning:
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {step.reasoning}
                        </p>
                      </div>
                    )}
                    {step.toolCalls && step.toolCalls.length > 0 && (
                      <div className="space-y-2">
                        {step.toolCalls.map((toolCall) => (
                          <div
                            key={toolCall.id}
                            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {toolCall.toolName}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDuration(toolCall.duration)}
                              </span>
                            </div>
                            <div className="relative">
                              <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-x-auto max-h-48">
                                {JSON.stringify(toolCall.arguments, null, 2)}
                              </pre>
                              <button
                                onClick={() => copyToClipboard(JSON.stringify(toolCall.arguments, null, 2), `args-${toolCall.id}`)}
                                className="absolute top-2 right-2 p-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                title="Copy arguments"
                              >
                                {copiedId === `args-${toolCall.id}` ? 
                                  <Check className="w-3 h-3 text-emerald-500" /> : 
                                  <Copy className="w-3 h-3 text-slate-500" />
                                }
                              </button>
                            </div>
                            {toolCall.result && (
                              <div className="relative mt-2">
                                <pre className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded overflow-x-auto max-h-48">
                                  {JSON.stringify(toolCall.result, null, 2)}
                                </pre>
                                <button
                                  onClick={() => copyToClipboard(JSON.stringify(toolCall.result, null, 2), `result-${toolCall.id}`)}
                                  className="absolute top-2 right-2 p-1 rounded bg-emerald-200 dark:bg-emerald-800 hover:bg-emerald-300 dark:hover:bg-emerald-700 transition-colors"
                                  title="Copy result"
                                >
                                  {copiedId === `result-${toolCall.id}` ? 
                                    <Check className="w-3 h-3 text-emerald-600" /> : 
                                    <Copy className="w-3 h-3 text-emerald-600" />
                                  }
                                </button>
                              </div>
                            )}
                            {toolCall.error && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                Error: {toolCall.error}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : events.length > 0 ? (
          events.map((event, index) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'error' ? 'bg-red-500' :
                  event.type === 'step_complete' ? 'bg-emerald-500' :
                  event.type === 'step_fail' ? 'bg-red-500' :
                  event.type === 'step_start' ? 'bg-indigo-500' :
                  'bg-slate-400'
                }`} />
                {index < events.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-slate-900 dark:text-white">
                  {event.message}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatTime(event.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            No execution steps to display
          </div>
        )}
      </div>

      {/* Footer */}
      {execution && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-slate-500">
                Started: {execution.startedAt ? formatTime(execution.startedAt) : '-'}
              </span>
              <span className="text-slate-500">
                Duration: {formatDuration(execution.duration)}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' :
              status === 'failed' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
              status === 'running' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' :
              'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
              {status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
