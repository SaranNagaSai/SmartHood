const normalizeEmail = (email) => {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();
    return normalized || null;
};

const normalizePhone = (phone) => {
    if (!phone) return null;

    let digits = String(phone).replace(/\D/g, "");

    // Handle common India country code prefix
    if (digits.length === 12 && digits.startsWith("91")) {
        digits = digits.slice(2);
    }

    // If extra digits remain, compare by last 10
    if (digits.length > 10) {
        digits = digits.slice(-10);
    }

    return digits || null;
};

const parseAllowlist = (raw) => {
    if (!raw) return [];
    return String(raw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
};

const getAdminAllowlist = () => {
    const emails = new Set(
        parseAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST)
            .map(normalizeEmail)
            .filter(Boolean)
    );

    const phones = new Set(
        parseAllowlist(process.env.ADMIN_PHONE_ALLOWLIST)
            .map(normalizePhone)
            .filter(Boolean)
    );

    return { emails, phones };
};

const isAllowlistedAdmin = ({ email, phone }) => {
    const { emails, phones } = getAdminAllowlist();

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    return (
        (normalizedEmail && emails.has(normalizedEmail)) ||
        (normalizedPhone && phones.has(normalizedPhone))
    );
};

module.exports = {
    isAllowlistedAdmin,
    normalizeEmail,
    normalizePhone,
};
