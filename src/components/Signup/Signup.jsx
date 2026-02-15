// src/components/Signup/Signup.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        role: 'customer', 
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (formData.password !== formData.password_confirmation) {
            setError('Password and Confirm Password do not match.');
            return;
        }

        setIsLoading(true);
        
        try {
            // Laravel API Endpoint: /register
            const response = await api.post('/register', formData);
            
            console.log("Registration Successful:", response.data);
            alert('Registration successful! You can now log in.');
            
            // Registration success, redirect to Login
            navigate('/login'); 

        } catch (err) {
            console.error("Registration Failed:", err.response || err);
            
            let errorMessage = "Registration failed. Please check all fields.";
            if (err.response && err.response.data && err.response.data.errors) {
                // Handle Laravel validation errors
                const validationErrors = err.response.data.errors;
                // Take the first error message from the response
                errorMessage = Object.values(validationErrors).flat()[0] || errorMessage;
            } else if (err.response && err.response.data.message) {
                 errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
            
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit} className="signup-form">
                <h2>Create a New Account</h2>
                
                {/* Display Error Message */}
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Full Name */}
                <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                />
                
                {/* Email */}
                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                
                {/* Phone */}
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={handleChange}
                />

                {/* Password */}
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                
                {/* Confirm Password (Crucial for Laravel API) */}
                <input
                    type="password"
                    name="password_confirmation"
                    placeholder="Confirm Password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                />
                
                {/* Role Selection */}
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                </select>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
                
                <p className="login-link">
                    Already have an account? <Link to="/login">Login here.</Link>
                </p>
            </form>
        </div>
    );
};
export default Signup;