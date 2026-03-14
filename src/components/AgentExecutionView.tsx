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
  Cpu
} from 'lucide-react';
import { useState } from 'react';
import type { AgentExecution, AgentStep, ToolCall, AgentStats } from '../types/agent';

interface AgentExecutionViewProps {
  execution?: AgentExecution;
  stats?: AgentStats;
  isLoading?: boolean;
}

export default function AgentExecutionView({ 
  execution, 
  stats,
  isLoading = false 
}: AgentExecutionViewProps) {
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

  const selectedStepData = execution?.steps.find(s => s.id === selectedStep);

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
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedStepData.name}
                    </h3>
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

              {/* Reasoning */}
              {selectedStepData.reasoning && activeTab === 'reasoning' && (
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100">
                      Reasoning
                    </h4>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedStepData.reasoning}
                  </p>
                </div>
              )}

              {/* Tool Calls */}
              {(activeTab === 'steps' || activeTab === 'tools') && selectedStepData.toolCalls && selectedStepData.toolCalls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Tool Calls ({selectedStepData.toolCalls.length})
                    </h4>
                  </div>
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
                          <pre className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700">
                            {JSON.stringify(toolCall.arguments, null, 2)}
                          </pre>
                        </div>
                        {toolCall.result && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Result:</p>
                            <pre className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg overflow-x-auto">
                              {typeof toolCall.result === 'string' 
                                ? toolCall.result 
                                : JSON.stringify(toolCall.result, null, 2)}
                            </pre>
                          </div>
                        )}
                        {toolCall.error && (
                          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Error:</p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {toolCall.error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Output */}
              {selectedStepData.output && activeTab === 'steps' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-4 h-4 text-slate-500" />
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Step Output
                    </h4>
                  </div>
                  <pre className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl overflow-x-auto border border-slate-200 dark:border-slate-700">
                    {typeof selectedStepData.output === 'string' 
                      ? selectedStepData.output 
                      : JSON.stringify(selectedStepData.output, null, 2)}
                  </pre>
                </div>
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
