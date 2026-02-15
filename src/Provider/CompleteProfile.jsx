import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useLocation } from '../context/LocationContext'; 

const CompleteProfile = () => {
    const navigate = useNavigate();
    const { selectedLocation } = useLocation(); 
    const [servicesList, setServicesList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        description: '',       
        hourly_rate: '',      
        experience_years: '', 
        service_id: '',       
        skills: ''            
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/services');
                setServicesList(response.data.services || response.data);
            } catch (err) {
                console.error("Error:", err);
            }
        };
        fetchServices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLocation) { alert("Please select a city!"); return; }
        setLoading(true);
        try {
            await api.put('/provider/profile', {
                ...formData,
                location_id: selectedLocation.location_id || selectedLocation.id,
                availability_status: 'available'
            });
            await api.post('/provider/services', {
                services: [{ service_id: formData.service_id, price: formData.hourly_rate }]
            });
            alert("Profile Saved!");
            navigate('/provider/dashboard');
        } catch (err) {
            alert("Error saving data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Header />
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <h2 style={titleStyle}>Professional Profile Setup</h2>
                    <p style={subtitleStyle}>
                        Working in: <strong style={{color: '#2b6cb0'}}>{selectedLocation?.name || "Select City"}</strong>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Service Category</label>
                            <select style={inputStyle} required value={formData.service_id} onChange={(e) => setFormData({...formData, service_id: e.target.value})}>
                                <option value="">-- Select --</option>
                                {servicesList.map(s => (
                                    <option key={s.id || s.service_id} value={s.id || s.service_id}>{s.name || s.service_name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{flex: 1}}>
                                <label style={labelStyle}>Experience</label>
                                <input type="number" style={inputStyle} required value={formData.experience_years} onChange={(e) => setFormData({...formData, experience_years: e.target.value})} />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={labelStyle}>Rate (PKR)</label>
                                <input type="number" style={inputStyle} required value={formData.hourly_rate} onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})} />
                            </div>
                        </div>

                        <div style={fieldGroup}>
                            <label style={labelStyle}>Skills</label>
                            <input type="text" style={inputStyle} value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} />
                        </div>

                        <div style={fieldGroup}>
                            <label style={labelStyle}>Bio</label>
                            <textarea style={{...inputStyle, height: '80px'}} required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                        </div>

                        <button type="submit" disabled={loading} style={btnStyle}>
                            {loading ? "Saving..." : "Finish Setup"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- STYLES WITH DARK TEXT (Visible Colors) ---
const containerStyle = { padding: '100px 20px 40px', display: 'flex', justifyContent: 'center' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const titleStyle = { color: '#1a202c', textAlign: 'center', marginBottom: '10px' };
const subtitleStyle = { textAlign: 'center', marginBottom: '20px', color: '#4a5568' };
const fieldGroup = { marginBottom: '15px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2d3748' }; // Dark color
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', color: '#1a202c', background: '#fff' }; // Visible input text
const btnStyle = { width: '100%', background: '#3182ce', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

export default CompleteProfile;