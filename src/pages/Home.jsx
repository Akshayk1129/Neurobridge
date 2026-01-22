import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Calendar, Users, ArrowRight, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Home = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('../utils/mockApi').then(({ mockApi }) => {
            mockApi.getUser()
                .then(data => {
                    setUser(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        });
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-primary-600 w-10 h-10" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back, Sarah</h1>
                    <p className="text-slate-500 mt-1">Here's "{user.name}'s" developmental overview.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Last Screening: {user.lastScreeningDate}</span>
                    <Link to="/screening" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" />
                        Start New Screening
                    </Link>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Risk Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Status</h3>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-slate-900">Active</span>
                                <p className="text-sm text-slate-500">Monitoring Progress</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Therapy Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Next Step</h3>
                        <div className="mt-4">
                            <h4 className="text-lg font-semibold text-slate-900 line-clamp-2">Speech Therapy</h4>
                            <p className="text-slate-500 mt-1 text-sm">Focus: Vocabulary Building</p>
                        </div>
                    </div>
                    <Link to="/therapy" className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
                        View Therapy Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center gap-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</h3>
                    <Link to="/progress" className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <TrendingUp className="w-4 h-4" /> View Detailed Reports
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
