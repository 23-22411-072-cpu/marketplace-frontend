import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import { useLocation as useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext'; 

const BookingModal = ({ provider, selectedLocation, onClose, onSubmit }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        scheduled_at: '',
        customer_address: '',
        notes: '',
    });
    
    const rate = provider.hourly_rate || 1000;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedDate = formData.scheduled_at.replace('T', ' ') + ":00";

        const bookingPayload = {
            provider_user_id: provider.user_id, 
            customer_id: user?.id,
            service_id: provider.services?.[0]?.service_id || 1, 
            location_id: selectedLocation?.location_id,
            total_price: rate,
            scheduled_at: formattedDate,
            customer_address: `${formData.customer_address}, ${selectedLocation?.area}`,
            notes: formData.notes || "No notes provided",
            payment_method: 'COD',
            status: 'pending'
        };
        onSubmit(bookingPayload); 
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                    <h2 style={{margin: 0, fontSize: '1.2rem', color: 'white'}}>Confirm Booking</h2>
                    <button onClick={onClose} style={closeXStyle}>&times;</button>
                </div>
                <div style={scrollableBodyStyle} className="modal-scroll-area">
                    <form onSubmit={handleSubmit} style={{padding: '20px'}}>
                        <div style={providerMiniCard}>
                            <p style={{margin: '0', color: '#1f3a5f', fontWeight: 'bold'}}>Provider: {provider.user?.full_name}</p>
                            <p style={{margin: '5px 0 0 0', color: '#28a745', fontWeight: '800'}}>Total Price: Rs. {rate}</p>
                        </div>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>WHEN DO YOU NEED THE SERVICE? (Choose Future Time)</label>
                            <input 
                                type="datetime-local" 
                                required 
                                min={new Date().toISOString().slice(0, 16)}
                                onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})} 
                                style={inputStyle} 
                            />
                        </div>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>HOUSE / STREET ADDRESS</label>
                            <input 
                                type="text" 
                                placeholder="e.g. House #123, Street 5" 
                                required 
                                onChange={(e) => setFormData({...formData, customer_address: e.target.value})} 
                                style={inputStyle} 
                            />
                            <div style={restrictionBadge}>📍 Service Area: <strong>{selectedLocation?.area}</strong></div>
                        </div>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>NOTES FOR PROVIDER</label>
                            <textarea 
                                placeholder="Any specific instructions..." 
                                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                                style={{...inputStyle, height: '80px', resize: 'none'}} 
                            />
                        </div>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>PAYMENT METHOD</label>
                            <div style={codBoxStyle}>💵 Cash After Service (COD)</div>
                        </div>
                        <button type="submit" className="confirm-booking-btn">Confirm Booking</button>
                        <button type="button" onClick={onClose} style={cancelButtonStyle}>Cancel</button>
                    </form>
                </div>
            </div>
            <style>{`
                .modal-scroll-area::-webkit-scrollbar { width: 6px; }
                .modal-scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .confirm-booking-btn { width: 100%; padding: 14px; background-color: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 10px; transition: 0.3s; }
                .confirm-booking-btn:hover { background-color: #218838; }
            `}</style>
        </div>
    );
};

const ProviderListPage = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { selectedLocation, loading: locationLoading } = useLocationContext();
    const serviceId = new URLSearchParams(location.search).get('service_id');

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                let url = `/providers?service_id=${serviceId}`;
                if (selectedLocation?.location_id) url += `&location_id=${selectedLocation.location_id}`;
                const response = await api.get(url);
                setProviders(response.data.providers || []);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        if (!locationLoading && serviceId) fetchProviders();
    }, [serviceId, selectedLocation, locationLoading]);

    const handleBookingSubmit = async (data) => {
        try {
            await api.post('/orders', data);
            alert("Booking Placed Successfully!");
            setIsModalOpen(false);
            navigate('/my-orders');
        } catch (err) {
            console.error("Booking Error:", err.response);
            if (err.response?.status === 422) {
                const validationErrors = err.response.data.errors;
                let errorMessage = "Validation Failed:\n";
                for (let key in validationErrors) {
                    errorMessage += `- ${validationErrors[key].join(", ")}\n`;
                }
                alert(errorMessage);
            } else if (err.response?.status === 401) {
                alert("Session Expired! Please login again.");
                navigate('/login');
            } else {
                alert(`Booking Failed: ${err.response?.data?.message || "Server Error"}`);
            }
        }
    };

    if (loading) return <div style={{paddingTop: '100px', textAlign: 'center'}}>Loading...</div>;

    return (
        <div style={pageContainerStyle}>
            <h1 style={{textAlign: 'center', marginBottom: '30px', color: '#1f3a5f'}}>Available Providers</h1>
            <div style={{overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>NAME</th>
                            <th style={thStyle}>SKILLS/DESCRIPTION</th>
                            <th style={thStyle}>LOCATION</th>
                            <th style={thStyle}>EXP.</th>
                            <th style={thStyle}>PHONE</th> {/* Column Header */}
                            <th style={thStyle}>PRICE/HR</th>
                            <th style={thStyle}>RATING</th>
                            <th style={thStyle}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map(p => (
                            <tr key={p.user_id} style={{borderBottom: '1px solid #eee'}}>
                                <td style={tdNameStyle}>{p.user?.full_name}</td>
                                <td style={tdStyle}>{p.description}</td>
                                <td style={tdStyle}>{p.location?.area}</td>
                                <td style={tdStyle}>{p.experience_years} yrs</td>
                                
                                {/* Column Data */}
                                <td style={tdStyle}>
                                    <a href={`tel:${p.user?.phone}`} style={{color: '#3b5998', textDecoration: 'none', fontWeight: 'bold'}}>
                                        {p.user?.phone || 'N/A'}
                                    </a>
                                </td>

                                <td style={tdPriceStyle}>Rs. {p.hourly_rate}</td>
                                <td style={tdStyle}>⭐ {p.average_rating || '0.0'}</td>
                                <td style={tdStyle}>
                                    <button style={bookButtonStyle} onClick={() => {setSelectedProvider(p); setIsModalOpen(true);}}>Book Now</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <BookingModal provider={selectedProvider} selectedLocation={selectedLocation} onClose={() => setIsModalOpen(false)} onSubmit={handleBookingSubmit} />}
        </div>
    );
};

// --- STYLES ---
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const modalContentStyle = { backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '420px', display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflow: 'hidden' };
const modalHeaderStyle = { background: '#3b5998', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 };
const scrollableBodyStyle = { overflowY: 'auto', flex: 1 };
const closeXStyle = { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' };
const providerMiniCard = { background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '5px solid #3b5998' };
const formGroupStyle = { marginBottom: '15px' };
const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '11px', color: '#555', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' };
const restrictionBadge = { marginTop: '5px', fontSize: '11px', color: '#666', background: '#f1f1f1', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' };
const codBoxStyle = { padding: '12px', background: '#f0f9ff', border: '1px dashed #3b5998', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', color: '#1e3a8a' };
const cancelButtonStyle = { width: '100%', padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const pageContainerStyle = { padding: '120px 5% 40px 5%', background: '#f7f7f7', minHeight: '100vh' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', background: 'white' };
const thStyle = { padding: '15px', background: '#3b5998', color: 'white', textAlign: 'left', fontSize: '12px' };
const tdStyle = { padding: '15px', color: '#333', fontSize: '13px', borderBottom: '1px solid #eee' };
const tdNameStyle = { ...tdStyle, fontWeight: 'bold', color: '#1f3a5f' };
const tdPriceStyle = { ...tdStyle, fontWeight: 'bold', color: '#28a745' };
const bookButtonStyle = { padding: '8px 16px', background: '#00c853', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };

export default ProviderListPage;
