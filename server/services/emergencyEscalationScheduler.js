const Emergency = require("../models/Emergency");
const EmergencyResponse = require("../models/EmergencyResponse");
const logger = require("../utils/logger");
const { broadcastEmergencyEscalationStep } = require("./notificationEngine");

const ESCALATION_LEVELS = {
    LOCALITY: "locality",
    TOWN_OR_CITY: "town_or_city",
    DISTRICT: "district",
    STATE: "state",
    DONE: "done",
};

const getDelayMsForLevel = (level) => {
    // Defaults are intentionally conservative.
    // Can be overridden via env vars if needed.
    const toMs = (seconds) => Math.max(0, Number(seconds || 0)) * 1000;

    const localityDelay = toMs(process.env.EMERGENCY_ESCALATE_LOCALITY_AFTER_SEC || 120);
    const townDelay = toMs(process.env.EMERGENCY_ESCALATE_TOWN_AFTER_SEC || 300);
    const districtDelay = toMs(process.env.EMERGENCY_ESCALATE_DISTRICT_AFTER_SEC || 600);

    if (level === ESCALATION_LEVELS.LOCALITY) return localityDelay;
    if (level === ESCALATION_LEVELS.TOWN_OR_CITY) return townDelay;
    if (level === ESCALATION_LEVELS.DISTRICT) return districtDelay;
    return Number.POSITIVE_INFINITY;
};

const getNextLevel = (currentLevel) => {
    if (currentLevel === ESCALATION_LEVELS.LOCALITY) return ESCALATION_LEVELS.TOWN_OR_CITY;
    if (currentLevel === ESCALATION_LEVELS.TOWN_OR_CITY) return ESCALATION_LEVELS.DISTRICT;
    if (currentLevel === ESCALATION_LEVELS.DISTRICT) return ESCALATION_LEVELS.STATE;
    return ESCALATION_LEVELS.DONE;
};

const shouldSkipEmergency = async (emergency) => {
    if (!emergency) return true;
    if (emergency.status !== "Open") return true;
    if (emergency.priority === "High") return true; // High is broadcasted immediately to all levels.

    if (emergency.responderCount && emergency.responderCount > 0) return true;

    // Backward-compat: if responderCount was not maintained, fall back to responses collection.
    const count = await EmergencyResponse.countDocuments({
        emergencyId: emergency._id,
        status: "Active",
    });
    if (count > 0) {
        // best-effort sync
        await Emergency.findByIdAndUpdate(emergency._id, { $set: { responderCount: count } });
        return true;
    }

    return false;
};

const processOneEmergency = async (emergency) => {
    const currentLevel = emergency.escalationLevel || ESCALATION_LEVELS.LOCALITY;
    if (currentLevel === ESCALATION_LEVELS.DONE || currentLevel === ESCALATION_LEVELS.STATE) return;

    const lastEscalatedAt = emergency.lastEscalatedAt || emergency.createdAt || new Date(0);
    const elapsed = Date.now() - new Date(lastEscalatedAt).getTime();
    const requiredDelay = getDelayMsForLevel(currentLevel);

    if (elapsed < requiredDelay) return;

    const nextLevel = getNextLevel(currentLevel);
    if (nextLevel === ESCALATION_LEVELS.DONE) return;

    await broadcastEmergencyEscalationStep({ emergency, level: nextLevel });

    await Emergency.findByIdAndUpdate(emergency._id, {
        $set: {
            escalationLevel: nextLevel,
            lastEscalatedAt: new Date(),
        },
    });
};

const runOnce = async () => {
    const openEmergencies = await Emergency.find({ status: "Open" })
        .sort({ createdAt: -1 })
        .limit(200);

    for (const emergency of openEmergencies) {
        // eslint-disable-next-line no-await-in-loop
        const skip = await shouldSkipEmergency(emergency);
        if (skip) continue;

        // eslint-disable-next-line no-await-in-loop
        await processOneEmergency(emergency);
    }
};

let intervalHandle;

const startEmergencyEscalationScheduler = ({ intervalMs } = {}) => {
    if (intervalHandle) return intervalHandle;

    const ms = Number(intervalMs || process.env.EMERGENCY_ESCALATION_TICK_MS || 30_000);

    intervalHandle = setInterval(() => {
        runOnce().catch((err) => logger.error(`Emergency escalation tick failed: ${err.message}`));
    }, ms);

    intervalHandle.unref?.();
    logger.info(`Emergency escalation scheduler started (tick=${ms}ms)`);

    return intervalHandle;
};

module.exports = {
    ESCALATION_LEVELS,
    startEmergencyEscalationScheduler,
};
