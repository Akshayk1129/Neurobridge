import React from 'react';
import { Users, MessageSquare, BookOpen, Video, Heart } from 'lucide-react';

const Community = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900">Parent Community</h1>
                <p className="text-slate-500 mt-2 text-lg">You are not alone. Connect with other parents, specialists, and resources.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900">Support Groups</h3>
                    <p className="text-sm text-slate-500 mt-2 mb-6">Find local and virtual groups for parents of children with similar profiles.</p>
                    <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 w-full transition-colors">
                        Find a Group
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900">Resource Library</h3>
                    <p className="text-sm text-slate-500 mt-2 mb-6">Curated articles, guides, and activities for home therapy.</p>
                    <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 w-full transition-colors">
                        Browse Library
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900">Expert Webinars</h3>
                    <p className="text-sm text-slate-500 mt-2 mb-6">Live Q&A sessions with child psychologists and therapists.</p>
                    <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 w-full transition-colors">
                        View Schedule
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-slate-400" /> Recent Discussions
                    </h3>
                    <button className="text-primary-600 text-sm font-medium hover:underline">View All</button>
                </div>
                <div>
                    {[
                        { title: "Tips for handling sensory overload at supermarkets?", author: "Sarah M.", replies: 12, time: "2h ago" },
                        { title: "Has anyone tried the new Gaze Therapy module?", author: "David K.", replies: 5, time: "4h ago" },
                        { title: "Celebrating a small win: 1st full sentence!", author: "Emily R.", replies: 24, time: "1d ago", highlight: true },
                    ].map((topic, i) => (
                        <div key={i} className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0 ${topic.highlight ? 'bg-amber-50/50' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-slate-900">{topic.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Posted by <span className="text-slate-700 font-medium">{topic.author}</span> • {topic.time}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400 text-sm">
                                    <MessageSquare className="w-4 h-4" /> {topic.replies}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Community;
