import React, { useState, useEffect, useCallback } from "react";
// Removed unused useTranslation import
// Removed unused motion import
import Navbar from "../components/common/Navbar";
import API from "../services/api";
import { FaUsers, FaExclamationCircle, FaClipboardCheck, FaChartBar, FaCheck } from "react-icons/fa";

export default function Admin() {
    // Removed unused 't'
    const [tab, setTab] = useState("Analytics");
    const [data, setData] = useState({ users: [], complaints: [], analytics: {} });
    // loading is technically unused visually (no spinner), but logic sets it. I'll keep logic but verify usage.
    // Actually lint said 'loading' is assigned but never used. 
    // And 'error' in catch is unused. 

    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);

    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        try {
            if (tab === "Analytics") {
                const { data } = await API.get("/admin/analytics");
                setData(prev => ({ ...prev, analytics: data }));
            } else if (tab === "Users") {
                const { data } = await API.get("/admin/users");
                setData(prev => ({ ...prev, users: data }));
            } else if (tab === "Complaints") {
                const { data } = await API.get("/complaints");
                setData(prev => ({ ...prev, complaints: data }));
            }
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const handleVerify = async (id) => {
        try {
            await API.put(`/admin/users/${id}/verify`);
            alert("User verified!");
            fetchAdminData();
        } catch { // Removed unused error object
            alert("Verification failed");
        }
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <aside style={styles.sidebar}>
                    <button style={tab === 'Analytics' ? styles.activeTab : styles.tab} onClick={() => setTab('Analytics')}><FaChartBar /> Dashboard</button>
                    <button style={tab === 'Users' ? styles.activeTab : styles.tab} onClick={() => setTab('Users')}><FaUsers /> User Management</button>
                    <button style={tab === 'Complaints' ? styles.activeTab : styles.tab} onClick={() => setTab('Complaints')}><FaExclamationCircle /> Complaints</button>
                </aside>

                <main style={styles.main}>
                    {tab === 'Analytics' && <AnalyticsView data={data.analytics} />}
                    {tab === 'Users' && <UsersView users={data.users} onVerify={handleVerify} />}
                    {tab === 'Complaints' && <p>Complaints management coming soon...</p>}
                </main>
            </div>
        </>
    );
}

function AnalyticsView({ data }) {
    return (
        <div style={styles.statsGrid}>
            <div style={styles.statCard}><h3>Total Users</h3><p>{data.users || 0}</p></div>
            <div style={styles.statCard}><h3>Services</h3><p>{data.services || 0}</p></div>
            <div style={styles.statCard}><h3>Emergencies</h3><p>{data.emergencies || 0}</p></div>
            <div style={styles.statCard}><h3>Resolved</h3><p>{data.resolvedComplaints || 0}</p></div>
        </div>
    );
}

function UsersView({ users, onVerify }) {
    return (
        <table style={styles.table}>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Locality</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {users.map(u => (
                    <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.locality}</td>
                        <td>{u.role}</td>
                        <td>{u.isVerified ? 'Verified' : 'Pending'}</td>
                        <td>{!u.isVerified && <button onClick={() => onVerify(u._id)} style={styles.verifyBtn}><FaCheck /></button>}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const styles = {
    container: { display: "flex", minHeight: "100vh", background: "#f1f5f9" },
    sidebar: { width: "250px", background: "#1e293b", color: "#fff", padding: "40px 20px", display: "flex", flexDirection: "column", gap: "10px" },
    tab: { padding: "12px", border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", textAlign: "left", fontSize: "1rem" },
    activeTab: { padding: "12px", border: "none", background: "#334155", color: "#fff", cursor: "pointer", textAlign: "left", fontSize: "1rem", borderRadius: "8px" },
    main: { flex: 1, padding: "40px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
    statCard: { background: "#fff", padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" },
    table: { width: "100%", background: "#fff", borderRadius: "16px", padding: "20px", borderCollapse: "collapse" },
    verifyBtn: { padding: "8px", background: "#10b981", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }
};
