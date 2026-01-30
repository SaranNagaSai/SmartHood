const { admin, getFirebaseAdminApp } = require("../config/firebaseAdmin");
const logger = require("../utils/logger");

const MAX_TOKENS_PER_REQUEST = 500;

const toStringMap = (obj) => {
    if (!obj) return {};
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null) continue;
        out[key] = typeof value === "string" ? value : JSON.stringify(value);
    }
    return out;
};

const chunk = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

const sendMulticast = async ({ tokens, title, body, url = "/", data, urgency = "normal" }) => {
    if (!tokens || tokens.length === 0) {
        return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    getFirebaseAdminApp();

    const invalidTokens = [];
    let successCount = 0;
    let failureCount = 0;

    const tokenChunks = chunk(tokens, MAX_TOKENS_PER_REQUEST);
    for (const tokenChunk of tokenChunks) {
        try {
            const message = {
                tokens: tokenChunk,
                // Data-only message: service worker handles rendering.
                data: {
                    title: String(title || ""),
                    body: String(body || ""),
                    url: String(url || "/"),
                    ...toStringMap(data ? { meta: data } : {}),
                },
                webpush: {
                    headers: {
                        Urgency: urgency === "high" ? "high" : "normal",
                    },
                    fcmOptions: {
                        link: String(url || "/"),
                    },
                },
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            successCount += response.successCount;
            failureCount += response.failureCount;

            response.responses.forEach((r, idx) => {
                if (!r.success) {
                    const code = r.error?.code;
                    if (
                        code === "messaging/registration-token-not-registered" ||
                        code === "messaging/invalid-registration-token"
                    ) {
                        invalidTokens.push(tokenChunk[idx]);
                    }
                }
            });
        } catch (error) {
            logger.error(`FCM sendMulticast error: ${error.message}`);
            failureCount += tokenChunk.length;
        }
    }

    return { successCount, failureCount, invalidTokens };
};

module.exports = {
    sendMulticast,
};
