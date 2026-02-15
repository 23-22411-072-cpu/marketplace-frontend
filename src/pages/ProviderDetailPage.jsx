import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios'; 
import { useLocation as useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext'; 
import './ProviderListPage.css';

const BookingModal = ({ provider, selectedLocation, onClose, onSubmit }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ scheduled_at: '', customer_address: '', notes: '' });
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
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Confirm Booking</h2>
                    <button onClick={onClose} className="close-x">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="booking-form">
                    <p><strong>Provider:</strong> {provider.user?.full_name}</p>
                    <p><strong>Price:</strong> Rs. {rate}</p>
                    <input type="datetime-local" required onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})} />
                    <input type="text" placeholder="Address" required onChange={(e) => setFormData({...formData, customer_address: e.target.value})} />
                    <textarea placeholder="Notes" onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                    <button type="submit" className="confirm-btn">Confirm</button>
                    <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                </form>
            </div>
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
            alert("Booking Placed!");
            setIsModalOpen(false);
            navigate('/my-orders');
        } catch (err) { alert("Failed!"); }
    };

    if (loading) return <div className="p-5 text-center">Loading Providers...</div>;

    return (
        <div className="provider-list-page">
            <h2 className="text-center mb-4">Available Providers</h2>
            <div className="table-responsive">
                <table className="providers-table">
                    <thead>
                        <tr>
                            <th>NAME</th>
                            <th>DESCRIPTION</th>
                            <th>LOCATION</th>
                            <th>EXP.</th>
                            <th>PHONE</th>
                            <th>PRICE/HR</th>
                            <th>RATING</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map(p => (
                            <tr key={p.user_id}>
                                <td>
                                    <Link to={`/provider/${p.user_id}`} className="provider-link">
                                        {p.user?.full_name}
                                    </Link>
                                </td>
                                <td>{p.description}</td>
                                <td>{p.location?.area}</td>
                                <td>{p.experience_years}</td>
                                <td>{p.user?.phone}</td>
                                <td>Rs. {p.hourly_rate}</td>
                                <td>⭐ {p.average_rating || '0.0'}</td>
                                <td>
                                    <button className="book-btn-green" onClick={() => {setSelectedProvider(p); setIsModalOpen(true);}}>
                                        Book
                                    </button>
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

export default ProviderListPage;