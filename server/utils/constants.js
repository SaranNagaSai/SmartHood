const APP_CONSTANTS = {
    ROLES: {
        USER: 'User',
        ADMIN: 'Admin',
    },
    EMERGENCY_TYPES: [
        'Blood Donation',
        'Medical',
        'Accident',
        'Fire',
        'Missing Person',
        'Natural Disaster',
        'Other'
    ],
    PRIORITY: {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High'
    },
    SERVICE_STATUS: {
        PENDING: 'Pending',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
    },
    LANGUAGES: {
        ENGLISH: 'en',
        TELUGU: 'te'
    }
};

module.exports = APP_CONSTANTS;
