import React, { useState } from 'react';
import { Microscope, FileText, Plus, ClipboardCheck, AlertOctagon, ToggleLeft, ToggleRight, Eye, Activity } from 'lucide-react';
import { mockUser } from '../utils/mockData';

const Clinician = () => {
    const [notes, setNotes] = useState('');
    const [rawMode, setRawMode] = useState(false);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Mode Switcher */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-start shadow-md">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">Patient Review: {mockUser.childName}</h1>
                        <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold">
                            ID: #NB-2024-884
                        </span>
                    </div>
                    <p className="text-slate-400">Review AI-generated evidence and finalize assessment.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRawMode(!rawMode)}>
                        <span className={`text-sm font-medium ${!rawMode ? 'text-white' : 'text-slate-400'}`}>Summary View</span>
                        {rawMode ? <ToggleRight className="w-8 h-8 text-primary-400" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                        <span className={`text-sm font-medium ${rawMode ? 'text-white' : 'text-slate-400'}`}>Raw Data Mode</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                        Finalize Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Evidence Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Summary Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                            <Microscope className="w-5 h-5 text-primary-600" />
                            {rawMode ? 'Raw Sensor Metadata' : 'AI Evidence Synthesis'}
                        </h3>

                        {rawMode ? (
                            <div className="font-mono text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                                <p className="mb-2"><span className="text-blue-600">session_id:</span> "ses_8923"</p>
                                <p className="mb-2"><span className="text-blue-600">dur_ms:</span> 45200</p>
                                <p className="mb-2"><span className="text-blue-600">avg_gaze_confidence:</span> 0.94</p>
                                <p className="mb-2"><span className="text-blue-600">motor_variance_series:</span> [0.02, 0.45, 0.12, 0.88...]</p>
                                <p className="mb-2"><span className="text-blue-600">face_loss_events:</span> 0</p>
                                <p><span className="text-blue-600">model_version:</span> "v2.1-cpu"</p>
                            </div>
                        ) : (
                            <div className="prose prose-sm text-slate-600 max-w-none">
                                <p className="mb-3">
                                    Screening conducted on <strong>{mockUser.lastScreeningDate}</strong> indicates a high probability of developmental variance consistent with early ASD markers.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 marker:text-primary-500">
                                    <li><strong>Gaze Aversion:</strong> Subject averted gaze in 85% of social prompts.</li>
                                    <li><strong>Repetitive Motor Patterns:</strong> Detected hand-flapping (confidence 92%) during excitement phases.</li>
                                </ul>
                            </div>
                        )}

                        <div className="mt-6 flex gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="block text-xs text-slate-500 uppercase">ADOS Module 2 Est.</span>
                                <span className="text-xl font-bold text-slate-900">{rawMode ? '14.2 (±1.5)' : '14'}</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="block text-xs text-slate-500 uppercase">Confidence</span>
                                <span className="text-xl font-bold text-emerald-600">{rawMode ? 'p < 0.05' : 'High'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Visualization Placeholder */}
                    {rawMode && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-slate-500" /> Signal Telemetry
                            </h3>
                            <div className="h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                                [Raw Signal Visualization Would Render Here]
                            </div>
                        </div>
                    )}
                </div>

                {/* Clinician Actions Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                            <FileText className="w-5 h-5 text-primary-600" /> Clinical Notes
                        </h3>
                        <textarea
                            className="w-full h-40 p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none bg-slate-50"
                            placeholder="Add your observations..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                        <button className="w-full mt-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2 rounded-lg text-sm transition-colors">
                            Save Draft
                        </button>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                        <AlertOctagon className="w-5 h-5 text-amber-600 mt-0.5" />
                        <p className="text-xs text-amber-900">
                            <strong>Disclaimer:</strong> This is a decision support tool. Final diagnosis must be made by a licensed professional.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clinician;
