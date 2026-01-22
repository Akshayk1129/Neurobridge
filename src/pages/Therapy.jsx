import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Sparkles, MessageCircle, Activity, UserCog, Loader, AlertTriangle, ArrowUpCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const Therapy = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completedGoals, setCompletedGoals] = useState({});
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        import('../utils/mockApi').then(({ mockApi }) => {
            mockApi.getProgress()
                .then(response => {
                    setData(response.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        });
    }, []);

    const toggleGoal = (goalId) => {
        setCompletedGoals(prev => ({
            ...prev,
            [goalId]: !prev[goalId]
        }));
    };

    const toggleExplain = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader className="animate-spin text-primary-600" /></div>;

    // --- DYNAMIC RULE ENGINE ---
    const lastSession = data.length > 0 ? data[data.length - 1] : null;

    const generateGoals = (category, score, visionScore = 0) => {
        // Logic Matrix for Generated Content
        if (category === 'attention') {
            // VISION AI OVERRIDE: If Vision Risk is High (>60), enforce Eye Contact goals regardless of attention score
            if (visionScore > 60) return [
                { id: 'vis_1', text: 'Face-to-face engagement (Gaze Training)', type: 'Vision AI Priority' },
                { id: 'vis_2', text: 'Track high-contrast objects', type: 'Vision AI Priority' },
                { id: 'att_4', text: 'Maintain eye contact during request (5s)', type: 'Social' }
            ];

            if (score < 40) return [
                { id: 'att_1', text: 'Response to name call (3/5 trials)', type: 'Foundational' },
                { id: 'att_2', text: 'Track moving object (visual pursuit)', type: 'Sensory' },
                { id: 'att_3', text: 'Single-step command ("Give ball")', type: 'Receptive' }
            ];
            if (score < 70) return [
                { id: 'att_4', text: 'Maintain eye contact during request (5s)', type: 'Social' },
                { id: 'att_5', text: 'Turn-taking game (rolling ball)', type: 'Social' },
                { id: 'att_6', text: 'Sort objects by color (sustained attention)', type: 'Cognitive' }
            ];
            return [ // High Score
                { id: 'att_7', text: 'Complex puzzle completion (20+ pieces)', type: 'Cognitive' },
                { id: 'att_8', text: 'Story sequencing (3-card logic)', type: 'Language' },
                { id: 'att_9', text: 'Identify emotions in pictures', type: 'Social' }
            ];
        }
        if (category === 'motor') {
            if (score > 60) return [ // High Variance = Dysregulated
                { id: 'mot_1', text: 'Heavy work: Wall push-ups', type: 'Proprioceptive' },
                { id: 'mot_2', text: 'Deep pressure massage (calming)', type: 'Sensory' },
                { id: 'mot_3', text: 'Animal walks (Bear/Crab walk)', type: 'Gross Motor' }
            ];
            return [ // Low Variance = Stable
                { id: 'mot_4', text: 'Stringing beads (Fine motor)', type: 'Fine Motor' },
                { id: 'mot_5', text: 'Pincer grasp tracing', type: 'Precision' },
                { id: 'mot_6', text: 'Buttoning/Zipping practice', type: 'Self-Help' }
            ];
        }
        return [];
    };

    // Default values if no data
    const attentionScore = lastSession ? lastSession.attention : 50;
    const motorScore = lastSession ? lastSession.motor : 20;
    const visionRisk = lastSession ? (lastSession.visionRisk || 0) : 0;

    // Generate Dynamic Plans
    const speechGoals = generateGoals('attention', attentionScore, visionRisk);
    const motorGoals = generateGoals('motor', motorScore);

    // Calculate Completion
    const totalToday = speechGoals.length + motorGoals.length;
    const completedToday = Object.keys(completedGoals).filter(k => completedGoals[k]).length;
    const progress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    const dynamicPlans = [
        {
            id: 'speech',
            title: visionRisk > 60 ? 'Social & Gaze Adaptation' : 'Communication & Focus',
            provider: 'Dr. Sarah Miller',
            icon: visionRisk > 60 ? UserCog : MessageCircle, // Change icon based on AI
            color: 'bg-blue-50 text-blue-600 border-blue-100',
            goals: speechGoals,
            insight: visionRisk > 60
                ? `Updated due to increased gaze irregularity (${visionRisk}% risk) detected in last screening. Prioritizing social visuals.`
                : attentionScore < 40
                    ? "Attention score is low (<40%). Focusing on foundational orientation and response."
                    : "Attention is developing. Working on sustained interaction duration.",
            priority: visionRisk > 60 ? 1 : (attentionScore < 50 ? 2 : 3)
        },
        {
            id: 'motor',
            title: 'Motor & Regulation',
            provider: 'Mike Ross OT',
            icon: Activity,
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            goals: motorGoals,
            insight: motorScore > 60
                ? "High motor variance indicated dysregulation. Plan updated to focus on calming/grounding tasks."
                : "Motor control is stable. Plan updated to focus on fine precision skills.",
            priority: motorScore > 70 ? 2 : 3
        }
    ].sort((a, b) => a.priority - b.priority);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with Dynamic Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Adaptive Therapy Plan</h1>
                    {lastSession ? (
                        <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            Generated based on screening from <strong>{lastSession.date}</strong>
                        </p>
                    ) : (
                        <p className="text-slate-500">Standard Plan (No AI Data available).</p>
                    )}
                </div>

                {/* Weekly Progress Widget */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-4 shadow-sm w-full md:w-auto">
                    <div className="flex-1 md:w-48">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                            <span>Today's Targets</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {!lastSession && (
                <div className="bg-amber-50 text-amber-900 p-4 rounded-xl flex items-center gap-3 border border-amber-100">
                    <AlertTriangle className="w-5 h-5" />
                    <p>No screening data found. Complete a screening to get AI-driven adjustments.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {dynamicPlans.map((plan) => (
                    <div key={plan.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all ${plan.priority === 1 ? 'border-primary-200 ring-4 ring-primary-50/50' : 'border-slate-100'}`}>
                        <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${plan.color}`}>
                                    <plan.icon className="w-6 h-6" />
                                </div>
                                {plan.priority === 1 && (
                                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <ArrowUpCircle className="w-3 h-3" /> TOP PRIORITY
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.title}</h3>
                            <p className="text-sm text-slate-500 mb-6">{plan.provider}</p>

                            <div className="space-y-3">
                                {plan.goals.map((goal) => (
                                    <div
                                        key={goal.id}
                                        onClick={() => toggleGoal(goal.id)}
                                        className="flex items-start gap-3 group cursor-pointer select-none p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all duration-200
                                            ${completedGoals[goal.id] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-primary-400'}`}>
                                            {completedGoals[goal.id] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-sm font-medium transition-colors ${completedGoals[goal.id] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {goal.text}
                                            </span>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                                                    {goal.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Explainable AI Section */}
                        <div className="bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => toggleExplain(plan.id)}
                                className="w-full flex items-center justify-between p-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-purple-500" />
                                    WHY THIS PLAN?
                                </span>
                                {expandedCard === plan.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {expandedCard === plan.id && (
                                <div className="px-4 pb-4 animate-fade-in text-sm text-slate-600 leading-relaxed">
                                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                        <p>{plan.insight}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Therapy;
