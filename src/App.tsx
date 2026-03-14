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
    setSelectedClientId(null);
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
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Assistant</h1>
              <p className="text-slate-500 mt-2">Chat with TaxFlow AI to analyze documents, find deductions, and get tax advice.</p>
            </header>
            <div className="h-[calc(100vh-200px)]">
              <AIChat />
            </div>
          </div>
        );
      case 'ai-insights':
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Insights</h1>
              <p className="text-slate-500 mt-2">View AI-generated insights, deductions, and compliance alerts.</p>
            </header>
            <AIInsightsPanel
              insights={[
                { id: '1', type: 'deduction', title: 'Home Office Deduction', description: 'Potential deduction of up to $1,500 for home office expenses', confidence: 0.92, category: 'Deduction', createdAt: new Date().toISOString() },
                { id: '2', type: 'warning', title: 'Missing 1099-NEC', description: 'Client has not provided 1099-NEC for contractor payments', confidence: 0.85, category: 'Compliance', createdAt: new Date().toISOString() },
                { id: '3', type: 'optimization', title: 'Retirement Contribution', description: 'Client may benefit from maximizing IRA contributions', confidence: 0.78, category: 'Optimization', createdAt: new Date().toISOString() },
              ]}
              complianceFlags={[
                { id: '1', severity: 'high', title: 'Missing W-2', description: 'W-2 form not received for 2024', resolved: false },
                { id: '2', severity: 'medium', title: 'Estimated Tax', description: 'Q4 estimated tax payment may be due', resolved: false },
                { id: '3', severity: 'low', title: 'Charitable Donations', description: 'Consider documenting charitable donations', resolved: false },
              ]}
              deductions={[
                { id: '1', name: 'Home Office Deduction', category: 'Business Expenses', amount: 1500, description: 'Qualified home office space', confidence: 0.92, qualifyingCriteria: ['Exclusive use of space', 'Regular basis for business'] },
                { id: '2', name: 'Vehicle Expense', category: 'Business Expenses', amount: 2800, description: 'Mileage deduction for business travel', confidence: 0.88, qualifyingCriteria: ['Business use > 50%', 'Log of miles maintained'] },
              ]}
            />
          </div>
        );
      case 'workflows':
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Workflows</h1>
              <p className="text-slate-500 mt-2">Manage and run AI-powered tax analysis workflows.</p>
            </header>
            <WorkflowTimeline
              execution={{
                id: 'exec-001',
                agentType: 'Tax Review',
                status: 'running',
                progress: 65,
                currentNode: 'Compliance Check',
                createdAt: new Date().toISOString(),
                startedAt: new Date(Date.now() - 300000).toISOString(),
                duration: 300000,
                steps: [
                  { id: '1', name: 'Document Intelligence', description: 'Analyzing uploaded documents', status: 'completed', startedAt: new Date(Date.now() - 280000).toISOString(), completedAt: new Date(Date.now() - 240000).toISOString(), duration: 40000, toolCalls: [] },
                  { id: '2', name: 'Financial Extraction', description: 'Extracting financial data', status: 'completed', startedAt: new Date(Date.now() - 240000).toISOString(), completedAt: new Date(Date.now() - 180000).toISOString(), duration: 60000, toolCalls: [] },
                  { id: '3', name: 'Tax Knowledge', description: 'Applying tax regulations', status: 'completed', startedAt: new Date(Date.now() - 180000).toISOString(), completedAt: new Date(Date.now() - 120000).toISOString(), duration: 60000, toolCalls: [] },
                  { id: '4', name: 'Deduction Discovery', description: 'Finding potential deductions', status: 'running', startedAt: new Date(Date.now() - 120000).toISOString(), toolCalls: [] },
                  { id: '5', name: 'Compliance Check', description: 'Verifying compliance', status: 'pending', toolCalls: [] },
                  { id: '6', name: 'Summary Generator', description: 'Generating final summary', status: 'pending', toolCalls: [] },
                ],
                metadata: {}
              }}
            />
          </div>
        );
      case 'executions':
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Agent Executions</h1>
              <p className="text-slate-500 mt-2">View detailed agent reasoning and tool usage.</p>
            </header>
            <AgentExecutionView
              execution={{
                id: 'exec-001',
                agentType: 'Tax Review Agent',
                status: 'completed',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                startedAt: new Date(Date.now() - 3500000).toISOString(),
                completedAt: new Date().toISOString(),
                duration: 500000,
                steps: [
                  { id: '1', name: 'Document Intelligence', description: 'Analyzing uploaded tax documents', status: 'completed', startedAt: new Date(Date.now() - 3500000).toISOString(), completedAt: new Date(Date.now() - 3000000).toISOString(), duration: 500000, toolCalls: [{ id: 't1', toolName: 'extract_text', arguments: { documentId: 'doc-001' }, status: 'completed', duration: 450000, result: { text: 'Extracted...', confidence: 0.95 } }], reasoning: 'Successfully extracted text from 5 documents with high confidence scores' },
                  { id: '2', name: 'Financial Extraction', description: 'Parsing financial data from documents', status: 'completed', startedAt: new Date(Date.now() - 3000000).toISOString(), completedAt: new Date(Date.now() - 2400000).toISOString(), duration: 600000, toolCalls: [], reasoning: 'Found 24 line items including income, deductions, and credits' },
                  { id: '3', name: 'Tax Knowledge', description: 'Applying relevant tax regulations', status: 'completed', startedAt: new Date(Date.now() - 2400000).toISOString(), completedAt: new Date(Date.now() - 1800000).toISOString(), duration: 600000, toolCalls: [], reasoning: 'Applied 2024 tax brackets and calculated estimated tax liability' },
                  { id: '4', name: 'Deduction Discovery', description: 'Finding eligible tax deductions', status: 'completed', startedAt: new Date(Date.now() - 1800000).toISOString(), completedAt: new Date(Date.now() - 1200000).toISOString(), duration: 600000, toolCalls: [], reasoning: 'Identified 3 potential deductions totaling $4,800' },
                  { id: '5', name: 'Compliance Check', description: 'Verifying tax compliance', status: 'completed', startedAt: new Date(Date.now() - 1200000).toISOString(), completedAt: new Date(Date.now() - 600000).toISOString(), duration: 600000, toolCalls: [], reasoning: 'All compliance checks passed with no issues' },
                  { id: '6', name: 'Summary Generator', description: 'Creating final summary report', status: 'completed', startedAt: new Date(Date.now() - 600000).toISOString(), completedAt: new Date().toISOString(), duration: 600000, toolCalls: [], reasoning: 'Generated comprehensive tax summary with recommendations' },
                ],
                metadata: {}
              }}
              stats={{
                totalExecutions: 156,
                successfulExecutions: 148,
                failedExecutions: 8,
                averageDuration: 480000,
                executionsToday: 12
              }}
            />
          </div>
        );
      case 'document-viewer':
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
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <main className="flex-1 ml-64 p-8">
        {renderView()}
      </main>
    </div>
  );
}
