export const mockUser = {
    childName: "Alex",
    childAge: "3 years, 2 months",
    lastScreeningDate: "2024-03-15",
    riskLevel: "Medium", // Low, Medium, High
    riskScore: 68, // 0-100
    nextMilestone: "Joint Attention",
    nextTherapy: "Speech Therapy - Tomorrow, 10:00 AM"
};

export const mockProgressData = [
    { month: 'Jan', speech: 45, motor: 50, social: 30 },
    { month: 'Feb', speech: 52, motor: 55, social: 35 },
    { month: 'Mar', speech: 58, motor: 58, social: 42 },
    { month: 'Apr', speech: 65, motor: 60, social: 48 },
];

export const recentActivities = [
    { id: 1, type: "Screening", title: "Monthly Progress Check", date: "2 days ago", status: "Completed" },
    { id: 2, type: "Therapy", title: "Speech Session", date: "1 week ago", status: "Completed" },
    { id: 3, type: "Milestone", title: "Responded to name", date: "1 week ago", status: "Achieved" },
];
