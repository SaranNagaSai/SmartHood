// Test script to identify server startup errors
const fs = require('fs');

try {
    console.log('Testing require of app.js...');
    require('./app');
    console.log('App loaded successfully');
} catch (error) {
    console.log('Error loading app:');
    console.log(error.message);
    console.log(error.stack);
    fs.writeFileSync('startup_error.txt', error.stack);
}
