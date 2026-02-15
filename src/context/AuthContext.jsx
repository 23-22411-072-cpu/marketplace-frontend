// src/context/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';
import api from '../api/axios'; 

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // State Initialization 
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('auth_token'));
    const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || null);
    const [userName, setUserName] = useState(localStorage.getItem('user_name') || null); 

    // === LOGIN FUNCTION ===
    const login = (token, role, name) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_name', name); 
        
        setIsLoggedIn(true);
        setUserRole(role);
        setUserName(name); 
    };

    // === LOGOUT FUNCTION (Updated for Token Revocation) ===
    const logout = async () => {
        try {
            
            const token = localStorage.getItem('auth_token');

           
            await api.post('/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }); 
            console.log("Token successfully revoked from database.");
        } catch (error) {
            
            console.error("Logout API failed, but clearing local storage:", error);
        }
        
       
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        
       
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName(null); 
    };

    
    const contextValue = {
        isLoggedIn,
        userRole,
        login,
        logout,
        userName, 
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};