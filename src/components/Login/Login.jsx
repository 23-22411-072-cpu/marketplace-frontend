import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate, Link } from 'react-router-dom'; 
import api from '../../api/axios'; 
import './Login.css'; 

function Login() {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null); 

    const handleSubmit = async (e) => { 
        e.preventDefault();
        setIsLoading(true);
        setError(null); 
        
        try {
            const response = await api.post('/login', { email, password });
            
            
            const token = response.data.token || response.data.access_token;
            const user = response.data.user;

            if (!token) {
                setError("Login failed: No token received.");
                setIsLoading(false);
                return;
            }

            // --- USER DETAILS EXTRACTION ---
            const userRole = user?.role; 
            
           
            const userName = user?.name || user?.full_name || user?.username || "User";

            // Debugging
            console.log("Login Success! User Name:", userName);
            console.log("User Role:", userRole);

            
            login(token, userRole, userName); 

            // 2. Profile Check Logic 
            if (userRole === 'provider') {
                try {
                    
                    const profileCheck = await api.get('/provider/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (profileCheck.data && profileCheck.data.profile) {
                        console.log("Profile exists, going to dashboard.");
                        navigate('/provider/dashboard');
                    } else {
                        console.log("Profile empty, going to complete-profile.");
                        navigate('/provider/complete-profile');
                    }
                } catch (err) {
                    console.log("Profile not found, redirecting to setup.");
                    navigate('/provider/complete-profile');
                }
            } else {
                
                navigate('/services');
            }

        } catch (error) {
            console.error("Login Error:", error);
            const errorMessage = error.response?.data?.message || "Invalid credentials.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2 className="login-title">User Login</h2>
                
                {error && (
                    <div style={{
                        color: 'red', 
                        backgroundColor: '#ffdada', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}
                
                <div className="form-group">
                    <label className="form-label-custom">Email:</label>
                    <input 
                        type="email" 
                        className="form-control-custom" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="Enter your email"
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label-custom">Password:</label>
                    <input 
                        type="password" 
                        className="form-control-custom" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="Enter your password"
                    />
                </div>
                
                <button type="submit" className="login-btn-custom" disabled={isLoading}>
                    {isLoading ? 'Logging In...' : 'Login'}
                </button>
                
                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                    Don't have an account? <Link to="/signup">Register here.</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;