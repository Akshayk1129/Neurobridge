import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Sparkles, MessageCircle, Activity, UserCog, Loader, AlertTriangle, ArrowUpCircle } from 'lucide-react';

const Therapy = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('../utils/mockApi').then(({ mockApi }) => {
            mockApi.getProgress()
                .then(response => {
                    setData(response.data); // mockApi returns { data, trends }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        });
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader className="animate-spin text-primary-600" /></div>;

    // RULE ENGINE
    const lastSession = data.length > 0 ? data[data.length - 1] : null; // Progress API returns chronological

    // Logic: Low attention (<50) -> Prioritize Social. High Motor Variance (>50) -> Prioritize Motor.
    const attentionNeedsWork = lastSession && lastSession.attention < 50;
    const motorNeedsWork = lastSession && lastSession.motor > 50;

    const basePlans = [
        {
            id: 'speech',
            title: 'Speech & Language',
            provider: 'Dr. Sarah Miller',
            icon: MessageCircle,
            color: 'bg-blue-50 text-blue-600',
            goals: [
                { id: 'g1', text: 'Respond to name call (3/5 trials)', completed: true },
                { id: 'g2', text: 'Use 2-word phrases ("More juice")', completed: false },
                { id: 'g3', text: 'Imitate animal sounds', completed: false }
            ],
            aiSuggestion: attentionNeedsWork ? "Recent screening shows low attention. Start speech sessions with uniform high-contrast visual aids." : null,
            priority: attentionNeedsWork ? 2 : 1
        },
        {
            id: 'motor',
            title: 'Motor Skills & Regulation',
            provider: 'Mike Ross OT',
            icon: Activity,
            color: 'bg-emerald-50 text-emerald-600',
            goals: [
                { id: 'g4', text: 'Stack 4-block tower', completed: true },
                { id: 'g5', text: 'Pincer grasp training', completed: true },
            ],
            aiSuggestion: motorNeedsWork ? "High motor variance detected. Recommend 'Heavy Work' sensory activities before seated tasks to improve regulation." : "Motor stability is improving. Increase complexity of fine motor tasks.",
            priority: motorNeedsWork ? 3 : 1
        },
        {
            id: 'social',
            title: 'Social Interaction',
            provider: 'Sarah Chen, BCBA',
            icon: UserCog,
            color: 'bg-purple-50 text-purple-600',
            goals: [
                { id: 'g7', text: 'Turn-taking (rolling ball)', completed: false },
                { id: 'g8', text: 'Eye contact during request', completed: false }
            ],
            aiSuggestion: attentionNeedsWork ? "Low eye-contact detected. Focus on face-to-face engagement games." : null,
            priority: attentionNeedsWork ? 3 : 1
        }
    ];

    // Sort by calculated priority (High to Low)
    const sortedPlans = [...basePlans].sort((a, b) => b.priority - a.priority);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Therapy Plan</h1>
                    {lastSession ? (
                        <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            Adapted to Analysis from <strong>{lastSession.date}</strong>
                        </p>
                    ) : (
                        <p className="text-slate-500">Standard Plan (No AI Data available).</p>
                    )}
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm border border-primary-200 px-4 py-2 rounded-lg bg-primary-50">
                    Download Report
                </button>
            </div>

            {!lastSession && (
                <div className="bg-amber-50 text-amber-900 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <p>No screening data found. Complete a screening to get AI-driven adjustments.</p>
                </div>
            )}

            {lastSession && (attentionNeedsWork || motorNeedsWork) && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <ArrowUpCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-900">Plan Updated Automatically</h3>
                        <p className="text-sm text-indigo-800 mt-1">
                            We've re-prioritized <strong>{motorNeedsWork && 'Motor Skills'}{motorNeedsWork && attentionNeedsWork && ' & '}{attentionNeedsWork && 'Social Interaction'}</strong> based on the latest risk markers.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPlans.map((plan) => (
                    <div key={plan.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all ${plan.priority > 1 ? 'border-primary-200 ring-4 ring-primary-50/50' : 'border-slate-100'}`}>
                        <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${plan.color}`}>
                                    <plan.icon className="w-6 h-6" />
                                </div>
                                {plan.priority > 1 && (
                                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                                        PRIORITY FOCUS
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{plan.provider}</p>

                            <div className="space-y-3">
                                {plan.goals.map((goal) => (
                                    <div key={goal.id} className="flex items-start gap-3 group cursor-pointer">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                            ${goal.completed ? 'bg-primary-500 border-primary-500' : 'border-slate-300 group-hover:border-primary-400'}`}>
                                            {goal.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className={`text-sm ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {goal.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {plan.aiSuggestion && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-t border-amber-100">
                                <div className="flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-900">
                                        <span className="font-bold">AI Insight:</span> {plan.aiSuggestion}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Therapy;
