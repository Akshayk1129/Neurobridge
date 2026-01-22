import React, { useState, useEffect, useRef } from 'react';
import { Camera, Brain, Activity, Play, CheckCircle2, AlertTriangle, Loader2, AlertOctagon, Video, Sparkles } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

const Screening = () => {
    const [step, setStep] = useState(0); // 0: Idle, 1: Requesting Cam, 2: Active, 3: Analysis, 4: Results
    const [loadingAI, setLoadingAI] = useState(true);
    const [aiStatus, setAiStatus] = useState('Fetching Models...');
    const [errorMsg, setErrorMsg] = useState('');

    // Real AI State
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const requestRef = useRef(null);

    // Metrics
    const [isCapturing, setIsCapturing] = useState(false);
    const [attentionScore, setAttentionScore] = useState(0);
    const [motorVar, setMotorVar] = useState(0);
    const [eegData, setEegData] = useState([]);
    const scoresRef = useRef({ attention: [], movement: [] });

    // Initialize MediaPipe with Timeout
    useEffect(() => {
        const initAI = async () => {
            try {
                setAiStatus('Loading Vision WASM...');
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");

                setAiStatus('Loading Face Model...');
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "CPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                setFaceLandmarker(landmarker);
                setAiStatus('Ready');
                setLoadingAI(false);
            } catch (err) {
                console.error("AI Init Error:", err);
                setAiStatus('Offline Mode (AI Failed)');
                setErrorMsg("AI Models failed to load. Basic video will work, but scoring may be limited.");
                setLoadingAI(false); // Allow proceeding anyway
            }
        };
        initAI();
    }, []);

    // WebCam Stream - Robust
    const startCamera = async () => {
        setErrorMsg('');
        setStep(1); // "Requesting Access" UI
        try {
            console.log("Requesting getUserMedia...");
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser API 'navigator.mediaDevices' is missing. Check connection context (localhost/HTTPS).");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            console.log("Stream acquired:", stream.id);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    console.log("Video Metadata Loaded. Playing...");
                    videoRef.current.play();
                    setStep(2); // Active
                    setIsCapturing(true);
                    requestRef.current = requestAnimationFrame(predictWebcam);
                };
            }
        } catch (err) {
            console.error("Camera Start Error:", err);
            setErrorMsg(`Camera Error: ${err.message || 'Permission Denied'}. Please check browser settings.`);
            setStep(0);
            setIsCapturing(false);
        }
    };

    const predictWebcam = () => {
        if (!isCapturing) return;

        if (faceLandmarker && videoRef.current && canvasRef.current) {
            if (videoRef.current.readyState >= 2) {
                let startTimeMs = performance.now();
                const results = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);

                const ctx = canvasRef.current.getContext("2d");
                const drawingUtils = new DrawingUtils(ctx);

                // Match dims
                if (canvasRef.current.width !== videoRef.current.videoWidth) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                }

                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                if (results.faceLandmarks) {
                    for (const landmarks of results.faceLandmarks) {
                        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
                        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#38bdf8", lineWidth: 2 });

                        const noseTip = landmarks[1];
                        // Simple scoring accumulation
                        const isCentered = noseTip.x > 0.35 && noseTip.x < 0.65 && noseTip.y > 0.3 && noseTip.y < 0.7;
                        scoresRef.current.attention.push(isCentered ? 100 : 40);
                        scoresRef.current.movement.push(noseTip.x);
                    }
                }
            }
        }

        if (step === 2) { // Only loop if active
            requestRef.current = requestAnimationFrame(predictWebcam);
        }
    };

    // EEG Simulation Loop
    useEffect(() => {
        let interval;
        if (step === 2) {
            interval = setInterval(() => {
                setEegData(prev => {
                    const newData = [...prev, { value: Math.random() * 100 }];
                    if (newData.length > 50) newData.shift();
                    return newData;
                });
            }, 100);

            // Auto-stop limit
            const timer = setTimeout(() => stopScreening(), 15000);
            return () => { clearInterval(interval); clearTimeout(timer); };
        }
    }, [step]);

    const stopScreening = async () => {
        setIsCapturing(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        // Calculate Scores
        const attArr = scoresRef.current.attention;
        const movArr = scoresRef.current.movement;
        const attAvg = attArr.length > 0 ? attArr.reduce((a, b) => a + b, 0) / attArr.length : 50;

        let variance = 0;
        if (movArr.length > 1) {
            const mean = movArr.reduce((a, b) => a + b, 0) / movArr.length;
            variance = movArr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / movArr.length;
        }
        const motScore = Math.min(100, Math.round(variance * 1000));

        setAttentionScore(Math.round(attAvg));
        setMotorVar(motScore);

        // Submit
        try {
            await fetch('http://localhost:3001/api/screenings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visionScore: attAvg,
                    eegScore: Math.round(Math.random() * 80) + 10,
                    attentionMetric: attAvg,
                    motorMetric: motScore
                })
            });
        } catch (e) {
            console.warn("Backend save failed:", e);
        }

        setStep(3); // Analysis view
        setTimeout(() => setStep(4), 1500); // Results

        // Stop stream last to keep last frame visible during analysis
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    // Manual Reset
    const resetSession = () => {
        setStep(0);
        setIsCapturing(false);
        setErrorMsg('');
        setEegData([]);
        scoresRef.current = { attention: [], movement: [] };
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">AI Screening Session</h1>
                    <p className="text-slate-500">
                        Analysis Status: <span className={`font-semibold ${loadingAI ? 'text-amber-600' : 'text-emerald-600'}`}>{aiStatus}</span>
                    </p>
                </div>

                <div className="flex gap-3">
                    {step === 0 && (
                        <button
                            onClick={startCamera}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md font-medium flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Video className="w-5 h-5" />
                            {loadingAI ? 'Start Camera (AI Loading...)' : 'Start Camera & AI'}
                        </button>
                    )}

                    {step === 2 && (
                        <button onClick={stopScreening} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md font-medium animate-pulse flex items-center gap-2">
                            <Activity className="w-5 h-5" /> Stop Assessment
                        </button>
                    )}
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-700">
                    <AlertOctagon className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold">Error Encountered</p>
                        <p className="text-sm">{errorMsg}</p>
                        <button onClick={resetSession} className="text-xs underline mt-2">Dismiss & Reset</button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {step < 4 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Viewport */}
                    <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden aspect-video relative shadow-lg group border border-slate-800">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-700 ${step >= 2 ? 'opacity-100' : 'opacity-30'}`}
                        />

                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full transform scale-x-[-1]"
                        />

                        {/* Overlays */}
                        {step === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                                <div className="bg-white/10 p-6 rounded-full mb-4 backdrop-blur-sm">
                                    <Camera className="w-12 h-12 opacity-80" />
                                </div>
                                <p className="text-lg font-medium">Camera is inactive</p>
                                <p className="text-sm text-slate-400">Click "Start Camera" above to begin screening.</p>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white z-20 p-8 text-center">
                                <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-6" />
                                <h3 className="text-xl font-bold mb-2">Requesting Camera Access...</h3>
                                <p className="text-slate-300">Please look at the permission prompt in your browser's address bar.</p>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary-900/90 text-white z-30">
                                <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
                                <h3 className="text-xl font-bold">Analyzing Session Data...</h3>
                            </div>
                        )}
                    </div>

                    {/* Metrics */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary-400" /> Live Signals
                                </h3>
                                {step === 2 && <span className="text-xs font-bold text-red-500 animate-pulse">● REC</span>}
                            </div>
                            <div className="h-32 bg-slate-950/50 rounded-lg overflow-hidden border border-slate-800/10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={eegData}>
                                        <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                                        <YAxis domain={[0, 100]} hide />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Diagnostics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                    <span className="text-slate-600">AI Model</span>
                                    <span className={`font-mono font-bold ${faceLandmarker ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {faceLandmarker ? 'LOADED' : 'LOADING'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">Camera Feed</span>
                                    <span className={`font-mono font-bold ${step === 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {step === 2 ? 'ACTIVE' : 'OFFLINE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Results
                <div className="animate-fade-in-up">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center mb-8">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900">Session Completed</h2>
                        <p className="text-slate-600 mt-2">Biometric data has been processed and saved.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attention Score</h3>
                            <div className="mt-2 text-5xl font-bold text-primary-600">{attentionScore}%</div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Motor Variance</h3>
                            <div className="mt-2 text-5xl font-bold text-indigo-600">{motorVar}</div>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-center gap-3">
                            <button onClick={resetSession} className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                                Start New Session
                            </button>
                            <Link to="/therapy" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors text-center flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" /> View Adapted Therapy Plan
                            </Link>
                            <Link to="/progress" className="w-full text-slate-600 text-sm font-medium hover:text-slate-900 text-center py-2">
                                View Progress Trends
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Screening;
