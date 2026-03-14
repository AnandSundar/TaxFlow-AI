import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Play, MessageSquare, AlertTriangle, CheckCircle, FileCheck, Trash2, Info, ShieldAlert, Sparkles, TrendingUp, Wallet, ListChecks } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ClientDetailProps {
  clientId: number;
  onBack: () => void;
}

export default function ClientDetail({ clientId, onBack }: ClientDetailProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workflow' | 'documents' | 'chat'>('workflow');
  const [uploading, setUploading] = useState(false);
  const [runningWorkflow, setRunningWorkflow] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = () => {
    fetch(`/api/clients/${clientId}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
        setDeletingId(null); // Reset deleting state on refresh
      });
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i]);
    }

    try {
      await fetch(`/api/clients/${clientId}/documents`, {
        method: 'POST',
        body: formData,
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      // Clear the input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (deletingId !== docId) {
      setDeletingId(docId);
      // Auto-reset after 3 seconds
      setTimeout(() => setDeletingId(prev => prev === docId ? null : prev), 3000);
      return;
    }

    try {
      await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllDocuments = async () => {
    if (!confirm('Are you sure you want to delete ALL documents for this client? This action cannot be undone.')) return;
    try {
      await fetch(`/api/documents?clientId=${clientId}`, {
        method: 'DELETE',
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const clearWorkflow = async () => {
    if (!confirm('Are you sure you want to clear the current analysis?')) return;
    try {
      await fetch(`/api/clients/${clientId}/workflow/clear`, {
        method: 'POST',
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const runWorkflow = async () => {
    setRunningWorkflow(true);
    try {
      await fetch(`/api/clients/${clientId}/workflow/run`, {
        method: 'POST',
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningWorkflow(false);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = chatInput;
    setChatInput('');
    
    // Optimistic update
    setData((prev: any) => ({
      ...prev,
      chat_messages: [...prev.chat_messages, { role: 'user', content: msg }]
    }));

    setChatLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const result = await res.json();
      
      setData((prev: any) => ({
        ...prev,
        chat_messages: [...prev.chat_messages, { role: 'assistant', content: result.reply }]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const formatContent = (content: string | null | undefined) => {
    if (!content) return '';
    try {
      // Check if it's a JSON string
      const trimmed = content.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(item => `- ${typeof item === 'object' ? JSON.stringify(item) : item}`).join('\n');
        }
        if (typeof parsed === 'object' && parsed !== null) {
          return Object.entries(parsed)
            .map(([key, value]) => {
              const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              if (typeof value === 'object' && value !== null) {
                return `**${formattedKey}**:\n${Object.entries(value).map(([sk, sv]) => `  - ${sk}: ${sv}`).join('\n')}`;
              }
              return `**${formattedKey}**: ${value}`;
            })
            .join('\n\n');
        }
      }
    } catch (e) {
      // Not JSON or failed to parse, use as is
    }
    return content;
  };

  if (loading || !data) {
    return <div className="flex items-center justify-center h-full text-slate-500">Loading client data...</div>;
  }

  const { client, documents, workflow, chat_messages } = data;

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            <p className="text-sm text-slate-500">{client.email} â {client.status}</p>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'workflow' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Workflow
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'documents' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Documents
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            AI Assistant
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100">
        
        {/* WORKFLOW TAB */}
        {activeTab === 'workflow' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Tax Analysis</h2>
                <p className="text-slate-500 mt-1">Run the AI agent to analyze documents and extract insights.</p>
              </div>
              <div className="flex gap-2">
                {workflow?.status === 'Completed' && (
                  <button 
                    onClick={clearWorkflow}
                    className="px-4 py-3 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium"
                  >
                    Clear Analysis
                  </button>
                )}
                <button 
                  onClick={runWorkflow}
                  disabled={runningWorkflow || documents.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                {runningWorkflow ? (
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    <span className="text-sm">Analyzing Documents...</span>
                  </div>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Analysis
                  </>
                )}
              </button>
            </div>
          </div>

            {workflow?.status === 'Completed' ? (
              <div className="space-y-8">
                {/* BIG STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estimated Income</p>
                      <p className="text-2xl font-bold text-slate-900">{workflow.estimated_income || 'TBD'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                      <Wallet className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estimated Deductions</p>
                      <p className="text-2xl font-bold text-slate-900">{workflow.estimated_deductions || 'TBD'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-24 h-24 text-indigo-600" />
                  </div>
                  <h3 className="flex items-center gap-3 font-bold text-indigo-900 text-lg mb-4">
                    <FileCheck className="w-6 h-6 text-indigo-500" />
                    Your Financial Year at a Glance
                  </h3>
                  <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
                    <ReactMarkdown>{formatContent(workflow.summary)}</ReactMarkdown>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100 flex flex-col">
                    <h3 className="flex items-center gap-2 font-bold text-emerald-900 mb-4">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Ways to Save (Deductions)
                    </h3>
                    <div className="prose prose-emerald prose-sm max-w-none text-emerald-800 flex-1">
                      <ReactMarkdown>{formatContent(workflow.deductions)}</ReactMarkdown>
                    </div>
                    <div className="mt-4 p-3 bg-emerald-100/50 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      These are potential tax-saving opportunities identified from your documents.
                    </div>
                  </div>
                  
                  <div className="bg-amber-50/40 p-6 rounded-2xl border border-amber-100 flex flex-col">
                    <h3 className="flex items-center gap-2 font-bold text-amber-900 mb-4">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      Things to Watch Out For
                    </h3>
                    <div className="prose prose-amber prose-sm max-w-none text-amber-800 flex-1">
                      <ReactMarkdown>{formatContent(workflow.risks)}</ReactMarkdown>
                    </div>
                    <div className="mt-4 p-3 bg-amber-100/50 rounded-xl text-xs text-amber-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      Addressing these items now can help prevent delays or questions from the IRS.
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 text-lg mb-6">
                    <ListChecks className="w-6 h-6 text-indigo-500" />
                    Recommended Next Steps
                  </h3>
                  <div className="prose prose-slate prose-sm max-w-none text-slate-700">
                    <ReactMarkdown>{formatContent(workflow.next_steps)}</ReactMarkdown>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <button 
                    onClick={(e) => {
                      const target = e.currentTarget.nextElementSibling;
                      if (target) target.classList.toggle('hidden');
                    }}
                    className="flex items-center justify-between w-full font-bold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-400" />
                      Technical Preparer Notes
                    </span>
                    <span className="text-xs font-normal text-slate-400 uppercase tracking-wider">Click to toggle</span>
                  </button>
                  <div className="hidden mt-4 pt-4 border-t border-slate-200 prose prose-slate prose-sm max-w-none text-slate-600">
                    <ReactMarkdown>{workflow.notes}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <FileText className="w-12 h-12 mb-4 text-slate-300" />
                <p>No analysis available yet.</p>
                <p className="text-sm mt-1">Upload documents and run the analysis to see insights.</p>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Client Documents</h2>
                <p className="text-slate-500 mt-1">Upload W-2s, 1099s, receipts, and other financial records.</p>
              </div>
              <div className="flex gap-3">
                {documents.length > 0 && (
                  <button 
                    onClick={handleDeleteAllDocuments}
                    className="flex items-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All
                  </button>
                )}
                <label className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 cursor-pointer transition-all shadow-sm">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} multiple />
                </label>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <Upload className="w-12 h-12 mb-4 text-slate-300" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="p-4 border border-slate-200 rounded-xl flex items-start justify-between gap-4 hover:border-indigo-300 transition-colors bg-slate-50/50 group">
                    <div className="flex items-start gap-4 overflow-hidden">
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                        <FileText className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-slate-900 truncate" title={doc.filename}>{doc.filename}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className={`p-2 rounded-lg transition-all ${
                        deletingId === doc.id 
                          ? 'bg-red-500 text-white' 
                          : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={deletingId === doc.id ? "Confirm Delete" : "Delete document"}
                    >
                      {deletingId === doc.id ? (
                        <span className="text-[10px] font-bold px-1">CONFIRM</span>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                AI Tax Assistant
              </h2>
              <p className="text-xs text-slate-500 mt-1">Ask questions about the client's documents and tax situation.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {chat_messages.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                  <p>No messages yet. Ask a question to get started!</p>
                  <p className="text-sm mt-2">Example: "What are the main sources of income?"</p>
                </div>
              ) : (
                chat_messages.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      <div className="prose prose-sm max-w-none prose-inherit">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm">
                    <p className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={sendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask the AI assistant..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  disabled={chatLoading}
                />
                <button 
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
