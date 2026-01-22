import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

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

// Save a new screening session
app.post('/api/screenings', (req, res) => {
    const { visionScore, eegScore, attentionMetric, motorMetric } = req.body;

    // Simple Fusion Logic on Server-Side
    // Weighted Average: Vision (60%), EEG (40%) - Demo Logic
    const overallScore = Math.round((visionScore * 0.6) + (eegScore * 0.4));

    let riskLevel = 'Low';
    if (overallScore > 40) riskLevel = 'Medium';
    if (overallScore > 70) riskLevel = 'High';

    try {
        const stmt = db.prepare(`
      INSERT INTO screenings (user_id, overall_score, risk_level, vision_score, eeg_score, attention_metric, motor_metric)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        const info = stmt.run(1, overallScore, riskLevel, visionScore, eegScore, attentionMetric, motorMetric);

        res.json({
            success: true,
            id: info.lastInsertRowid,
            riskLevel,
            overallScore
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Progress Data with Trend Analysis
app.get('/api/progress', (req, res) => {
    try {
        const rows = db.prepare(`
      SELECT 
        id, 
        timestamp, 
        overall_score, 
        attention_metric, 
        motor_metric 
      FROM screenings 
      WHERE user_id = 1 
      ORDER BY timestamp ASC 
      LIMIT 20
    `).all();

        // Trend Analysis Logic (Real-time calculation)
        let regressionWarning = null;
        let attentionTrend = "Stable";

        if (rows.length >= 3) {
            const last = rows[rows.length - 1];
            const prev3 = rows.slice(-4, -1); // Get previous 3 before last

            if (prev3.length > 0) {
                const avgPrevAtt = prev3.reduce((a, b) => a + b.attention_metric, 0) / prev3.length;
                const delta = last.attention_metric - avgPrevAtt;

                if (delta < -15) {
                    regressionWarning = `Attention score dropped by ${Math.abs(Math.round(delta))}% compared to recent average.`;
                    attentionTrend = " declining";
                } else if (delta > 10) {
                    attentionTrend = " improving";
                }
            }
        }

        // Transform for Recharts
        const data = rows.map(row => ({
            date: new Date(row.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            riskScore: row.overall_score,
            attention: row.attention_metric,
            motor: row.motor_metric
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
