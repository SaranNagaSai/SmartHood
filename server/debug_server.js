try {
    console.log("Loading modules...");

    const modules = [
        '../config/db',
        '../config/firebase',
        '../middleware/errorMiddleware',
        '../middleware/errorHandler',
        '../routes/authRoutes',
        '../routes/serviceRoutes',
        '../routes/emergencyRoutes',
        '../routes/complaintRoutes',
        '../routes/adminRoutes',
        '../routes/userRoutes',
        '../routes/studentRoutes',
        '../routes/localityRoutes',
        '../routes/notificationRoutes',
        '../routes/analyticsRoutes',
        '../routes/tourismRoutes'
    ];

    for (const mod of modules) {
        process.stdout.write(`Loading ${mod} ... `);
        require(mod);
        console.log("OK");
    }

    console.log("All modules loaded successfully.");

} catch (e) {
    console.log("\nFAILED");
    console.error("CRASH ERROR:", e.message);
    if (e.code === 'MODULE_NOT_FOUND') {
        console.error("Missing Module:", e.requireStack);
    } else {
        console.error(e.stack);
    }
}
