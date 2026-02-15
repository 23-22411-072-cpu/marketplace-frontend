import React from 'react';
import { Link } from 'react-router-dom'; 
import '../styles/Home.css'; 

const Home = () => {
    return (
        <div className="home-page">
            
            {/* 1. HERO SECTION */}
            <section className="hero-section d-flex align-items-center justify-content-center text-center">
                <div className="container hero-content">
                    <h1 className="fw-bold mb-3 hero-title">Welcome to SkillHub</h1>
                    <p className="lead mb-4 hero-subtitle">Your one-stop platform to find trusted local service providers.</p>
                    
                    {/* Search Form  */}
                </div>
            </section>

            {/* 2. JOIN SECTION (CTA Cards) */}
            <section id="join" className="join-section py-5 text-center">
                <div className="container">
                    <h2 className="fw-bold mb-5 section-title">Join SkillHub Today</h2>
                    <div className="row g-4 justify-content-center">
                        
                        {/* Provider Card */}
                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="join-card">
                                <i className="bi bi-tools join-icon"></i> 
                                <h5>Register as Provider</h5>
                                <p>Offer your skills locally and start earning.</p>
                                <Link to="/register-provider" className="btn join-btn-custom mt-2 w-100">Start Earning</Link>
                            </div>
                        </div>
                        
                        {/* Customer/Find Services Card */}
                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="join-card">
                                <i className="bi bi-person-badge join-icon"></i>
                                <h5>Find Services</h5>
                                <p>Hire qualified skilled locals now.</p>
                                <Link to="/services" className="btn join-btn-custom mt-2 w-100">Get Quotes</Link>
                            </div>
                        </div>
                        
                        {/* Ratings Card */}
                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="join-card">
                                <i className="bi bi-journal-text join-icon"></i>
                                <h5>Check Ratings</h5>
                                <p>View verified reviews and provider profiles.</p>
                                <Link to="/about" className="btn join-btn-custom mt-2 w-100">Learn More</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. ABOUT SECTION */}
            <div className="container">
                 <section id="about" className="about-section my-5 text-center">
                    <h2 className="fw-bold mb-3 section-title text-white">About SkillHub</h2>
                    <p className="mx-auto" style={{maxWidth:'700px'}}>SkillHub connects customers with verified local service providers. We make finding reliable professionals easy, fast, and trustworthy — while helping skilled workers build their online presence.</p>
                </section>
            </div>

            {/* 4. FOOTER */}
            <footer className="footer-custom text-center">
                <div className="container">
                    <p className="mb-0">© 2025 SkillHub — All Rights Reserved</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;