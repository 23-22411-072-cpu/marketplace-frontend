import React, { useState } from 'react';
import './BookingModal.css';

const BookingModal = ({ provider, onClose }) => {
    const [formData, setFormData] = useState({
        scheduled_at: '',
        customer_address: '',
        notes: '',
        payment_method: 'COD',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
     
        const orderData = {
            provider_user_id: provider.provider_id, 
            service_id: 6, 
            location_id: provider.location_id,
            total_price: provider.price_range,
            ...formData
        };

        console.log("Final Order for Backend:", orderData);
        alert("Booking details captured! Now you can call Axios.");
        onClose(); 
    };

    return (
        <div className="modal-backdrop">
            <div className="booking-modal-content">
                <div className="modal-header">
                    <h2>Book Service</h2>
                    <button onClick={onClose} className="close-x">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="provider-info-mini">
                        <p><strong>Provider:</strong> {provider.bio}</p>
                        <p><strong>Rate:</strong> Rs. {provider.price_range} /hr</p>
                    </div>

                    <div className="form-field">
                        <label>Schedule Date & Time</label>
                        <input type="datetime-local" name="scheduled_at" required onChange={handleChange} />
                    </div>

                    <div className="form-field">
                        <label>Service Address</label>
                        <textarea name="customer_address" placeholder="Enter full address..." required onChange={handleChange}></textarea>
                    </div>

                    <div className="form-field">
                        <label>Notes for Provider</label>
                        <textarea name="notes" placeholder="Any specific problem? (Optional)" onChange={handleChange}></textarea>
                    </div>

                    <div className="form-field">
                        <label>Payment Method</label>
                        <select name="payment_method" onChange={handleChange} value={formData.payment_method}>
                            <option value="COD">Cash on Delivery (After Job)</option>
                            <option value="Online">Online Payment</option>
                        </select>
                    </div>

                    <button type="submit" className="confirm-booking-btn">Confirm Order</button>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;