import React, { useState } from 'react';
import { Shield, Lock, FileCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Consent = () => {
    const [consented, setConsented] = useState(false);

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
            <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-primary-50 text-primary-600 mb-6">
                    <Shield className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Privacy & Consent</h1>
                <p className="text-slate-500 mt-2 text-lg">Your child's data privacy is our highest priority.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 space-y-6">
                    <div className="flex gap-4">
                        <div className="bg-slate-100 p-2 rounded-lg h-fit shrink-0">
                            <Lock className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Data Encryption & Security</h3>
                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                All video and audio data is processed locally whenever possible. Data transmitted to our secure cloud is end-to-end encrypted (AES-256). We comply with HIPAA and GDPR standards for health data protection.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-slate-100 p-2 rounded-lg h-fit shrink-0">
                            <FileCheck className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Purpose of Data Collection</h3>
                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                Collected data is used solely for generating developmental screening assessments and progress reports for your child. Data is never sold to third parties or advertisers.
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900">
                        <strong>Demo Note:</strong> This is a conceptual platform. No actual data is being recorded or processed in this session.
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded border border-slate-300 flex items-center justify-center shrink-0 transition-colors ${consented ? 'bg-primary-600 border-primary-600' : 'bg-white group-hover:border-primary-400'}`}>
                                {consented && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={consented} onChange={(e) => setConsented(e.target.checked)} />
                            <span className="text-slate-700 text-sm select-none">
                                I confirm that I am the legal guardian of the child and I consent to the processing of video/audio data for developmental screening purposes.
                            </span>
                        </label>
                    </div>

                    <div className="pt-4">
                        <Link to="/" className={`block w-full py-3 rounded-xl text-center font-medium transition-all ${consented ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                            {consented ? 'Confirm & Continue to Dashboard' : 'Please Accept to Continue'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Consent;
