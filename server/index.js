import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- ROUTES ---

import { analyzeHeatmap } from './visionModel.js';

// ... (previous imports)

// --- ROUTES ---

// Get current user profile (Demo: assumes single user ID 1)
app.get('/api/user', (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
        // Get last screening date
        const lastScreening = db.prepare('SELECT timestamp FROM screenings WHERE user_id = 1 ORDER BY id DESC LIMIT 1').get();

        res.json({
            ...user,
            lastScreeningDate: lastScreening ? new Date(lastScreening.timestamp).toLocaleDateString() : 'Never',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Model Inference Endpoint
app.post('/api/model_infer', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: 'Image data required' });

        const result = await analyzeHeatmap(image);
        res.json(result);
    } catch (error) {
        console.error("Model Inference Error:", error);
        res.status(500).json({ error: "Inference Failed" });
    }
});

// Save a new screening session
app.post('/api/screenings', (req, res) => {
    const {
        visionScore, // raw metric if used
        eegScore,    // simulated
        attentionMetric,
        motorMetric,
        visionProbability // NEW from model
    } = req.body;

    // ENSEMBLE LOGIC
    // final_score = 0.45 * vision_probability + 0.35 * attention_score + 0.20 * motor_score
    // Normalize metrics to 0-100 scale for consistency

    const vProbScore = (visionProbability || 0) * 100; // 0.7 -> 70

    // We treat "Score" in DB as "Risk Score"? Or "Health Score"?
    // User Prompt: "Output: a probability score (0–1) representing behavioral risk pattern"
    // So High Prob = High Risk.

    // Attention Score: Usually Higher is Better (Good attention). 
    // Motor Variance: Higher is Worse (Dysregulation).

    // Let's standardize on "Risk Score" (Higher = More concern)
    // Vision (Prob): 0.8 -> 80 Risk
    // Attention: 20% score -> 80 Risk (100 - Att)
    // Motor: 80 Variance -> 80 Risk

    const riskFromVision = vProbScore;
    const riskFromAtt = 100 - (attentionMetric || 50);
    const riskFromMotor = Math.min(100, (motorMetric || 0));

    const finalScore = Math.round(
        (riskFromVision * 0.45) +
        (riskFromAtt * 0.35) +
        (riskFromMotor * 0.20)
    );

    let riskLevel = 'Low';
    if (finalScore > 40) riskLevel = 'Medium';
    if (finalScore > 70) riskLevel = 'High';

    try {
        const stmt = db.prepare(`
      INSERT INTO screenings (
          user_id, 
          overall_score, 
          risk_level, 
          vision_score, 
          vision_probability,
          eeg_score, 
          attention_metric, 
          motor_metric
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        // Mapping: vision_score in DB preserved as raw metric if needed, or just map vProbScore
        const info = stmt.run(
            1,
            finalScore,
            riskLevel,
            vProbScore,
            visionProbability,
            eegScore,
            attentionMetric,
            motorMetric
        );

        res.json({
            success: true,
            id: info.lastInsertRowid,
            riskLevel,
            overallScore: finalScore,
            breakdown: {
                vision: riskFromVision,
                attention: riskFromAtt,
                motor: riskFromMotor
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Progress Data with Trend Analysis
app.get('/api/progress', (req, res) => {
    try {
        const rows = db.prepare(`
      SELECT *
      FROM screenings 
      WHERE user_id = 1 
      ORDER BY timestamp ASC 
    `).all(); // Return ALL for frontend filtering

        // Trend Analysis Logic (Real-time calculation)
        let regressionWarning = null;
        let attentionTrend = "Stable";

        if (rows.length >= 3) {
            const last = rows[rows.length - 1];
            const prev3 = rows.slice(Math.max(0, rows.length - 4), rows.length - 1); // Get previous 3 before last

            if (prev3.length > 0) {
                const avgPrevAtt = prev3.reduce((a, b) => a + b.attention_metric, 0) / prev3.length;
                const delta = last.attention_metric - avgPrevAtt;

                if (delta < -15) {
                    regressionWarning = `Attention score dropped by ${Math.abs(Math.round(delta))}% compared to recent average.`;
                    attentionTrend = "declining";
                } else if (delta > 10) {
                    attentionTrend = "improving";
                }
            }
        }

        // Transform for Recharts
        const data = rows.map(row => ({
            date: new Date(row.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            riskScore: row.overall_score,
            attention: row.attention_metric,
            motor: row.motor_metric,
            visionRisk: row.vision_probability ? Math.round(row.vision_probability * 100) : 0
        }));

        res.json({
            data,
            trends: {
                regressionWarning,
                attentionTrend
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});
