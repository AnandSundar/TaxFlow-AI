import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Info,
  DollarSign,
  Shield,
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { AIInsight, ComplianceFlag, DeductionFound } from '../types/agent';

interface AIInsightsPanelProps {
  insights?: AIInsight[];
  complianceFlags?: ComplianceFlag[];
  deductions?: DeductionFound[];
  isLoading?: boolean;
}

export default function AIInsightsPanel({
  insights = [],
  complianceFlags = [],
  deductions = [],
  isLoading = false
}: AIInsightsPanelProps) {
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'deduction':
        return <DollarSign className="w-4 h-4" />;
      case 'compliance':
        return <Shield className="w-4 h-4" />;
      case 'optimization':
        return <TrendingUp className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'deduction':
        return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'compliance':
        return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'optimization':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'warning':
        return 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getSeverityColor = (severity: ComplianceFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI Insights</h3>
            <p className="text-sm text-slate-500">Analyzing your data...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasInsights = insights.length > 0 || complianceFlags.length > 0 || deductions.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI Insights</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {hasInsights ? `${insights.length + complianceFlags.length + deductions.length} findings` : 'No insights yet'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {/* Deductions Section */}
        {deductions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
              <Target className="w-4 h-4 text-emerald-500" />
              Potential Deductions
            </div>
            {deductions.map((deduction) => (
              <div
                key={deduction.id}
                className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {deduction.name}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                        {deduction.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      {deduction.description}
                    </p>
                    {deduction.amount && (
                      <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        ${deduction.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: formatConfidence(deduction.confidence) }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatConfidence(deduction.confidence)}
                      </span>
                    </div>
                  </div>
                </div>
                {deduction.qualifyingCriteria && deduction.qualifyingCriteria.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Qualifying Criteria:
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {deduction.qualifyingCriteria.slice(0, 2).map((criteria, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Compliance Flags Section */}
        {complianceFlags.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
              <Shield className="w-4 h-4 text-amber-500" />
              Compliance Alerts
            </div>
            {complianceFlags.map((flag) => (
              <div
                key={flag.id}
                className={`p-4 rounded-xl border ${
                  flag.resolved
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                    : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(flag.severity)} ${flag.resolved ? 'opacity-50' : ''}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${flag.resolved ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {flag.title}
                      </h4>
                      {flag.resolved && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      {flag.description}
                    </p>
                    {flag.regulation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Regulation: {flag.regulation}
                      </p>
                    )}
                    {flag.suggestion && !flag.resolved && (
                      <div className="mt-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                          Suggestion:
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {flag.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* General Insights Section */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
              <Lightbulb className="w-4 h-4 text-indigo-500" />
              Insights
            </div>
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-xl border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
                        {insight.category}
                      </span>
                    </div>
                    <p className="text-sm opacity-80 mb-2">
                      {insight.description}
                    </p>
                    {insight.impact && (
                      <p className="text-xs font-medium">
                        Impact: {insight.impact}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!hasInsights && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No insights available
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Run a workflow to generate AI-powered insights, deductions, and compliance checks.
            </p>
            <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
              Run Analysis
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
