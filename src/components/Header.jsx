import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useLocation as useLocationContext } from '../context/LocationContext'; 
import './Header.css'; 

const Header = () => {
    const navigate = useNavigate();
    
    
    const { isLoggedIn, logout, userRole, userName } = useAuth(); 
    
    const displayUserName = userName || localStorage.getItem('user_name') || "User";

    const { 
        locations, 
        selectedLocation, 
        updateLocation, 
    } = useLocationContext();

    const handleLocationChange = (e) => {
        const selectedId = e.target.value;
        const newLocation = locations.find(loc => String(loc.location_id) === selectedId);
        if (newLocation) {
            updateLocation(newLocation);
        }
    };

    const handleLogout = () => {
        logout(); 
        navigate('/login'); 
    };

    // --- Styles ---
    const headerStyle = {
        backgroundColor: '#1E3A8A', 
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'fixed', 
        width: '100%',
        top: 0,
        zIndex: 1000,
        boxSizing: 'border-box'
    };

    const navStyle = { display: 'flex', alignItems: 'center', gap: '20px' };
    const linkStyle = { color: 'white', textDecoration: 'none', fontWeight: 'bold' };
    const logoStyle = { fontSize: '24px', fontWeight: 'bolder', cursor: 'pointer', color: 'white', textDecoration: 'none' };

    return (
        <header style={headerStyle}>
            {/* Logo */}
            <Link to="/" style={logoStyle}>SkillHub</Link>

            <nav style={navStyle}>
                {/* Location Selector */}
                <select 
                    onChange={handleLocationChange} 
                    value={selectedLocation ? String(selectedLocation.location_id) : ""}
                    style={{ padding: '5px', borderRadius: '5px', border: 'none', outline: 'none' }}
                >
                    {locations.map((loc) => (
                        <option key={loc.location_id} value={String(loc.location_id)}>
                            {loc.city} ({loc.area})
                        </option>
                    ))}
                </select>

                <Link to="/" style={linkStyle}>Home</Link>
                
                {isLoggedIn ? ( 
                    <>
                        {/* CUSTOMER LINKS */}
                        {userRole === 'customer' && (
                            <>
                                <Link to="/services" style={linkStyle}>Services</Link>
                                <Link to="/my-orders" style={linkStyle}>My Bookings</Link>
                            </>
                        )}

                        {/* PROVIDER LINKS */}
                        {userRole === 'provider' && (
                            <Link to="/provider/dashboard" style={linkStyle}>Dashboard</Link>
                        )}
                        
                        {/* User Info & Logout */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
                            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Hi, {displayUserName}</span>
                            <button 
                                onClick={handleLogout} 
                                style={{ 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '6px 15px', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: '0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#dc2626'}
                                onMouseOut={(e) => e.target.style.background = '#ef4444'}
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={linkStyle}>Login</Link>
                        <Link to="/signup" style={linkStyle}>Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;