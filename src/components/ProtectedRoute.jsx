import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



const ProtectedRoute = ({ requiredRole }) => {
    const { isLoggedIn, userRole } = useAuth();

    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />; 
    }

   
    if (requiredRole && userRole !== requiredRole) {
       
        return <Navigate to="/" replace />; 
    }
    
   
    return <Outlet />;
};

export default ProtectedRoute;