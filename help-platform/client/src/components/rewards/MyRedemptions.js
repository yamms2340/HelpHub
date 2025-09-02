import React, { useState, useEffect } from 'react';
import { rewardsAPI } from '../../services/api';
import './MyRedemptions.css';

const MyRedemptions = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const result = await rewardsAPI.getUserRedemptions();
      
      if (result.success && Array.isArray(result.data)) {
        setRedemptions(result.data);
      } else {
        setRedemptions([]);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      setError('Failed to load redemption history');
      setRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f6ad55',
      processing: '#4299e1',
      shipped: '#9f7aea',
      delivered: '#48bb78',
      cancelled: '#f56565'
    };
    return colors[status] || '#a0aec0';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="redemptions-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your redemptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="redemptions-page">
        <div className="error-container">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={fetchRedemptions} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="redemptions-page">
      <div className="redemptions-container">
        <div className="redemptions-header">
          <h1>📦 My Redemptions</h1>
          <p>Track your redeemed rewards</p>
        </div>

        {redemptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <h3>No redemptions yet</h3>
            <p>Start earning coins and redeem amazing rewards!</p>
            <a href="/rewards" className="browse-rewards-btn">
              Browse Rewards
            </a>
          </div>
        ) : (
          <div className="redemptions-list">
            {redemptions.map((redemption) => (
              <div key={redemption._id} className="redemption-card">
                <div className="redemption-image">
                  <img 
                    src={redemption.rewardId?.image || '/placeholder-reward.jpg'} 
                    alt={redemption.rewardId?.title || 'Reward'}
                  />
                </div>
                
                <div className="redemption-details">
                  <div className="redemption-header">
                    <h3>{redemption.rewardId?.title || 'Unknown Reward'}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(redemption.status) }}
                    >
                      {redemption.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="redemption-info">
                    <div className="info-row">
                      <span className="label">Redemption Code:</span>
                      <span className="value code">{redemption.redemptionCode}</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="label">Coins Spent:</span>
                      <span className="value coins">{redemption.coinsSpent}</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(redemption.createdAt)}</span>
                    </div>
                    
                    {redemption.trackingNumber && (
                      <div className="info-row">
                        <span className="label">Tracking:</span>
                        <span className="value tracking">{redemption.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="redemption-status">
                    {redemption.status === 'pending' && (
                      <span className="status-message">
                        ⏳ Your redemption is being processed
                      </span>
                    )}
                    
                    {redemption.status === 'processing' && (
                      <span className="status-message">
                        🔄 Your reward is being prepared
                      </span>
                    )}
                    
                    {redemption.status === 'shipped' && (
                      <span className="status-message">
                        🚚 Your reward is on the way!
                      </span>
                    )}
                    
                    {redemption.status === 'delivered' && (
                      <span className="status-message success">
                        ✅ Delivered{redemption.deliveredAt ? ` on ${formatDate(redemption.deliveredAt)}` : ''}
                      </span>
                    )}
                    
                    {redemption.status === 'cancelled' && (
                      <span className="status-message cancelled">
                        ❌ Redemption was cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRedemptions;
