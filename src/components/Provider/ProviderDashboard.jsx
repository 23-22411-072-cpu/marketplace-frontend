import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Header from '../Header';
import { useLocation as useLocationContext } from '../../context/LocationContext'; 

const ProviderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    
  
    const { selectedLocation } = useLocationContext();

    const fetchProviderOrders = useCallback(async () => {
        
        if (!selectedLocation) return;

        try {
            setLoading(true);
            console.log("Fetching orders for location:", selectedLocation.city);
            
            
            const response = await api.get(`/provider/orders?location_id=${selectedLocation.location_id}`); 
            setOrders(response.data.orders || []);
        } catch (err) {
            console.error("Fetch Error:", err);
           
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [selectedLocation]); 

    useEffect(() => {
        fetchProviderOrders();
    }, [fetchProviderOrders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/provider/orders/${orderId}/status`, { status: newStatus });
            alert(response.data.message || "Status updated!");
            fetchProviderOrders();
        } catch (err) {
            alert(err.response?.data?.message || "Status update failed");
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'pending') return order.status === 'pending';
        if (activeTab === 'active') return ['accepted', 'in_progress'].includes(order.status);
        if (activeTab === 'completed') return ['completed', 'cancelled'].includes(order.status);
        return true;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px', color: '#000' }}>⌛ Loading Dashboard for {selectedLocation?.city}...</div>;

    return (
        <div style={{ background: '#f4f7f6', minHeight: '100vh' }}>
            <Header />
            <div style={{ padding: '120px 5% 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#000', margin: 0, fontWeight: '800' }}>Provider Dashboard</h2>
                    <div style={{ background: '#3182ce', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                        📍 {selectedLocation?.city} ({selectedLocation?.area})
                    </div>
                </div>

                <div style={statsGrid}>
                    <div style={statCard}>
                        <span style={statLabel}>Total Jobs ({selectedLocation?.city})</span>
                        <h3 style={statValue}>{orders.length}</h3>
                    </div>
                    <div style={statCard}>
                        <span style={statLabel}>Total Earnings</span>
                        <h3 style={{ ...statValue, color: '#1a4731' }}>
                            Rs. {orders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0)}
                        </h3>
                    </div>
                </div>

                <div style={tabContainer}>
                    <button onClick={() => setActiveTab('pending')} style={activeTab === 'pending' ? activeTabBtn : tabBtn}>New Requests</button>
                    <button onClick={() => setActiveTab('active')} style={activeTab === 'active' ? activeTabBtn : tabBtn}>Active Jobs</button>
                    <button onClick={() => setActiveTab('completed')} style={activeTab === 'completed' ? activeTabBtn : tabBtn}>History</button>
                </div>

                {filteredOrders.length === 0 ? (
                    <div style={emptyState}>No orders found in {selectedLocation?.city} for this section.</div>
                ) : (
                    <div style={orderGrid}>
                        {filteredOrders.map(order => (
                            <div key={order.id} style={cardStyle}>
                                <div style={cardHeader}>
                                    <strong style={{color: '#000', fontSize: '18px'}}>Order #{order.id}</strong>
                                    <span style={statusBadge(order.status)}>{order.status.toUpperCase()}</span>
                                </div>
                                <div style={cardBody}>
                                    <p style={detailLine}><strong>Customer:</strong> <span style={textDark}>{order.customer?.full_name || 'N/A'}</span></p>
                                    <p style={detailLine}><strong>Service:</strong> <span style={textDark}>{order.service?.service_name || 'N/A'}</span></p>
                                    <p style={detailLine}><strong>Address:</strong> <span style={textDark}>{order.customer_address}</span></p>
                                    <p style={priceHighlight}>Price: Rs. {order.total_price}</p>

                                    {order.status === 'completed' && order.review && (
                                        <div style={ratingBox}>
                                            <p style={{ margin: 0, color: '#064e3b', fontWeight: 'bold' }}>⭐ Rating: {order.review.rating}/5</p>
                                            {order.review.comment && (
                                                <p style={{ margin: '5px 0 0', color: '#000', fontStyle: 'italic', fontSize: '14px' }}>
                                                    "{order.review.comment}"
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div style={cardActions}>
                                    {order.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleUpdateStatus(order.id, 'accepted')} style={acceptBtn}>Accept Job</button>
                                            <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} style={rejectBtn}>Reject</button>
                                        </>
                                    )}
                                    {order.status === 'accepted' && (
                                        <button onClick={() => handleUpdateStatus(order.id, 'completed')} style={completeBtn}>Mark as Completed</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Styles ---
const textDark = { color: '#1a202c', fontWeight: '500' };
const statsGrid = { display: 'flex', gap: '20px', marginBottom: '30px' };
const statCard = { background: '#fff', padding: '25px', borderRadius: '10px', flex: '1', textAlign: 'center', border: '1px solid #cbd5e0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const statLabel = { color: '#4a5568', fontWeight: 'bold', fontSize: '16px' };
const statValue = { color: '#000', fontSize: '32px', fontWeight: '800', margin: '10px 0 0' };
const tabContainer = { display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '25px' };
const tabBtn = { padding: '12px 24px', cursor: 'pointer', background: 'none', border: 'none', color: '#4a5568', fontWeight: 'bold', fontSize: '16px' };
const activeTabBtn = { ...tabBtn, color: '#3182ce', borderBottom: '4px solid #3182ce' };
const orderGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };
const cardStyle = { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '12px', marginBottom: '15px' };
const cardBody = { padding: '0' };
const detailLine = { margin: '10px 0', color: '#4a5568', fontSize: '15px' };
const priceHighlight = { marginTop: '15px', fontSize: '20px', fontWeight: 'bold', color: '#2f855a' };
const ratingBox = { marginTop: '15px', padding: '12px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5' };
const cardActions = { marginTop: '20px', display: 'flex', gap: '10px' };
const acceptBtn = { flex: '1', background: '#3182ce', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const rejectBtn = { background: '#e53e3e', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const completeBtn = { width: '100%', background: '#38a169', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const emptyState = { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#718096', fontSize: '18px', fontWeight: '500' };

const statusBadge = (s) => ({
    padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800',
    background: s === 'pending' ? '#feebc8' : (s === 'completed' ? '#c6f6d5' : '#bee3f8'),
    color: s === 'pending' ? '#9c4221' : (s === 'completed' ? '#22543d' : '#2a4365'),
    letterSpacing: '0.05em'
});

export default ProviderDashboard;