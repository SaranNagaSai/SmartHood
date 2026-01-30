import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
import {
    changePassword,
    deleteAccount,
    getUserProfile,
    logoutAllSessions,
    updateUserProfile,
} from '../services/userService';
import {
    FaBriefcase,
    FaCheck,
    FaClipboard,
    FaCopy,
    FaEnvelope,
    FaExclamationTriangle,
    FaIdCard,
    FaInfoCircle,
    FaKey,
    FaLanguage,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaSave,
    FaShieldAlt,
    FaSignOutAlt,
    FaTint,
    FaTrash,
    FaUser,
} from 'react-icons/fa';
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import SelectField from "../components/ui/SelectField";
import PageHeader from "../components/layout/PageHeader";
import { AuthContext } from "../context/AuthContext";
import ConfirmModal from "../components/common/ConfirmModal";
import useToast from "../hooks/useToast";
import { lookupAddressByPincode, normalizePincode } from '../utils/pincodeAddress';

const Profile = () => {
    const { t } = useTranslation();
    const { logout } = useContext(AuthContext);
    const { addToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [notificationStatus, setNotificationStatus] = useState(null);
    const [originalLocality, setOriginalLocality] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLocalityWarning, setShowLocalityWarning] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [pincodeLookup, setPincodeLookup] = useState({ status: 'idle', message: '', states: [], districts: [], localities: [], areas: [], towns: [] });
    const [localityMode, setLocalityMode] = useState('auto');
    const [districtMode, setDistrictMode] = useState('auto');
    const [stateMode, setStateMode] = useState('auto');
    const [areaMode, setAreaMode] = useState('auto');
    const [townMode, setTownMode] = useState('auto');

    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        variant: "primary",
        onConfirm: null,
    });

    // Account settings
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [accountBusy, setAccountBusy] = useState(false);

    const professionOptionsByCategory = useMemo(
        () => ({
            Electrician: [
                'Home Wiring',
                'Appliance Repair',
                'Fan/Light Installation',
                'Inverter/UPS Setup',
                'Other',
            ],
            Plumber: [
                'Pipe Fitting',
                'Leak Fixing',
                'Bathroom/Kitchen Setup',
                'Water Tank Motor',
                'Other',
            ],
            Carpenter: [
                'Furniture Making',
                'Door/Window Work',
                'Modular Fitting',
                'Repair & Polish',
                'Other',
            ],
            Mechanic: [
                'Bike Mechanic',
                'Car Mechanic',
                'Tyre & Puncture',
                'Battery Service',
                'Other',
            ],
            Driver: ['Auto Driver', 'Cab Driver', 'Delivery Driver', 'Other'],
            Teacher: ['School Teacher', 'Home Tutor', 'Coaching', 'Other'],
            Doctor: ['General Physician', 'Dentist', 'Pediatrician', 'Other'],
            Nurse: ['Staff Nurse', 'Home Care', 'Other'],
            Engineer: ['Software Engineer', 'Civil Engineer', 'Electrical Engineer', 'Other'],
            Farmer: ['Agriculture', 'Dairy', 'Poultry', 'Other'],
            Shopkeeper: ['Grocery', 'Medical Store', 'Clothing', 'Other'],
            Business: ['Entrepreneur', 'Small Business', 'Other'],
        }),
        []
    );

    const professionCategoryKey = String(profile?.professionCategory || '').trim();
    const isStudentCategory =
        String(profile?.professionCategory || '').toLowerCase() === 'student' || Boolean(profile?.isStudent);

    const derivedProfessionOptions = useMemo(() => {
        if (!professionCategoryKey) return null;
        return professionOptionsByCategory[professionCategoryKey] || null;
    }, [professionCategoryKey, professionOptionsByCategory]);

    const initialProfessionMode = useMemo(() => {
        if (!derivedProfessionOptions) return 'text';
        const current = String(profile?.profession || '').trim();
        if (!current) return 'select';
        return derivedProfessionOptions.includes(current) ? 'select' : 'custom';
    }, [derivedProfessionOptions, profile?.profession]);

    const [professionMode, setProfessionMode] = useState('text');
    const [professionCustom, setProfessionCustom] = useState('');

    const [studentEducationMode, setStudentEducationMode] = useState('select');
    const [studentEducationCustom, setStudentEducationCustom] = useState('');
    const [studentClassMode, setStudentClassMode] = useState('select');
    const [studentClassCustom, setStudentClassCustom] = useState('');

    const [studentStreamMode, setStudentStreamMode] = useState('select');
    const [studentStreamCustom, setStudentStreamCustom] = useState('');
    const [studentBranchMode, setStudentBranchMode] = useState('select');
    const [studentBranchCustom, setStudentBranchCustom] = useState('');

    useEffect(() => {
        setProfessionMode(initialProfessionMode);
        if (initialProfessionMode === 'custom') {
            setProfessionCustom(String(profile?.profession || ''));
        }
        if (initialProfessionMode !== 'custom' && !derivedProfessionOptions) {
            setProfessionCustom('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [professionCategoryKey]);

    useEffect(() => {
        const edu = String(profile?.studentDetails?.educationLevel || '').trim();
        if (!edu) {
            setStudentEducationMode('select');
            setStudentEducationCustom('');
        } else if (
            [
                'School',
                'Intermediate',
                'Diploma',
                'UG',
                'PG',
                'PhD',
            ].includes(edu)
        ) {
            setStudentEducationMode('select');
            setStudentEducationCustom('');
        } else {
            setStudentEducationMode('custom');
            setStudentEducationCustom(edu);
        }

        const cls = String(profile?.studentDetails?.classYear || '').trim();
        if (!cls) {
            setStudentClassMode('select');
            setStudentClassCustom('');
        } else if (
            [
                'Class 6',
                'Class 7',
                'Class 8',
                'Class 9',
                'Class 10',
                'Class 11',
                'Class 12',
                '1st Year',
                '2nd Year',
                '3rd Year',
                '4th Year',
            ].includes(cls)
        ) {
            setStudentClassMode('select');
            setStudentClassCustom('');
        } else {
            setStudentClassMode('custom');
            setStudentClassCustom(cls);
        }

        const stream = String(profile?.studentDetails?.stream || '').trim();
        if (!stream) {
            setStudentStreamMode('select');
            setStudentStreamCustom('');
        } else if (['Science', 'Commerce', 'Arts', 'Engineering', 'Medicine', 'Diploma', 'Other'].includes(stream)) {
            setStudentStreamMode('select');
            setStudentStreamCustom('');
        } else {
            setStudentStreamMode('custom');
            setStudentStreamCustom(stream);
        }

        const branch = String(profile?.studentDetails?.branch || '').trim();
        if (!branch) {
            setStudentBranchMode('select');
            setStudentBranchCustom('');
        } else if (
            [
                'CSE',
                'ECE',
                'EEE',
                'Mechanical',
                'Civil',
                'IT',
                'AIML',
                'DS',
                'Biotech',
                'Other',
            ].includes(branch)
        ) {
            setStudentBranchMode('select');
            setStudentBranchCustom('');
        } else {
            setStudentBranchMode('custom');
            setStudentBranchCustom(branch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        profile?.studentDetails?.educationLevel,
        profile?.studentDetails?.classYear,
        profile?.studentDetails?.stream,
        profile?.studentDetails?.branch,
    ]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const payload = await getUserProfile();
                setProfile(payload?.user || null);
                setStats(payload?.stats || null);
                setNotificationStatus(payload?.notificationStatus || null);
                setOriginalLocality(payload?.user?.locality);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile", error);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!isEditing) return;

        const pin = normalizePincode(profile?.pincode);
        if (pin.length !== 6) {
            setPincodeLookup({ status: pin ? 'idle' : 'idle', message: pin ? 'Enter 6-digit pincode to auto-fill' : '', states: [], districts: [], localities: [], areas: [], towns: [] });
            return;
        }

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try {
                setPincodeLookup((s) => ({ ...s, status: 'loading', message: 'Looking up pincode…' }));
                const result = await lookupAddressByPincode(pin);
                if (cancelled) return;

                if (!result?.found) {
                    setPincodeLookup({ status: 'notfound', message: 'Pincode not found in local dataset', states: [], districts: [], localities: [], areas: [], towns: [] });
                    return;
                }

                setPincodeLookup({
                    status: 'ready',
                    message: '',
                    states: result.states || [],
                    districts: result.districts || [],
                    localities: result.localities || [],
                    areas: result.areas || [],
                    towns: result.towns || [],
                });

                // Auto-fill only when empty to avoid overriding manual edits.
                if (!String(profile?.state || '').trim() && result.states?.[0]) {
                    handleChange('state', result.states[0]);
                }
                if (!String(profile?.district || '').trim() && result.districts?.[0]) {
                    handleChange('district', result.districts[0]);
                }
                if (!String(profile?.locality || '').trim() && result.localities?.[0]) {
                    handleChange('locality', result.localities[0]);
                }
                if (!String(profile?.area || '').trim() && result.areas?.[0]) {
                    handleChange('area', result.areas[0]);
                }
                if (!String(profile?.town || '').trim() && result.towns?.[0]) {
                    handleChange('town', result.towns[0]);
                }
            } catch (err) {
                if (cancelled) return;
                console.error('Pincode lookup failed', err);
                setPincodeLookup({ status: 'error', message: 'Failed to load pincode dataset', states: [], districts: [], localities: [], areas: [], towns: [] });
            }
        }, 450);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.pincode, isEditing]);

    const handleChange = (key, val) => {
        setProfile(prev => ({ ...prev, [key]: val }));

        // Check if locality is being changed
        if (key === 'locality') {
            if (val !== originalLocality) {
                setShowLocalityWarning(true);
            } else {
                setShowLocalityWarning(false);
            }
        }
    };

    const handleStudentDetailsChange = (key, val) => {
        setProfile(prev => ({
            ...prev,
            studentDetails: {
                ...(prev?.studentDetails || {}),
                [key]: val,
            },
        }));
    };

    const handleNotificationPrefChange = (key, val) => {
        setProfile(prev => ({
            ...prev,
            notificationPrefs: {
                ...(prev?.notificationPrefs || {}),
                [key]: val,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const doSave = async () => {
            try {
                const updated = await updateUserProfile({
                    name: profile?.name,
                    email: profile?.email,
                    phone: profile?.phone,
                    address: profile?.address,
                    pincode: profile?.pincode,
                    locality: profile?.locality,
                    area: profile?.area,
                    town: profile?.town,
                    city: profile?.city,
                    district: profile?.district,
                    state: profile?.state,
                    nationality: profile?.nationality,
                    professionCategory: profile?.professionCategory,
                    profession: profile?.profession,
                    experience: profile?.experience,
                    income: profile?.income,
                    currency: profile?.currency,
                    isStudent: profile?.isStudent,
                    studentDetails: profile?.studentDetails,
                    bloodGroup: profile?.bloodGroup,
                    preferredLanguage: profile?.preferredLanguage,
                    notificationPrefs: profile?.notificationPrefs,
                });

                setProfile((prev) => ({ ...prev, ...(updated || {}) }));
                setOriginalLocality(profile?.locality);
                setShowLocalityWarning(false);
                setIsEditing(false);
                addToast(t("profile_updated") || "Profile updated", { type: "success" });
            } catch (error) {
                const code = error?.response?.data?.error?.code;
                if (code === "BLOODGROUP_COOLDOWN") {
                    const nextAllowedAt = error?.response?.data?.error?.nextAllowedAt;
                    addToast(
                        `Blood group can be changed after ${nextAllowedAt ? new Date(nextAllowedAt).toLocaleDateString() : '6 months'}.`,
                        { type: "warning", duration: 5000 }
                    );
                } else if (code === "DUPLICATE") {
                    addToast(error?.response?.data?.message || "Already in use", { type: "error" });
                } else {
                    addToast(t("profile_update_error") || "Failed to update profile", { type: "error" });
                }
            }
        };

        if (showLocalityWarning) {
            setConfirmState({
                open: true,
                title: "Confirm locality change",
                message:
                    "Changing your locality will update your notification scope and community feed. Proceed?",
                confirmText: "Yes, change",
                cancelText: "Cancel",
                variant: "primary",
                onConfirm: async () => {
                    setConfirmState((s) => ({ ...s, open: false }));
                    await doSave();
                },
            });
            return;
        }

        await doSave();
    };

    const joinedOnText = useMemo(() => {
        const dt = profile?.joinedOn || profile?.createdAt;
        if (!dt) return "";
        try {
            return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dt));
        } catch {
            return new Date(dt).toLocaleDateString();
        }
    }, [profile?.joinedOn, profile?.createdAt]);

    const uniqueId = profile?.registrationId;
    const username = profile?.username;

    const copyUniqueId = async () => {
        if (!uniqueId) return;
        try {
            await navigator.clipboard.writeText(uniqueId);
            addToast("Unique ID copied", { type: "success", duration: 1500 });
        } catch {
            addToast("Copy failed", { type: "error", duration: 2000 });
        }
    };

    const handleLogoutAll = async () => {
        if (accountBusy) return;
        setConfirmState({
            open: true,
            title: "Logout all sessions",
            message: "This will log you out from all devices. Continue?",
            confirmText: "Logout all",
            cancelText: "Cancel",
            variant: "primary",
            onConfirm: async () => {
                setConfirmState((s) => ({ ...s, open: false }));
                try {
                    setAccountBusy(true);
                    await logoutAllSessions();
                    addToast("Logged out all sessions", { type: "success" });
                    logout();
                    window.location.assign('/login');
                } catch (error) {
                    console.error(error);
                    addToast("Failed to logout all sessions", { type: "error" });
                } finally {
                    setAccountBusy(false);
                }
            },
        });
    };

    const handleDeleteAccount = async () => {
        if (accountBusy) return;
        setConfirmState({
            open: true,
            title: "Delete account",
            message: "This is a soft delete (account disabled). You will be logged out. Continue?",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
            onConfirm: async () => {
                setConfirmState((s) => ({ ...s, open: false }));
                try {
                    setAccountBusy(true);
                    await deleteAccount();
                    addToast("Account deleted", { type: "success" });
                    logout();
                    window.location.assign('/login');
                } catch (error) {
                    console.error(error);
                    addToast("Failed to delete account", { type: "error" });
                } finally {
                    setAccountBusy(false);
                }
            },
        });
    };

    const handleChangePassword = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (accountBusy) return;
        try {
            setAccountBusy(true);
            await changePassword({ currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            addToast("Password updated. Please login again.", { type: "success" });
            logout();
            window.location.assign('/login');
        } catch (error) {
            console.error(error);
            addToast(error?.response?.data?.message || "Failed to change password", { type: "error" });
        } finally {
            setAccountBusy(false);
        }
    };

    if (loading) return <div className="loader-container"><div className="premium-spinner"></div></div>;

    return (
        <>
            <PageHeader
                title={t("user_profile") || "Profile"}
                subtitle={t("profile_subtitle") || "Manage your personal details and preferences"}
            />

            <div className="profile-page">
                <form onSubmit={handleSubmit} className="profile-sections">
                    {/* SECTION 1 — BASIC IDENTITY (TOP CARD) */}
                    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="profile-section-card">
                        <div className="profile-section-header">
                            <div className="profile-header-left">
                                <div className="profile-avatar-large" aria-hidden="true">
                                    {profile?.name?.[0]?.toUpperCase() || <FaUser />}
                                </div>
                                <div>
                                    <div className="profile-header-name">{profile?.name || "User"}</div>
                                    <div className="profile-header-sub">
                                        <span className="mono">@{username || "username"}</span>
                                        {uniqueId && (
                                            <span className="profile-unique">
                                                <FaIdCard />
                                                <span className="mono">{uniqueId}</span>
                                                <Button unstyled type="button" className="icon-btn" onClick={copyUniqueId} aria-label="Copy Unique ID">
                                                    <FaCopy />
                                                </Button>
                                            </span>
                                        )}
                                    </div>
                                    <div className="profile-badges">
                                        <span className={`pill pill-${(profile?.roleBadge || 'User').toLowerCase()}`}>{profile?.roleBadge || 'User'}</span>
                                        {joinedOnText && <span className="pill pill-muted">Joined on: {joinedOnText}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="profile-header-actions">
                                <Button
                                    type="button"
                                    variant={isEditing ? "secondary" : "primary"}
                                    onClick={() => setIsEditing(v => !v)}
                                    leftIcon={isEditing ? <FaInfoCircle /> : <FaClipboard />}
                                >
                                    {isEditing ? "Cancel Edit" : "Edit Profile"}
                                </Button>
                                {isEditing && (
                                    <Button type="submit" leftIcon={<FaSave />}>
                                        Save
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="profile-grid">
                            <div className="profile-field">
                                <label><FaPhoneAlt /> Phone Number (read-only)</label>
                                <TextField
                                    value={profile?.phone || ""}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    disabled={!isEditing}
                                    inputClassName={!isEditing ? "disabled-input" : undefined}
                                    placeholder="Enter phone"
                                />
                            </div>
                            <div className="profile-field">
                                <label><FaEnvelope /> Email {profile?.email ? "" : "(optional)"}</label>
                                <TextField
                                    value={profile?.email || ""}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    disabled={!isEditing}
                                    inputClassName={!isEditing ? "disabled-input" : undefined}
                                    placeholder={profile?.email ? "" : "Add email (optional)"}
                                />
                            </div>
                            <div className="profile-field">
                                <label><FaUser /> Username (read-only)</label>
                                <TextField value={username || ""} disabled inputClassName="disabled-input" />
                            </div>
                            <div className="profile-field">
                                <label><FaIdCard /> Unique ID (read-only)</label>
                                <div className="inline-copy">
                                    <TextField value={uniqueId || ""} disabled inputClassName="disabled-input" />
                                    <Button unstyled type="button" className="icon-btn" onClick={copyUniqueId} aria-label="Copy Unique ID">
                                        <FaCopy />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* SECTION 2 — LOCATION DETAILS */}
                    <section className="profile-section-card">
                        <div className="profile-section-title"><FaMapMarkerAlt /> Location Details</div>

                        {showLocalityWarning && (
                            <div className="alert alert-warning" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                                <FaExclamationTriangle aria-hidden="true" />
                                <div>
                                    <strong>Address Change Detected</strong>
                                    <div style={{ marginTop: 'var(--space-1)', color: 'inherit' }}>
                                        Changing your locality updates your notification scope.
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="profile-grid">
                            <div className="profile-field span-2">
                                <label>Address</label>
                                <TextField
                                    value={profile?.address || ""}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    disabled={!isEditing}
                                    inputClassName={!isEditing ? "disabled-input" : undefined}
                                />
                            </div>

                            <div className="profile-field">
                                <label>Pincode</label>
                                <TextField
                                    value={profile?.pincode || ""}
                                    onChange={(e) => handleChange('pincode', normalizePincode(e.target.value))}
                                    disabled={!isEditing}
                                    inputClassName={!isEditing ? "disabled-input" : undefined}
                                    placeholder="6-digit pincode"
                                />
                                {isEditing && pincodeLookup?.message ? (
                                    <div className="muted" style={{ marginTop: '6px', fontSize: '0.9rem' }}>
                                        {pincodeLookup.message}
                                    </div>
                                ) : null}
                            </div>

                            <div className="profile-field">
                                <label>Locality</label>
                                {isEditing && pincodeLookup?.status === 'ready' && Array.isArray(pincodeLookup?.localities) && pincodeLookup.localities.length > 0 && localityMode !== 'custom' ? (
                                    <SelectField
                                        value={profile?.locality || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '__custom__') {
                                                setLocalityMode('custom');
                                                return;
                                            }
                                            handleChange('locality', val);
                                        }}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Select locality</option>
                                        {pincodeLookup.localities.map((loc) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                        <option value="__custom__">Other (type manually)</option>
                                    </SelectField>
                                ) : (
                                    <TextField
                                        value={profile?.locality || ""}
                                        onChange={(e) => handleChange("locality", e.target.value)}
                                        disabled={!isEditing}
                                        inputClassName={!isEditing ? "disabled-input" : undefined}
                                    />
                                )}
                            </div>
                            <div className="profile-field">
                                <label>Area</label>
                                {isEditing && pincodeLookup?.status === 'ready' && Array.isArray(pincodeLookup?.areas) && pincodeLookup.areas.length > 0 && areaMode !== 'custom' ? (
                                    <SelectField
                                        value={profile?.area || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '__custom__') {
                                                setAreaMode('custom');
                                                return;
                                            }
                                            handleChange('area', val);
                                        }}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Select area</option>
                                        {pincodeLookup.areas.map((a) => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                        <option value="__custom__">Other (type manually)</option>
                                    </SelectField>
                                ) : (
                                    <TextField
                                        value={profile?.area || ""}
                                        onChange={(e) => handleChange("area", e.target.value)}
                                        disabled={!isEditing}
                                        inputClassName={!isEditing ? "disabled-input" : undefined}
                                    />
                                )}
                            </div>
                            <div className="profile-field">
                                <label>Town</label>
                                {isEditing && pincodeLookup?.status === 'ready' && Array.isArray(pincodeLookup?.towns) && pincodeLookup.towns.length > 0 && townMode !== 'custom' ? (
                                    <SelectField
                                        value={profile?.town || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '__custom__') {
                                                setTownMode('custom');
                                                return;
                                            }
                                            handleChange('town', val);
                                        }}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Select town</option>
                                        {pincodeLookup.towns.map((twn) => (
                                            <option key={twn} value={twn}>{twn}</option>
                                        ))}
                                        <option value="__custom__">Other (type manually)</option>
                                    </SelectField>
                                ) : (
                                    <TextField
                                        value={profile?.town || ""}
                                        onChange={(e) => handleChange("town", e.target.value)}
                                        disabled={!isEditing}
                                        inputClassName={!isEditing ? "disabled-input" : undefined}
                                    />
                                )}
                            </div>
                            <div className="profile-field">
                                <label>City</label>
                                <TextField
                                    value={profile?.city || ""}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                    disabled={!isEditing}
                                    inputClassName={!isEditing ? "disabled-input" : undefined}
                                />
                            </div>
                            <div className="profile-field">
                                <label>District</label>
                                {isEditing && pincodeLookup?.status === 'ready' && Array.isArray(pincodeLookup?.districts) && pincodeLookup.districts.length > 0 && districtMode !== 'custom' ? (
                                    <SelectField
                                        value={profile?.district || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '__custom__') {
                                                setDistrictMode('custom');
                                                return;
                                            }
                                            handleChange('district', val);
                                        }}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Select district</option>
                                        {pincodeLookup.districts.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                        <option value="__custom__">Other (type manually)</option>
                                    </SelectField>
                                ) : (
                                    <TextField
                                        value={profile?.district || ""}
                                        onChange={(e) => handleChange("district", e.target.value)}
                                        disabled={!isEditing}
                                        inputClassName={!isEditing ? "disabled-input" : undefined}
                                    />
                                )}
                            </div>
                            <div className="profile-field">
                                <label>State</label>
                                {isEditing && pincodeLookup?.status === 'ready' && Array.isArray(pincodeLookup?.states) && pincodeLookup.states.length > 0 && stateMode !== 'custom' ? (
                                    <SelectField
                                        value={profile?.state || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '__custom__') {
                                                setStateMode('custom');
                                                return;
                                            }
                                            handleChange('state', val);
                                        }}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Select state</option>
                                        {pincodeLookup.states.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                        <option value="__custom__">Other (type manually)</option>
                                    </SelectField>
                                ) : (
                                    <TextField
                                        value={profile?.state || ""}
                                        onChange={(e) => handleChange("state", e.target.value)}
                                        disabled={!isEditing}
                                        inputClassName={!isEditing ? "disabled-input" : undefined}
                                    />
                                )}
                            </div>
                            <div className="profile-field">
                                <label>Nationality</label>
                                <TextField
                                    value={profile?.nationality || ""}
                                    onChange={(e) => handleChange("nationality", e.target.value)}
                                    disabled={!isEditing}
                                    inputClassName={!isEditing ? "disabled-input" : undefined}
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 — PROFESSION */}
                    <section className="profile-section-card">
                        <div className="profile-section-title"><FaBriefcase /> Profession</div>
                        <div className="profile-grid">
                            <div className="profile-field">
                                <label>Profession Category</label>
                                <SelectField
                                    value={profile?.professionCategory || ""}
                                    onChange={(e) => handleChange("professionCategory", e.target.value)}
                                    disabled={!isEditing}
                                >
                                    <option value="">Select category</option>
                                    <option value="Student">Student</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Plumber">Plumber</option>
                                    <option value="Carpenter">Carpenter</option>
                                    <option value="Mechanic">Mechanic</option>
                                    <option value="Driver">Driver</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Engineer">Engineer</option>
                                    <option value="Farmer">Farmer</option>
                                    <option value="Shopkeeper">Shopkeeper</option>
                                    <option value="Business">Business</option>
                                    <option value="Other">Other</option>
                                </SelectField>
                            </div>

                            {isStudentCategory ? (
                                <>
                                    <div className="profile-field span-2">
                                        <label>School / College Name</label>
                                        <TextField
                                            value={profile?.studentDetails?.institutionName || ''}
                                            onChange={(e) => handleStudentDetailsChange('institutionName', e.target.value)}
                                            disabled={!isEditing}
                                            inputClassName={!isEditing ? 'disabled-input' : undefined}
                                            placeholder="Enter institution name"
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label>Education Level</label>
                                        <SelectField
                                            value={studentEducationMode === 'custom' ? '__custom__' : (profile?.studentDetails?.educationLevel || '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '__custom__') {
                                                    setStudentEducationMode('custom');
                                                    setStudentEducationCustom('');
                                                    handleStudentDetailsChange('educationLevel', '');
                                                    return;
                                                }
                                                setStudentEducationMode('select');
                                                setStudentEducationCustom('');
                                                handleStudentDetailsChange('educationLevel', val);
                                            }}
                                            disabled={!isEditing}
                                        >
                                            <option value="">Select level</option>
                                            <option value="School">School</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Diploma">Diploma</option>
                                            <option value="UG">UG</option>
                                            <option value="PG">PG</option>
                                            <option value="PhD">PhD</option>
                                            <option value="__custom__">Other (type manually)</option>
                                        </SelectField>
                                        {studentEducationMode === 'custom' && (
                                            <TextField
                                                value={studentEducationCustom}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setStudentEducationCustom(v);
                                                    handleStudentDetailsChange('educationLevel', v);
                                                }}
                                                disabled={!isEditing}
                                                inputClassName={!isEditing ? 'disabled-input' : undefined}
                                                placeholder="Type education level"
                                            />
                                        )}
                                    </div>
                                    <div className="profile-field">
                                        <label>Class / Academic Year</label>
                                        <SelectField
                                            value={studentClassMode === 'custom' ? '__custom__' : (profile?.studentDetails?.classYear || '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '__custom__') {
                                                    setStudentClassMode('custom');
                                                    setStudentClassCustom('');
                                                    handleStudentDetailsChange('classYear', '');
                                                    return;
                                                }
                                                setStudentClassMode('select');
                                                setStudentClassCustom('');
                                                handleStudentDetailsChange('classYear', val);
                                            }}
                                            disabled={!isEditing}
                                        >
                                            <option value="">Select class/year</option>
                                            <option value="Class 6">Class 6</option>
                                            <option value="Class 7">Class 7</option>
                                            <option value="Class 8">Class 8</option>
                                            <option value="Class 9">Class 9</option>
                                            <option value="Class 10">Class 10</option>
                                            <option value="Class 11">Class 11</option>
                                            <option value="Class 12">Class 12</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                            <option value="__custom__">Other (type manually)</option>
                                        </SelectField>
                                        {studentClassMode === 'custom' && (
                                            <TextField
                                                value={studentClassCustom}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setStudentClassCustom(v);
                                                    handleStudentDetailsChange('classYear', v);
                                                }}
                                                disabled={!isEditing}
                                                inputClassName={!isEditing ? 'disabled-input' : undefined}
                                                placeholder="Type class/year"
                                            />
                                        )}
                                    </div>

                                    <div className="profile-field">
                                        <label>Stream</label>
                                        <SelectField
                                            value={studentStreamMode === 'custom' ? '__custom__' : (profile?.studentDetails?.stream || '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '__custom__') {
                                                    setStudentStreamMode('custom');
                                                    setStudentStreamCustom('');
                                                    handleStudentDetailsChange('stream', '');
                                                    return;
                                                }
                                                setStudentStreamMode('select');
                                                setStudentStreamCustom('');
                                                handleStudentDetailsChange('stream', val);
                                            }}
                                            disabled={!isEditing}
                                        >
                                            <option value="">Select stream</option>
                                            <option value="Science">Science</option>
                                            <option value="Commerce">Commerce</option>
                                            <option value="Arts">Arts</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="Medicine">Medicine</option>
                                            <option value="Diploma">Diploma</option>
                                            <option value="__custom__">Other (type manually)</option>
                                        </SelectField>
                                        {studentStreamMode === 'custom' && (
                                            <TextField
                                                value={studentStreamCustom}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setStudentStreamCustom(v);
                                                    handleStudentDetailsChange('stream', v);
                                                }}
                                                disabled={!isEditing}
                                                inputClassName={!isEditing ? 'disabled-input' : undefined}
                                                placeholder="Type stream"
                                            />
                                        )}
                                    </div>

                                    <div className="profile-field">
                                        <label>Branch</label>
                                        <SelectField
                                            value={studentBranchMode === 'custom' ? '__custom__' : (profile?.studentDetails?.branch || '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '__custom__') {
                                                    setStudentBranchMode('custom');
                                                    setStudentBranchCustom('');
                                                    handleStudentDetailsChange('branch', '');
                                                    return;
                                                }
                                                setStudentBranchMode('select');
                                                setStudentBranchCustom('');
                                                handleStudentDetailsChange('branch', val);
                                            }}
                                            disabled={!isEditing}
                                        >
                                            <option value="">Select branch</option>
                                            <option value="CSE">CSE</option>
                                            <option value="ECE">ECE</option>
                                            <option value="EEE">EEE</option>
                                            <option value="Mechanical">Mechanical</option>
                                            <option value="Civil">Civil</option>
                                            <option value="IT">IT</option>
                                            <option value="AIML">AIML</option>
                                            <option value="DS">DS</option>
                                            <option value="Biotech">Biotech</option>
                                            <option value="__custom__">Other (type manually)</option>
                                        </SelectField>
                                        {studentBranchMode === 'custom' && (
                                            <TextField
                                                value={studentBranchCustom}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setStudentBranchCustom(v);
                                                    handleStudentDetailsChange('branch', v);
                                                }}
                                                disabled={!isEditing}
                                                inputClassName={!isEditing ? 'disabled-input' : undefined}
                                                placeholder="Type branch"
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="profile-field">
                                        <label>Profession / Work Title</label>
                                        {derivedProfessionOptions ? (
                                            <>
                                                <SelectField
                                                    value={professionMode === 'custom' ? '__custom__' : (profile?.profession || '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '__custom__') {
                                                            setProfessionMode('custom');
                                                            setProfessionCustom('');
                                                            handleChange('profession', '');
                                                            return;
                                                        }
                                                        setProfessionMode('select');
                                                        setProfessionCustom('');
                                                        handleChange('profession', val);
                                                    }}
                                                    disabled={!isEditing}
                                                >
                                                    <option value="">Select work title</option>
                                                    {derivedProfessionOptions
                                                        .filter((o) => o !== 'Other')
                                                        .map((opt) => (
                                                            <option key={opt} value={opt}>
                                                                {opt}
                                                            </option>
                                                        ))}
                                                    <option value="__custom__">Other (type manually)</option>
                                                </SelectField>

                                                {professionMode === 'custom' && (
                                                    <TextField
                                                        value={professionCustom}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setProfessionCustom(v);
                                                            handleChange('profession', v);
                                                        }}
                                                        disabled={!isEditing}
                                                        inputClassName={!isEditing ? 'disabled-input' : undefined}
                                                        placeholder="Type your work title"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <TextField
                                                value={profile?.profession || ""}
                                                onChange={(e) => handleChange("profession", e.target.value)}
                                                disabled={!isEditing}
                                                inputClassName={!isEditing ? "disabled-input" : undefined}
                                                placeholder="Type your work title"
                                            />
                                        )}
                                    </div>
                                    <div className="profile-field">
                                        <label>Years of Experience</label>
                                        <TextField
                                            type="number"
                                            value={profile?.experience ?? ""}
                                            onChange={(e) => handleChange("experience", e.target.value)}
                                            disabled={!isEditing}
                                            inputClassName={!isEditing ? "disabled-input" : undefined}
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label>Monthly Income</label>
                                        <TextField
                                            type="number"
                                            value={profile?.income ?? ""}
                                            onChange={(e) => handleChange("income", e.target.value)}
                                            disabled={!isEditing}
                                            inputClassName={!isEditing ? "disabled-input" : undefined}
                                            placeholder="25000"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label>Currency</label>
                                        <SelectField
                                            value={profile?.currency || "INR"}
                                            onChange={(e) => handleChange("currency", e.target.value)}
                                            disabled={!isEditing}
                                        >
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </SelectField>
                                    </div>
                                    <div className="profile-field span-2">
                                        <div className="muted">
                                            Displayed as: <span className="mono">₹ {Number(profile?.income || 0).toLocaleString()} / month</span> · <span className="mono">≈ ₹ {Number(profile?.income || 0).toLocaleString()} {profile?.currency || 'INR'}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* SECTION 4 — BLOOD GROUP */}
                    <section className="profile-section-card">
                        <div className="profile-section-title"><FaTint /> Blood Group</div>
                        <div className="profile-grid">
                            <div className="profile-field">
                                <label>Blood Group</label>
                                <SelectField
                                    value={profile?.bloodGroup || ""}
                                    onChange={(e) => handleChange("bloodGroup", e.target.value)}
                                    disabled={!isEditing}
                                >
                                    <option value="">Select blood group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </SelectField>
                                <div className="help-text">
                                    Used by Emergency module and blood donation alerts. Recommended: change only once every 6 months.
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 — ACTIVITY & IMPACT */}
                    <section className="profile-section-card">
                        <div className="profile-section-title"><FaShieldAlt /> Activity & Impact</div>
                        <div className="profile-stats-grid">
                            <div className="stat-tile">
                                <div className="stat-value">{stats?.servicesRequested ?? 0}</div>
                                <div className="stat-label">Services Requested</div>
                            </div>
                            <div className="stat-tile">
                                <div className="stat-value">{stats?.servicesProvided ?? 0}</div>
                                <div className="stat-label">Services Provided</div>
                            </div>
                            <div className="stat-tile">
                                <div className="stat-value">{stats?.emergenciesParticipated ?? 0}</div>
                                <div className="stat-label">Emergencies Participated</div>
                            </div>
                            <div className="stat-tile">
                                <div className="stat-value">{stats?.emergencyAlertsRaised ?? 0}</div>
                                <div className="stat-label">Emergency Alerts Raised</div>
                            </div>
                            <div className="stat-tile">
                                <div className="stat-value">₹ {Number(stats?.revenueGenerated ?? 0).toLocaleString()}</div>
                                <div className="stat-label">Revenue Generated</div>
                            </div>
                            <div className="stat-tile">
                                <div className="stat-value">₹ {Number(stats?.revenueSpent ?? 0).toLocaleString()}</div>
                                <div className="stat-label">Revenue Spent</div>
                            </div>
                            <div className="stat-tile">
                                <div className="stat-value">⭐ {Number(stats?.currentRating ?? 0).toFixed(1)}</div>
                                <div className="stat-label">Current Rating</div>
                            </div>
                            <div className="stat-tile">
                                <div className="stat-value">#{stats?.leaderboardRank ?? '-'}</div>
                                <div className="stat-label">Leaderboard Rank</div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6 — NOTIFICATION SETTINGS */}
                    <section className="profile-section-card">
                        <div className="profile-section-title"><FaInfoCircle /> Notification Settings</div>

                        <div className="profile-grid">
                            <div className="profile-field">
                                <label>Web Push Enabled</label>
                                <div className={`status-line ${notificationStatus?.webPushEnabled ? 'ok' : 'off'}`}>
                                    {notificationStatus?.webPushEnabled ? <FaCheck /> : <FaExclamationTriangle />}
                                    <span>{notificationStatus?.webPushEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="help-text">Depends on browser permission/subscription.</div>
                            </div>

                            <div className="profile-field">
                                <label>Email Notifications</label>
                                <div className="toggle-row">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(profile?.notificationPrefs?.emailEnabled !== false)}
                                        onChange={(e) => handleNotificationPrefChange('emailEnabled', e.target.checked)}
                                        disabled={!isEditing || !profile?.email}
                                    />
                                    <span className="muted">{profile?.email ? "Enable/Disable" : "Add email to enable"}</span>
                                </div>
                            </div>

                            <div className="profile-field">
                                <label>SMS</label>
                                <div className="status-line off">
                                    <FaExclamationTriangle />
                                    <span>Disabled</span>
                                </div>
                            </div>

                            <div className="profile-field">
                                <label><FaLanguage /> Language Preference</label>
                                <SelectField
                                    value={profile?.preferredLanguage || 'en'}
                                    onChange={(e) => handleChange("preferredLanguage", e.target.value)}
                                    disabled={!isEditing}
                                >
                                    <option value="en">English</option>
                                    <option value="te">తెలుగు</option>
                                </SelectField>
                            </div>

                            <div className="profile-field">
                                <label>Theme Preference (future)</label>
                                <SelectField value="default" disabled>
                                    <option value="default">Default</option>
                                </SelectField>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 7 — ACCOUNT SETTINGS */}
                    <section className="profile-section-card">
                        <div className="profile-section-title"><FaKey /> Account Settings</div>

                        <div className="profile-grid">
                            <div className="profile-field span-2">
                                <div className="inline-form">
                                    <div className="inline-form-row">
                                        <TextField
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Current password"
                                            disabled={accountBusy}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleChangePassword();
                                                }
                                            }}
                                        />
                                        <TextField
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New password"
                                            disabled={accountBusy}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleChangePassword();
                                                }
                                            }}
                                        />
                                        <Button type="button" disabled={accountBusy} leftIcon={<FaKey />} onClick={handleChangePassword}>Change Password</Button>
                                    </div>
                                    <div className="help-text">Password change logs you out everywhere.</div>
                                </div>
                            </div>
                            <div className="profile-field">
                                <Button type="button" variant="secondary" disabled={accountBusy} leftIcon={<FaSignOutAlt />} onClick={handleLogoutAll}>
                                    Logout All Sessions
                                </Button>
                            </div>
                            <div className="profile-field">
                                <Button type="button" variant="danger" disabled={accountBusy} leftIcon={<FaTrash />} onClick={handleDeleteAccount}>
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </section>
                </form>
            </div>

            <ConfirmModal
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                variant={confirmState.variant}
                onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
                onConfirm={confirmState.onConfirm || (() => setConfirmState((s) => ({ ...s, open: false })))}
            />
        </>
    );
};

export default Profile;
