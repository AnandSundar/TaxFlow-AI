import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  Bot,
  GitBranch,
  MessageSquare,
  Lightbulb,
  FileSearch,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Activity,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Client {
  id: number;
  name: string;
  email?: string;
}

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  selectedClientId?: number | null;
  onClientSelect?: (clientId: number | null) => void;
}

export default function Sidebar({ currentView, onNavigate, selectedClientId, onClientSelect }: SidebarProps) {
  const [aiExpanded, setAiExpanded] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const isAIFeature = ['ai-chat', 'ai-insights', 'workflows', 'executions', 'document-viewer'].includes(currentView);

  useEffect(() => {
    if (isAIFeature) {
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => setClients(data))
        .catch(err => console.error('Failed to fetch clients:', err));
    }
  }, [currentView, isAIFeature]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleAIFeatureClick = (viewId: string) => {
    if (isAIFeature && !selectedClientId) {
      setShowClientDropdown(true);
    }
    onNavigate(viewId);
  };

  const handleClientSelectFromDropdown = (clientId: number) => {
    if (onClientSelect) {
      onClientSelect(clientId);
    }
    setShowClientDropdown(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const aiNavItems = [
    { id: 'ai-chat', label: 'AI Assistant', icon: MessageSquare, badge: 'Pro' },
    { id: 'ai-insights', label: 'AI Insights', icon: Lightbulb, badge: '3' },
    { id: 'workflows', label: 'Workflows', icon: GitBranch },
    { id: 'executions', label: 'Agent Runs', icon: Activity },
    { id: 'document-viewer', label: 'Document Viewer', icon: FileSearch },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          TaxFlow AI
        </h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Section */}
        <div className="mb-6">
          <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Client Selector for AI Features */}
        {isAIFeature && (
          <div className="mb-4 px-4">
            <div className="relative">
              <button
                onClick={() => setShowClientDropdown(!showClientDropdown)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all ${
                  selectedClientId 
                    ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                    : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium truncate">
                    {selectedClient?.name || 'Select Client'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showClientDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {clients.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-400">No clients found</div>
                  ) : (
                    clients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelectFromDropdown(client.id)}
                        className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{client.name}</div>
                          {client.email && (
                            <div className="text-xs text-slate-400 truncate">{client.email}</div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedClientId && (
              <button
                onClick={() => onClientSelect?.(null)}
                className="mt-2 text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1"
              >
                Clear selection
              </button>
            )}
          </div>
        )}

        {/* AI Section */}
        <div className="mb-6">
          <button
            onClick={() => setAiExpanded(!aiExpanded)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300"
          >
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Features
            </span>
            {aiExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {aiExpanded && (
            <div className="mt-2 space-y-1">
              {aiNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAIFeatureClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
            currentView === 'settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        
        {/* User */}
        <div className="mt-4 flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-slate-400 truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
