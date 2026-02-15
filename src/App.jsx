import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import { AuthProvider } from './context/AuthContext'; 
import { LocationProvider } from './context/LocationContext'; 

import Login from './components/Login/Login'; 
import Signup from './components/Signup/Signup'; 
import Home from './pages/Home'; 
import ServicesPage from './pages/ServicesPage'; 
import ProviderListPage from './pages/ProviderListPage'; 
import ProviderDetailPage from './pages/ProviderDetailPage'; 
import MyOrders from './components/MyOrders/MyOrders'; 
import ProviderDashboard from './components/Provider/ProviderDashboard';


import CompleteProfile from './Provider/CompleteProfile'; 

function App() {
    return (
        <Router> 
            <AuthProvider> 
                <LocationProvider> 
                    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <Header /> 
                        <div style={{ flexGrow: 1 }}>
                            <Routes>
                                {/* === PUBLIC ROUTES === */}
                                <Route path="/" element={<Home />} /> 
                                <Route path="/login" element={<Login />} /> 
                                <Route path="/signup" element={<Signup />} /> 
                                <Route path="/providers" element={<ProviderListPage />} />

                                {/* === PROVIDER PROTECTED ROUTES === */}
                                <Route element={<ProtectedRoute requiredRole="provider" />}>
                                    {/* 🔥 Setup Page Route */}
                                    <Route path="/provider/complete-profile" element={<CompleteProfile />} />
                                    <Route path="/provider/dashboard" element={<ProviderDashboard />} />
                                </Route>

                                {/* Dynamic ID route  */}
                                <Route path="/provider/:id" element={<ProviderDetailPage />} />

                                {/* === CUSTOMER PROTECTED ROUTES === */}
                                <Route element={<ProtectedRoute requiredRole="customer" />}>
                                    <Route path="/services" element={<ServicesPage />} />
                                    <Route path="/my-orders" element={<MyOrders />} />
                                </Route>

                                <Route path="*" element={<h2 style={{marginTop: '100px', textAlign: 'center'}}>404 Page Not Found</h2>} />
                            </Routes>
                        </div>
                    </div>
                </LocationProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;