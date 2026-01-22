import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, ArrowUpRight, Loader } from 'lucide-react';

const Progress = () => {
    const [data, setData] = useState([]);
    const [trends, setTrends] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/progress')
            .then(res => res.json())
            .then(payload => {
                // Support both old array format (fallback) and new object format
                if (Array.isArray(payload)) {
                    setData(payload);
                } else {
                    setData(payload.data);
                    setTrends(payload.trends);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader className="animate-spin text-primary-600 w-8 h-8" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Developmental Progress</h1>
                    <p className="text-slate-500">Tracking long-term trends and gaps (Real-time DB).</p>
                </div>
            </div>

            {/* Regression Alert Banner (Dynamic from Backend) */}
            {trends && trends.regressionWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-900">Trend Alert: Regression Detected</h3>
                        <p className="text-sm text-amber-800 mt-1">
                            {trends.regressionWarning}
                        </p>
                    </div>
                </div>
            )}

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Developmental Domains Overview</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMotor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="riskScore" name="Overall Score" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRisk)" />
                            <Area type="monotone" dataKey="motor" name="Motor Skills" stroke="#14b8a6" fillOpacity={1} fill="url(#colorMotor)" />
                            <Area type="monotone" dataKey="attention" name="Attention" stroke="#8b5cf6" fillOpacity={0} strokeDasharray="5 5" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        Latest Stats <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">Live</span>
                    </h4>
                    <div className="space-y-4">
                        {[
                            { label: "Total Sessions", value: data.length, trend: "+1" },
                            { label: "Avg Attention", value: data.length > 0 ? Math.round(data.reduce((a, b) => a + b.attention, 0) / data.length) + '%' : 'N/A', trend: trends && trends.attentionTrend || "Stable" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <span className="text-slate-600 text-sm">{item.label}</span>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900">{item.value}</p>
                                    <p className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                                        <ArrowUpRight className="w-3 h-3" /> {item.trend}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress;
