import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext'; 
import { useNavigate } from 'react-router-dom'; 
import '../pages/ServicesPage.css'; 

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { authToken } = useAuth(); 
    const { selectedLocation, loading: locationLoading } = useLocation(); 
    const navigate = useNavigate(); 

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const handleSelectService = (serviceId, serviceName) => {
        navigate(`/providers?service_id=${serviceId}&service_name=${serviceName}`);
    };

    useEffect(() => {
        if (locationLoading) return;
        
        if (!selectedLocation) {
            setError("Please select a location to view services.");
            setLoading(false);
            return;
        }

        const fetchServices = async () => {
            setLoading(true);
            try {
                const locationId = selectedLocation.location_id; 
                
                const response = await axios.get(`${API_BASE_URL}/services`, {
                    params: {
                        location_id: locationId
                    },
                });
                
                const fetchedServices = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data.services && Array.isArray(response.data.services) ? response.data.services : []); 

                setServices(fetchedServices);
                setError(null);
            } catch (err) {
                console.error("Error fetching services:", err);
                setError(err.message || 'An unexpected error occurred while fetching services.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
        
    }, [selectedLocation, locationLoading]); 

    if (loading || locationLoading) {
        return <div className="services-page-container">Loading services for {selectedLocation?.city || 'selected location'}...</div>;
    }

    if (error) {
        return <div className="services-page-container error-message">Error: {error}</div>;
    }

    return (
        <div className="services-page-container">
            <div style={{ paddingTop: '80px' }}> 
                <h1 className="page-title">Available Services in {selectedLocation?.city} ({selectedLocation?.area})</h1>
            </div>
            
            {services.length === 0 ? (
                <p className="no-services-message">No services are currently available in {selectedLocation?.city}.</p>
            ) : (
                <div className="services-list">
                    {services.map((service) => (
                        <div key={service.service_id} className="service-card">
                            <h3 className="service-name">{service.service_name}</h3>
                            <p className="service-description">{service.description}</p>
                            
                            <div className="service-footer" style={{ justifyContent: 'center' }}>
                                {/* Price line removed for a cleaner look */}
                                <button 
                                    className="book-btn"
                                    onClick={() => handleSelectService(service.service_id, service.service_name)} 
                                    style={{ width: '100%' }}
                                >
                                    View Providers
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServicesPage;