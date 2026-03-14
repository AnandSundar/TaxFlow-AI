import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Paperclip, 
  X, 
  Sparkles,
  Copy,
  Check,
  Trash2,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Wrench,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import type { AgentMessage, ChatSession, ToolCall } from '../types/agent';

interface AIChatProps {
  clientId?: number;
  session?: ChatSession;
  onSendMessage?: (message: string) => void;
  isStreaming?: boolean;
  streamingContent?: string;
  onRetry?: (messageId: string) => void;
  errorMessage?: string | null;
}

export default function AIChat({ 
  clientId,
  session, 
  onSendMessage, 
  isStreaming = false, 
  streamingContent = '',
  onRetry,
  errorMessage = null
}: AIChatProps) {
  const [messages, setMessages] = useState<AgentMessage[]>(session?.messages || []);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedToolCalls, setExpandedToolCalls] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (session?.messages) {
      setMessages(session.messages);
    }
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    onSendMessage?.(userMessage.content);
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  const handleRetry = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && onRetry) {
      onRetry(messageId);
    }
  };

  const toggleToolCallExpand = (toolCallId: string) => {
    setExpandedToolCalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolCallId)) {
        newSet.delete(toolCallId);
      } else {
        newSet.add(toolCallId);
      }
      return newSet;
    });
  };

  const getToolIcon = (toolName: string) => {
    const lowerName = toolName.toLowerCase();
    if (lowerName.includes('document') || lowerName.includes('file') || lowerName.includes('pdf')) {
      return <FileText className="w-3.5 h-3.5" />;
    }
    if (lowerName.includes('search') || lowerName.includes('lookup') || lowerName.includes('tax')) {
      return <Search className="w-3.5 h-3.5" />;
    }
    return <Wrench className="w-3.5 h-3.5" />;
  };

  const getToolStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'executing':
        return <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const displayMessages = isStreaming && streamingContent
    ? [...messages, {
        id: 'streaming',
        role: 'assistant' as const,
        content: streamingContent,
        timestamp: new Date().toISOString(),
        thinking: 'Analyzing your request and generating response...'
      }]
    : messages;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              TaxFlow AI Assistant
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3 h-3" />
                Pro
              </span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Always ready to help with tax questions</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-3 px-6 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">{errorMessage}</p>
          <button
            onClick={() => handleRetry('error')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300 bg-white dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Start a conversation
            </h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              Ask me anything about tax deductions, compliance, or document analysis. 
              I can help you process documents and find tax-saving opportunities.
            </p>
          </div>
        ) : (
          displayMessages.map((message) => {
            const hasFailedToolCall = message.toolCalls?.some(tc => tc.status === 'failed');
            return (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : hasFailedToolCall
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                ) : hasFailedToolCall ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`flex-1 max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                {message.thinking && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {message.thinking}
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                }`}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          table: ({ children }) => <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">{children}</table></div>,
                          thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>,
                          th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-2 text-sm">{children}</td>,
                          code: ({ children }) => <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">{children}</code>,
                          pre: ({ children }) => <pre className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg overflow-x-auto text-xs">{children}</pre>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>
                {message.role === 'assistant' && (
                  <>
                    {/* Tool Calls Display */}
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <Wrench className="w-3.5 h-3.5" />
                          Tools Used ({message.toolCalls.length})
                        </div>
                        <div className="space-y-1.5">
                          {message.toolCalls.map((toolCall) => (
                            <div 
                              key={toolCall.id}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                            >
                              <button
                                onClick={() => toggleToolCallExpand(toolCall.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                              >
                                {getToolIcon(toolCall.toolName)}
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">
                                  {toolCall.toolName}
                                </span>
                                {getToolStatusIcon(toolCall.status)}
                              </button>
                              {expandedToolCalls.has(toolCall.id) && (
                                <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                                  {toolCall.status === 'failed' && toolCall.error && (
                                    <div className="mb-2 p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
                                      <div className="font-medium flex items-center gap-1 mb-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Error
                                      </div>
                                      {toolCall.error}
                                    </div>
                                  )}
                                  {toolCall.arguments && Object.keys(toolCall.arguments).length > 0 && (
                                    <div className="mb-2">
                                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Arguments</div>
                                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-x-auto">
                                        {JSON.stringify(toolCall.arguments, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {toolCall.result && (
                                    <div>
                                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Result</div>
                                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-x-auto max-h-32">
                                        {typeof toolCall.result === 'string' 
                                          ? toolCall.result 
                                          : JSON.stringify(toolCall.result, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {/* Error state with retry button */}
                      {(message.toolCalls?.some(tc => tc.status === 'failed') || message.id === 'error') && (
                        <button
                          onClick={() => handleRetry(message.id)}
                          className="p-1.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Retry"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );})
        )}
        {isStreaming && !streamingContent && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about taxes, deductions, or document analysis..."
              className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/25 disabled:shadow-none"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-2 text-center">
          AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
