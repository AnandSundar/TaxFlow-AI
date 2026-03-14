/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientDetail from './components/ClientDetail';
import ClientsView from './components/ClientsView';
import DocumentsView from './components/DocumentsView';
import AIChat from './components/AIChat';
import AIInsightsPanel from './components/AIInsightsPanel';
import WorkflowTimeline from './components/WorkflowTimeline';
import AgentExecutionView from './components/AgentExecutionView';
import DocumentViewer from './components/DocumentViewer';
import { MessageSquare, Lightbulb, GitBranch, Activity, FileSearch } from 'lucide-react';

type View = 
  | 'dashboard' 
  | 'clients' 
  | 'documents' 
  | 'client' 
  | 'ai-chat'
  | 'ai-insights'
  | 'workflows'
  | 'executions'
  | 'document-viewer'
  | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const handleClientSelect = (id: number) => {
    setSelectedClientId(id);
    setCurrentView('client');
  };

  const handleAddClient = async (name: string, email: string) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (res.ok) {
      const newClient = await res.json();
      handleClientSelect(newClient.id);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedClientId(null);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view: string) => {
    // Don't clear selectedClientId for AI features - keep it so the feature knows which client
    const aiFeatures = ['ai-chat', 'ai-insights', 'workflows', 'executions', 'document-viewer'];
    if (!aiFeatures.includes(view)) {
      setSelectedClientId(null);
    }
    setCurrentView(view as View);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSelectClient={handleClientSelect} onAddClient={handleAddClient} />;
      case 'clients':
        return <ClientsView onSelectClient={handleClientSelect} onAddClient={handleAddClient} />;
      case 'documents':
        return <DocumentsView />;
      case 'client':
        return <ClientDetail clientId={selectedClientId!} onBack={handleBackToDashboard} />;
      case 'ai-chat':
        if (!selectedClientId) {
          return (
            <div className="max-w-6xl mx-auto">
              <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-600 mb-2">Select a Client</h2>
                  <p className="text-slate-400">Please select a client from the sidebar to use the AI Assistant</p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Assistant</h1>
              <p className="text-slate-500 mt-2">Chat with TaxFlow AI to analyze documents, find deductions, and get tax advice.</p>
            </header>
            <div className="h-[calc(100vh-200px)]">
              <AIChat clientId={selectedClientId} />
            </div>
          </div>
        );
      case 'ai-insights':
        if (!selectedClientId) {
          return (
            <div className="max-w-6xl mx-auto">
              <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center">
                  <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-600 mb-2">Select a Client</h2>
                  <p className="text-slate-400">Please select a client from the sidebar to view AI Insights</p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Insights</h1>
              <p className="text-slate-500 mt-2">View AI-generated insights, deductions, and compliance alerts.</p>
            </header>
            <AIInsightsPanel
              clientId={selectedClientId}
            />
          </div>
        );
      case 'workflows':
        if (!selectedClientId) {
          return (
            <div className="max-w-6xl mx-auto">
              <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center">
                  <GitBranch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-600 mb-2">Select a Client</h2>
                  <p className="text-slate-400">Please select a client from the sidebar to view Workflows</p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Workflows</h1>
              <p className="text-slate-500 mt-2">Manage and run AI-powered tax analysis workflows.</p>
            </header>
            <WorkflowTimeline
              clientId={selectedClientId}
            />
          </div>
        );
      case 'executions':
        if (!selectedClientId) {
          return (
            <div className="max-w-6xl mx-auto">
              <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-600 mb-2">Select a Client</h2>
                  <p className="text-slate-400">Please select a client from the sidebar to view Agent Executions</p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Agent Executions</h1>
              <p className="text-slate-500 mt-2">View detailed agent reasoning and tool usage.</p>
            </header>
            <AgentExecutionView
              clientId={selectedClientId}
            />
          </div>
        );
      case 'document-viewer':
        if (!selectedClientId) {
          return (
            <div className="max-w-6xl mx-auto">
              <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center">
                  <FileSearch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-600 mb-2">Select a Client</h2>
                  <p className="text-slate-400">Please select a client from the sidebar to view Documents</p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Document Viewer</h1>
              <p className="text-slate-500 mt-2">View and annotate tax documents.</p>
            </header>
            <div className="h-[calc(100vh-200px)]">
              <DocumentViewer
                documentName="John_Smith_W2_2024.pdf"
                documentType="pdf"
              />
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
              <p className="text-slate-500 mt-2">Configure your TaxFlow AI preferences.</p>
            </header>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <p className="text-slate-500">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard onSelectClient={handleClientSelect} onAddClient={handleAddClient} />;
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-100">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} selectedClientId={selectedClientId} onClientSelect={setSelectedClientId} />
      <main className="flex-1 ml-64 p-8">
        {renderView()}
      </main>
    </div>
  );
}
