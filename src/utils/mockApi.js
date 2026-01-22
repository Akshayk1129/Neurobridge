
// PROXY API - Connects to Real Node.js Backend
// Replaces mocked localStorage logic

const API_BASE = 'http://localhost:3001/api';

export const mockApi = {
    // GET /api/user
    getUser: async () => {
        try {
            const res = await fetch(`${API_BASE}/user`);
            if (!res.ok) throw new Error('Failed to fetch user');
            return await res.json();
        } catch (e) {
            console.error("API Error:", e);
            // Fallback for demo stability if server offline
            return {
                id: 1,
                name: 'Alex (Offline)',
                age_string: '3 years',
                lastScreeningDate: 'Never'
            };
        }
    },

    // POST /api/screenings
    saveScreening: async (data) => {
        const res = await fetch(`${API_BASE}/screenings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    // GET /api/progress
    getProgress: async () => {
        try {
            const res = await fetch(`${API_BASE}/progress`);
            const json = await res.json();
            return json;
        } catch (e) {
            console.error("API Error:", e);
            return { data: [], trends: {} };
        }
    },

    // GET /api/patients (Clinician View - Mock for now as backend doesn't support list)
    getPatients: async () => {
        // Return Mixed Real + Mock
        return [
            {
                id: 1,
                name: 'Alex',
                age: '3 years, 2 months',
                lastScreening: 'Today',
                risk: 'Medium'
            },
            { id: 2, name: 'Liam Johnson', age: '4 years', lastScreening: '10/24/2025', risk: 'Medium' },
            { id: 3, name: 'Emma Davis', age: '2 years, 8 months', lastScreening: '10/22/2025', risk: 'Low' }
        ];
    },

    // GET /api/patients/:id/history
    getPatientHistory: async (id) => {
        if (id === 1) {
            const res = await fetch(`${API_BASE}/progress`); // Reuse progress endpoint
            const json = await res.json();
            return json.data.reverse(); // Newest first
        }
        return [];
    }
};
