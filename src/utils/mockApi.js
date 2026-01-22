
// MOCK API for Client-Side Demo (Replaces Node.js + SQLite)
// Uses localStorage to persist data on Vercel

const DB_KEY = 'neurobridge_db';

const defaultData = {
    user: {
        id: 1,
        name: 'Alex',
        age_string: '3 years, 2 months',
        parent_email: 'parent@example.com'
    },
    screenings: []
};

// Initialize DB if empty
const initDb = () => {
    const existing = localStorage.getItem(DB_KEY);
    if (!existing) {
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
        return defaultData;
    }
    return JSON.parse(existing);
};

// Helper: Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    // GET /api/user
    getUser: async () => {
        await delay();
        const db = initDb();
        const lastScreening = db.screenings.length > 0
            ? db.screenings[db.screenings.length - 1]
            : null;

        return {
            ...db.user,
            lastScreeningDate: lastScreening
                ? new Date(lastScreening.timestamp).toLocaleDateString()
                : 'Never'
        };
    },

    // POST /api/screenings
    saveScreening: async ({ visionScore, eegScore, attentionMetric, motorMetric }) => {
        await delay(800);
        const db = initDb();

        // Fusion Logic (Same as server/index.js)
        const overallScore = Math.round((visionScore * 0.6) + (eegScore * 0.4));

        let riskLevel = 'Low';
        if (overallScore > 40) riskLevel = 'Medium';
        if (overallScore > 70) riskLevel = 'High';

        const newScreening = {
            id: Date.now(),
            user_id: 1,
            timestamp: new Date().toISOString(),
            overall_score: overallScore,
            risk_level: riskLevel,
            vision_score: visionScore,
            eeg_score: eegScore,
            attention_metric: attentionMetric,
            motor_metric: motorMetric
        };

        db.screenings.push(newScreening);
        localStorage.setItem(DB_KEY, JSON.stringify(db));

        return {
            success: true,
            id: newScreening.id,
            riskLevel,
            overallScore
        };
    },

    // GET /api/progress
    getProgress: async () => {
        await delay();
        const db = initDb();

        // Sort by date (asc) and take last 20
        const rows = [...db.screenings]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .slice(-20);

        // Trend Analysis Logic (Same as server/index.js)
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
            motor: row.motor_metric
        }));

        return {
            data,
            trends: {
                regressionWarning,
                attentionTrend
            }
        };
    }
};
