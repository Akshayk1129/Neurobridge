import React, { useState, useEffect } from 'react';
import { Microscope, FileText, Lock, Users, ChevronRight, LogOut, AlertOctagon, Activity, ToggleLeft, ToggleRight, Loader } from 'lucide-react';
import { mockUser } from '../utils/mockData';

const Clinician = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [authError, setAuthError] = useState('');

    // Dashboard State
    const [view, setView] = useState('list'); // 'list' | 'detail'
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [rawMode, setRawMode] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (accessCode === 'admin123') {
            setIsAuthenticated(true);
            setAuthError('');
            fetchPatients();
        } else {
            setAuthError('Invalid Access Code');
        }
    };

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { mockApi } = await import('../utils/mockApi');
            const data = await mockApi.getPatients();
            setPatients(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectPatient = async (patient) => {
        setLoading(true);
        setSelectedPatient(patient);
        try {
            const { mockApi } = await import('../utils/mockApi');
            const historyData = await mockApi.getPatientHistory(patient.id);
            setHistory(historyData);
            setView('detail');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setAccessCode('');
        setView('list');
        setSelectedPatient(null);
    };

    // --- LOGIN VIEW ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-primary-50 rounded-full text-primary-600">
                            <Lock className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Clinician Access</h2>
                    <p className="text-center text-slate-500 mb-6">Restricted area for authorized providers only.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Access Code</label>
                            <input
                                type="password"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Enter code (Hint: admin123)"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                            />
                        </div>
                        {authError && <p className="text-red-500 text-sm text-center font-medium">{authError}</p>}
                        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                            Secure Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- PATIENT LIST VIEW ---
    if (view === 'list') {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Patient Roster</h1>
                        <p className="text-slate-500">Select a patient to review usage data.</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader className="animate-spin text-primary-600" /></div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Patient Name</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Age</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Risk Profile</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Last Active</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {patients.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {p.name.charAt(0)}
                                            </div>
                                            {p.name}
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm">{p.age}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                                ${p.risk === 'High' ? 'bg-red-100 text-red-700' :
                                                    p.risk === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'}`}>
                                                {p.risk} Risk
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">{p.lastScreening}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => selectPatient(p)}
                                                className="text-primary-600 font-medium text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                View <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // --- PATIENT DETAIL VIEW (Existing UI Refactored) ---
    const lastSession = history.length > 0 ? history[0] : null;

    return (
        <div className="space-y-6 animate-fade-in-right">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
                <div>
                    <button onClick={() => setView('list')} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-2">
                        &larr; Back to Roster
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{selectedPatient?.name}</h1>
                        <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold">
                            ID: #NB-{selectedPatient?.id}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setRawMode(!rawMode)}>
                        <span className={`text-sm font-medium ${!rawMode ? 'text-white' : 'text-slate-400'}`}>Summary</span>
                        {rawMode ? <ToggleRight className="w-8 h-8 text-primary-400" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                        <span className={`text-sm font-medium ${rawMode ? 'text-white' : 'text-slate-400'}`}>Raw Data</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Evidence Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                            <Microscope className="w-5 h-5 text-primary-600" />
                            {rawMode ? 'Raw Sensor Metadata' : 'AI Evidence Synthesis'}
                        </h3>

                        {lastSession ? (
                            rawMode ? (
                                <div className="font-mono text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                                    <p className="mb-2"><span className="text-blue-600">session_id:</span> "ses_{lastSession.id}"</p>
                                    <p className="mb-2"><span className="text-blue-600">timestamp:</span> "{lastSession.timestamp}"</p>
                                    <p className="mb-2"><span className="text-blue-600">attention_metric:</span> {lastSession.attention_metric}</p>
                                    <p className="mb-2"><span className="text-blue-600">motor_metric:</span> {lastSession.motor_metric}</p>
                                    <p className="mb-2"><span className="text-blue-600">overall_score:</span> {lastSession.overall_score}</p>
                                    <p><span className="text-blue-600">risk_label:</span> "{lastSession.risk_level}"</p>
                                </div>
                            ) : (
                                <div className="prose prose-sm text-slate-600 max-w-none">
                                    <p className="mb-3">
                                        Screening conducted on <strong>{new Date(lastSession.timestamp).toLocaleDateString()}</strong> indicates a <strong>{lastSession.risk_level}</strong> probability of developmental variance.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 marker:text-primary-500">
                                        <li>
                                            <strong>Attention Profile:</strong> Scored {lastSession.attention_metric}%.
                                            {lastSession.attention_metric < 50 ? ' Indicates potential gaze aversion or lack of focus.' : ' Tracking within typical range.'}
                                        </li>
                                        <li>
                                            <strong>Motor Regulation:</strong> Variance index of {lastSession.motor_metric}.
                                            {lastSession.motor_metric > 50 ? ' Repetitive motor patterns detected (e.g. hand-flapping).' : ' No significant motor stereotypies detected.'}
                                        </li>
                                    </ul>
                                </div>
                            )
                        ) : (
                            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                No screening data available for this patient.
                            </div>
                        )}

                        {lastSession && (
                            <div className="mt-6 flex gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="block text-xs text-slate-500 uppercase">Risk Score</span>
                                    <span className="text-xl font-bold text-slate-900">{lastSession.overall_score}/100</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <span className="block text-xs text-slate-500 uppercase">Confidence</span>
                                    <span className="text-xl font-bold text-emerald-600">High</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes Column */}
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
                            Save to Record
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clinician;
