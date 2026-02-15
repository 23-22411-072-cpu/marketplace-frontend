import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Header from '../Header';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Rating Modal States
    const [showRateModal, setShowRateModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/customer'); 
           
            setOrders(response.data.orders || []);
        } catch (err) {
            console.error("Fetch Orders Error:", err.response || err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchOrders(); 
    }, [fetchOrders]);

    // Booking cancellation
    const handleCancel = async (orderId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                const response = await api.put(`/orders/${orderId}/cancel`);
                alert(response.data.message);
                fetchOrders();
            } catch (err) {
                alert(err.response?.data?.message || "Something went wrong.");
            }
        }
    };

    //  Rating Submit 
    const handleSubmitRating = async () => {
        if (!selectedOrderId) return;
        try {
            const response = await api.post(`/orders/${selectedOrderId}/rate`, {
                rating: rating,
                comment: comment
            });
            alert(response.data.message);
            setShowRateModal(false);
            setComment("");
            setRating(5); 
            fetchOrders(); 
        } catch (err) {
            alert(err.response?.data?.message || "Rating submit nahi ho saki.");
        }
    };

    if (loading) {
        return (
            <div style={{ background: '#f7fafc', minHeight: '100vh' }}>
                <Header />
                <div style={{padding: '150px', textAlign: 'center', fontSize: '1.2rem', color: '#4a5568'}}>
                    ⌛ Fetching your bookings...
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f7fafc', minHeight: '100vh' }}>
            <Header />
            <div style={{ padding: '120px 8% 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#2d3748', fontWeight: 'bold', margin: 0 }}>My Bookings</h2>
                    <button onClick={fetchOrders} style={refreshBtnStyle}>
                        🔄 Refresh
                    </button>
                </div>
                
                {orders.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <p>No bookings found at the moment.</p>
                    </div>
                ) : (
                    <div style={gridStyle}>
                        {orders.map(order => (
                            <div key={order.id} style={cardStyle}>
                                <div style={cardHeaderStyle}>
                                    <span style={{ color: '#4a5568', fontWeight: 'bold' }}>Order #{order.id}</span>
                                    <span style={statusBadge(order.status)}>{order.status?.toUpperCase()}</span>
                                </div>
                                
                                <div style={{ color: '#1a202c', fontSize: '15px' }}>
                                    <p style={{margin: '8px 0'}}><strong>Service:</strong> {order.service?.service_name || 'N/A'}</p>
                                    <p style={{margin: '8px 0'}}><strong>Provider:</strong> {order.provider?.full_name || order.provider?.name || 'Assigned soon'}</p>
                                    <p style={{margin: '8px 0'}}><strong>Date:</strong> {order.scheduled_at ? new Date(order.scheduled_at).toLocaleDateString() : 'TBD'}</p>
                                    <p style={{margin: '8px 0'}}><strong>Payment:</strong> {order.payment_method || 'COD'}</p>
                                    <p style={priceStyle}>
                                        Rs. {order.total_price}
                                    </p>
                                </div>

                                <div style={cardActionStyle}>
                                    {/* Cancel button */}
                                    {order.status === 'pending' && (
                                        <button onClick={() => handleCancel(order.id)} style={cancelBtnStyle}>
                                            Cancel Booking
                                        </button>
                                    )}

                                    {/* Review button */}
                                    {order.status === 'completed' && !order.review && (
                                        <button 
                                            onClick={() => { setSelectedOrderId(order.id); setShowRateModal(true); }} 
                                            style={rateBtnStyle}
                                        >
                                            Rate Service
                                        </button>
                                    )}
                                    
                                    {/* when review is seen in database */}
                                    {order.review && (
                                        <div style={alreadyRatedStyle}>
                                            <span>⭐ Rated: {order.review.rating}/5</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/*  RATING MODAL */}
            {showRateModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1a202c', textAlign: 'center' }}>
                            Rate Your Experience
                        </h3>
                        
                        <div style={{ marginBottom: '20px', fontSize: '32px', textAlign: 'center' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                    key={star} 
                                    onClick={() => setRating(star)} 
                                    style={{ 
                                        cursor: 'pointer', 
                                        color: star <= rating ? '#ecc94b' : '#cbd5e1', 
                                        marginRight: '8px',
                                        transition: '0.2s'
                                    }}
                                >
                                    ★
                                </span>
                            ))}
                            <p style={{ fontSize: '14px', color: '#718096', marginTop: '5px' }}>
                                Your Rating: {rating} / 5
                            </p>
                        </div>

                        <textarea 
                            placeholder="How was the service? (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={textareaStyle}
                        />

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => setShowRateModal(false)} style={closeBtnStyle}>Close</button>
                            <button onClick={handleSubmitRating} style={submitBtnStyle}>Submit Rating</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- CSS STYLES ---
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const cardHeaderStyle = { borderBottom: '1px solid #edf2f7', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const cardActionStyle = { marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' };
const priceStyle = { color: '#2f855a', fontSize: '18px', fontWeight: 'bold', marginTop: '12px' };

const refreshBtnStyle = { padding: '8px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#fff' };
const cancelBtnStyle = { color: '#e53e3e', border: '1px solid #feb2b2', background: '#fff5f5', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const rateBtnStyle = { color: '#fff', background: '#3182ce', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const alreadyRatedStyle = { color: '#2f855a', fontSize: '14px', fontWeight: 'bold', background: '#f0fff4', padding: '6px 12px', borderRadius: '6px', border: '1px solid #c6f6d5' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalContentStyle = { background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const textareaStyle = { width: '100%', height: '100px', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' };
const closeBtnStyle = { padding: '8px 18px', border: 'none', background: '#edf2f7', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' };
const submitBtnStyle = { padding: '8px 18px', border: 'none', background: '#1E3A8A', color: 'white', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' };
const emptyStateStyle = { textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#718096', fontSize: '18px' };

const statusBadge = (s) => ({
    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
    background: s === 'pending' ? '#feebc8' : (s === 'cancelled' ? '#fed7d7' : (s === 'completed' ? '#c6f6d5' : '#bee3f8')),
    color: s === 'pending' ? '#c05621' : (s === 'cancelled' ? '#c53030' : (s === 'completed' ? '#22543d' : '#2b6cb0'))
});

export default MyOrders;