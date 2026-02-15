import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LocationContext = createContext();


export const useLocation = () => useContext(LocationContext);
export const useLocationContext = () => useContext(LocationContext); 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'; 

export const LocationProvider = ({ children }) => {
    const [locations, setLocations] = useState([]); 
    const [selectedLocation, setSelectedLocation] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const updateLocation = (location) => {
        setSelectedLocation(location);
        localStorage.setItem('selectedLocation', JSON.stringify(location));
    };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/locations`);
                
                const fetchedLocations = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data.locations && Array.isArray(response.data.locations) ? response.data.locations : []); 

                if (fetchedLocations.length > 0) {
                    setLocations(fetchedLocations);
                    
                    const storedLocation = JSON.parse(localStorage.getItem('selectedLocation'));
                    
                   
                    if (storedLocation && fetchedLocations.some(loc => (loc.location_id || loc.id) === (storedLocation.location_id || storedLocation.id))) {
                        setSelectedLocation(storedLocation);
                    } else {
                        setSelectedLocation(fetchedLocations[0]);
                        localStorage.setItem('selectedLocation', JSON.stringify(fetchedLocations[0]));
                    }
                    setError(null);
                } else {
                    setError('API returned no locations.');
                }
            } catch (err) {
                console.error("LOCATION CONTEXT: Network/API Error:", err.message);
                setError('Failed to connect to backend API for locations.');
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const contextValue = {
        locations,
        selectedLocation,
        updateLocation,
        loading,
        error,
    };

    return (
        <LocationContext.Provider value={contextValue}>
            {children}
        </LocationContext.Provider>
    );
};