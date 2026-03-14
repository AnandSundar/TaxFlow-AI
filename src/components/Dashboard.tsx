import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  X,
  TrendingUp,
  DollarSign,
  Bot,
  Activity,
  ArrowRight,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Play,
  BarChart3
} from 'lucide-react';
import AIChat from './AIChat';
import AIInsightsPanel from './AIInsightsPanel';
import WorkflowTimeline from './WorkflowTimeline';

interface Client {
  id: number;
  name: string;
  email: string;
  status: string;
}

interface DashboardStats {
  totalClients: number;
  inProgress: number;
  reviewReady: number;
  totalDocuments: number;
  aiInsights: number;
  activeWorkflows: number;
}

export default function Dashboard({ onSelectClient, onAddClient }: { onSelectClient: (id: number) => void; onAddClient: (name: string, email: string) => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    inProgress: 0,
    reviewReady: 0,
    totalDocuments: 0,
    aiInsights: 0,
    activeWorkflows: 0
  });
  const [recentActivity, setRecentActivity] = useState<{id: string; action: string; time: string; type: string}[]>([]);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setStats(prev => ({
          ...prev,
          totalClients: data.length,
          inProgress: data.filter((c: Client) => c.status === 'In Progress').length,
          reviewReady: data.filter((c: Client) => c.status === 'Review Ready').length
        }));
        setLoading(false);
      });

    // Simulated activity data
    setRecentActivity([
      { id: '1', action: 'AI analyzed W-2 document for John Smith', time: '2 min ago', type: 'ai' },
      { id: '2', action: 'New client Jane Doe added', time: '15 min ago', type: 'client' },
      { id: '3', action: 'Compliance check completed for Acme Corp', time: '1 hour ago', type: 'compliance' },
      { id: '4', action: 'Deduction found: Home Office Expenses', time: '2 hours ago', type: 'deduction' },
    ]);
  }, []);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim()) {
      onAddClient(newClientName, newClientEmail);
      setShowModal(false);
      setNewClientName('');
      setNewClientEmail('');
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendUp,
    color 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ElementType; 
    trend?: string;
    trendUp?: boolean;
    color: string;
  }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 ${!trendUp ? 'rotate-180' : ''}`} />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              Dashboard
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-4 h-4" />
                AI Powered
              </span>
            </h1>
            <p className="text-slate-500 mt-2">Welcome back. Here's an overview of your tax practice.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
            <Play className="w-4 h-4" />
            Run AI Analysis
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          trend="+12%"
          trendUp
          color="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Documents Processed"
          value={stats.totalDocuments}
          icon={FileText}
          trend="+24%"
          trendUp
          color="bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="AI Insights Generated"
          value={stats.aiInsights}
          icon={Lightbulb}
          trend="+18%"
          trendUp
          color="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Active Workflows"
          value={stats.activeWorkflows}
          icon={Activity}
          color="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* AI Chat */}
        <div className="lg:col-span-2">
          <AIChat />
        </div>
        
        {/* AI Insights */}
        <div>
          <AIInsightsPanel
            insights={[
              { id: '1', type: 'deduction', title: 'Home Office Deduction', description: 'Potential deduction of up to $1,500 for home office expenses', confidence: 0.92, category: 'Deduction', createdAt: new Date().toISOString() },
              { id: '2', type: 'warning', title: 'Missing 1099-NEC', description: 'Client has not provided 1099-NEC for contractor payments', confidence: 0.85, category: 'Compliance', createdAt: new Date().toISOString() },
              { id: '3', type: 'optimization', title: 'Retirement Contribution', description: 'Client may benefit from maximizing IRA contributions', confidence: 0.78, category: 'Optimization', createdAt: new Date().toISOString() },
            ]}
            complianceFlags={[
              { id: '1', severity: 'high', title: 'Missing W-2', description: 'W-2 form not received for 2024', resolved: false },
              { id: '2', severity: 'medium', title: 'Estimated Tax', description: 'Q4 estimated tax payment may be due', resolved: false },
            ]}
            deductions={[
              { id: '1', name: 'Home Office Deduction', category: 'Business Expenses', amount: 1500, description: 'Qualified home office space', confidence: 0.92, qualifyingCriteria: ['Exclusive use of space', 'Regular basis for business'] },
            ]}
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Workflow */}
        <div className="lg:col-span-2">
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
                { id: '1', name: 'Document Intelligence', description: 'Analyzing uploaded documents', status: 'completed', startedAt: new Date(Date.now() - 280000).toISOString(), completedAt: new Date(Date.now() - 240000).toISOString(), duration: 40000, toolCalls: [], reasoning: 'Extracted 5 documents with high confidence scores' },
                { id: '2', name: 'Financial Extraction', description: 'Extracting financial data', status: 'completed', startedAt: new Date(Date.now() - 240000).toISOString(), completedAt: new Date(Date.now() - 180000).toISOString(), duration: 60000, toolCalls: [], reasoning: 'Found 12 line items across all documents' },
                { id: '3', name: 'Tax Knowledge', description: 'Applying tax regulations', status: 'completed', startedAt: new Date(Date.now() - 180000).toISOString(), completedAt: new Date(Date.now() - 120000).toISOString(), duration: 60000, toolCalls: [], reasoning: 'Applied 2024 tax brackets and deductions' },
                { id: '4', name: 'Deduction Discovery', description: 'Finding potential deductions', status: 'running', startedAt: new Date(Date.now() - 120000).toISOString(), toolCalls: [], reasoning: 'Analyzing expense patterns...' },
                { id: '5', name: 'Compliance Check', description: 'Verifying compliance', status: 'pending', toolCalls: [] },
                { id: '6', name: 'Summary Generator', description: 'Generating final summary', status: 'pending', toolCalls: [] },
              ],
              metadata: {}
            }}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Recent Activity
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'ai' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' :
                  activity.type === 'deduction' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' :
                  activity.type === 'compliance' ? 'bg-amber-50 dark:bg-amber-950 text-amber-600' :
                  'bg-blue-50 dark:bg-blue-950 text-blue-600'
                }`}>
                  {activity.type === 'ai' ? <Bot className="w-4 h-4" /> :
                   activity.type === 'deduction' ? <DollarSign className="w-4 h-4" /> :
                   activity.type === 'compliance' ? <AlertTriangle className="w-4 h-4" /> :
                   <Users className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
              View All Activity →
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Cases</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
          >
            New Client
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Client Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">AI Analysis</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading clients...</td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => onSelectClient(client.id)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{client.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{client.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        client.status === 'New' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                        client.status === 'In Progress' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Analyzed
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onSelectClient(client.id)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm flex items-center gap-1 ml-auto"
                      >
                        View Case
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Client</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddClient}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
