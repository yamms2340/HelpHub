import React, { useState, useEffect } from 'react';
import './RedeemModel.css';

const RedeemModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  reward, 
  userCoins, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    contactEmail: '',
    contactPhone: '',
    specialInstructions: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form when modal opens
      setFormData({
        deliveryAddress: '',
        contactEmail: '',
        contactPhone: '',
        specialInstructions: ''
      });
      setErrors({});
      
      // Focus on first input after animation
      setTimeout(() => {
        const firstInput = document.querySelector('.redeem-modal input, .redeem-modal textarea');
        if (firstInput) firstInput.focus();
      }, 200);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!/^\d{10}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm(formData);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !reward) return null;

  const insufficientFunds = userCoins && userCoins.totalCoins < reward.coinsCost;

  return (
    <div className="redeem-modal-overlay" onClick={handleOverlayClick}>
      <div className="redeem-modal">
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close modal"
        >
          <span className="close-icon">×</span>
        </button>

        <div className="modal-header">
          <div className="header-icon">🎁</div>
          <div className="header-content">
            <h2>Confirm Redemption</h2>
            <p>Complete your reward redemption</p>
          </div>
        </div>

        <div className="modal-body">
          {/* Reward Summary */}
          <div className="reward-summary">
            <div className="reward-image">
              <img 
                src={reward.image || '/placeholder-reward.jpg'} 
                alt={reward.title}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=100&fit=crop';
                }}
              />
            </div>
            
            <div className="reward-info">
              <h3 className="reward-title">{reward.title}</h3>
              <p className="reward-description">{reward.description}</p>
              
              <div className="cost-breakdown">
                <div className="cost-row">
                  <span className="cost-label">Reward Cost:</span>
                  <div className="cost-value">
                    <span className="coin-icon">🪙</span>
                    <span className="amount">{reward.coinsCost}</span>
                    <span className="unit">coins</span>
                  </div>
                </div>
                
                <div className="cost-row">
                  <span className="cost-label">Your Balance:</span>
                  <div className="cost-value">
                    <span className="coin-icon">💰</span>
                    <span className={`amount ${insufficientFunds ? 'insufficient' : ''}`}>
                      {userCoins?.totalCoins || 0}
                    </span>
                    <span className="unit">coins</span>
                  </div>
                </div>
                
                <div className="cost-row total">
                  <span className="cost-label">After Redemption:</span>
                  <div className="cost-value">
                    <span className="coin-icon">🏦</span>
                    <span className={`amount ${insufficientFunds ? 'insufficient' : 'remaining'}`}>
                      {Math.max(0, (userCoins?.totalCoins || 0) - reward.coinsCost)}
                    </span>
                    <span className="unit">coins</span>
                  </div>
                </div>
              </div>

              {insufficientFunds && (
                <div className="insufficient-warning">
                  <span className="warning-icon">⚠️</span>
                  <span>Insufficient coins! You need {reward.coinsCost - (userCoins?.totalCoins || 0)} more coins.</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Form */}
          {!insufficientFunds && (
            <form onSubmit={handleSubmit} className="delivery-form">
              <div className="form-section">
                <h4>Delivery Information</h4>
                
                <div className="form-group">
                  <label htmlFor="deliveryAddress">
                    Delivery Address <span className="required">*</span>
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="Enter your complete delivery address..."
                    rows={3}
                    className={errors.deliveryAddress ? 'error' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.deliveryAddress && (
                    <span className="error-message">{errors.deliveryAddress}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contactEmail">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={errors.contactEmail ? 'error' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.contactEmail && (
                      <span className="error-message">{errors.contactEmail}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactPhone">
                      Phone Number <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className={errors.contactPhone ? 'error' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.contactPhone && (
                      <span className="error-message">{errors.contactPhone}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="specialInstructions">
                    Special Instructions <span className="optional">(Optional)</span>
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="Any special delivery instructions..."
                    rows={2}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button 
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <span className="btn-icon">🚫</span>
            Cancel
          </button>
          
          {!insufficientFunds ? (
            <button 
              type="submit"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="btn-icon">🎁</span>
                  Confirm Redemption
                </>
              )}
            </button>
          ) : (
            <button 
              type="button"
              className="btn-disabled"
              disabled
            >
              <span className="btn-icon">💰</span>
              Insufficient Coins
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedeemModal;
