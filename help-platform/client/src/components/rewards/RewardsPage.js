import React, { useState, useEffect, useCallback } from 'react';
import { rewardsAPI } from '../../services/api';
import RedeemModal from './RedeemModel';
import NotificationCard from './NotificationCard';
import Footer from '../common/footer';

const RewardsPage = () => {
  const [rewards, setRewards] = useState([]);
  const [userCoins, setUserCoins] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('coinsCost');
  const [categories, setCategories] = useState(['All']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [notification, setNotification] = useState(null);

  // ... (keeping all the same logic functions)
  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sortBy,
        order: 'asc'
      };
      
      const result = await rewardsAPI.getAllRewards(params);
      
      if (result && result.success && Array.isArray(result.data)) {
        const enhancedRewards = result.data.map(reward => ({
          ...reward,
          image: getRewardImage(reward.title, reward._id)
        }));
        setRewards(enhancedRewards);
      } else {
        setRewards([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching rewards:', error);
      setError(`Failed to load rewards: ${error.message}`);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy]);

  const getRewardImage = (title, id) => {
    const imageMap = {
      '1': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop&q=90',
      '2': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=300&fit=crop&q=90',
      '3': 'https://images.unsplash.com/photo-1489185078254-c5f7c7e3b8ce?w=500&h=300&fit=crop&q=90',
      '4': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop&q=90'
    };

    if (title && title.toLowerCase().includes('bookmyshow')) {
      return 'https://images.unsplash.com/photo-1489185078254-c5f7c7e3b8ce?w=500&h=300&fit=crop&q=90';
    }

    return imageMap[id] || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop&q=90';
  };

  const fetchUserCoins = useCallback(async () => {
    try {
      const result = await rewardsAPI.getUserCoins();
      
      if (result && result.success) {
        setUserCoins(result.data);
      }
    } catch (error) {
      console.error('❌ Error fetching coins:', error);
      setUserCoins({
        totalCoins: 1200,
        userPoints: 1200,
        level: 'Helper',
        requestsCompleted: 5
      });
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await rewardsAPI.getRewardCategories();
      
      if (result && result.success && Array.isArray(result.data)) {
        setCategories(['All', ...result.data]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
    fetchUserCoins();
    fetchCategories();
  }, [fetchRewards, fetchUserCoins, fetchCategories]);

  const showNotification = useCallback((type, title, message, details = null) => {
    setNotification({ type, title, message, details });
    const timeout = type === 'success' ? 5000 : 8000;
    setTimeout(() => setNotification(null), timeout);
  }, []);

  const handleRedeemClick = useCallback((reward) => {
    console.log('🎁 Redeem button clicked for:', reward.title);
    setSelectedReward(reward);
    setIsModalOpen(true);
  }, []);

  const handleRedeemConfirm = useCallback(async (deliveryDetails) => {
    if (!selectedReward) return;

    setIsRedeeming(true);

    try {
      console.log('🔄 Processing redemption with details:', deliveryDetails);

      const result = await rewardsAPI.redeemReward(selectedReward._id, deliveryDetails);
      
      if (result && result.success) {
        showNotification(
          'success',
          'Redemption Successful!',
          `Your ${selectedReward.title} has been redeemed successfully!`,
          {
            redemptionCode: result.data.redemptionCode,
            coinsSpent: result.data.coinsSpent,
            remainingCoins: result.data.remainingCoins
          }
        );
        
        fetchUserCoins();
        fetchRewards();
        
        setIsModalOpen(false);
        setSelectedReward(null);
      } else {
        showNotification(
          'error',
          'Redemption Failed',
          result.message || 'Unknown error occurred'
        );
      }
      
    } catch (error) {
      console.error('❌ Redemption error:', error);
      showNotification(
        'error',
        'Redemption Failed',
        error.message || 'Please try again or contact support.'
      );
    } finally {
      setIsRedeeming(false);
    }
  }, [selectedReward, fetchUserCoins, fetchRewards, showNotification]);

  const handleModalClose = useCallback(() => {
    if (!isRedeeming) {
      setIsModalOpen(false);
      setSelectedReward(null);
    }
  }, [isRedeeming]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        {/* Beautiful Floating Background Icons */}
        <div style={styles.floatingBackground}>
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.floatingIcon,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            >
              <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="currentColor">
                {i % 6 === 0 && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>}
                {i % 6 === 1 && <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>}
                {i % 6 === 2 && <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>}
                {i % 6 === 3 && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>}
                {i % 6 === 4 && <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>}
                {i % 6 === 5 && <path d="M9 11H7v9h2v-9zm4 0h-2v9h2v-9zm4 0h-2v9h2v-9zm2-7H3v2h2v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h2V4zm-4.5-1H8.5l1-1h5l1 1z"/>}
              </svg>
            </div>
          ))}
        </div>
        
        <div style={styles.loadingContent}>
          <div style={styles.loadingSpinner}>
            <div style={styles.spinnerRing}></div>
            <div style={styles.spinnerCore}></div>
          </div>
          <div style={styles.loadingText}>
            <h2 style={styles.loadingTitle}>Loading Premium Rewards</h2>
            <p style={styles.loadingSubtitle}>Preparing your exclusive rewards experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        {/* Floating Background Icons */}
        <div style={styles.floatingBackground}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.floatingIcon,
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${18 + Math.random() * 8}s`
              }}
            >
              <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
          ))}
        </div>
        
        <div style={styles.errorContent}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorMessage}>{error}</p>
          <button onClick={fetchRewards} style={styles.retryButton}>
            <span>🔄</span> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.rewardsPage}>
      {/* Beautiful Floating Background Icons */}
      <div style={styles.floatingBackground}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingIcon,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${12 + Math.random() * 8}s`
            }}
          >
            <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="currentColor">
              {i % 8 === 0 && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>}
              {i % 8 === 1 && <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>}
              {i % 8 === 2 && <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>}
              {i % 8 === 3 && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>}
              {i % 8 === 4 && <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>}
              {i % 8 === 5 && <path d="M9 11H7v9h2v-9zm4 0h-2v9h2v-9zm4 0h-2v9h2v-9zm2-7H3v2h2v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h2V4zm-4.5-1H8.5l1-1h5l1 1z"/>}
              {i % 8 === 6 && <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 1v2h2v2c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V3h2V1H4zm8 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>}
              {i % 8 === 7 && <path d="M15.55 13c.75 0 1.41-.41 1.75-1.03L21.7 4H19l-1.1 2.2L16.8 4h-2.7l4.4 9h-2.7L12 7.4 8.2 13h-2.7l4.4-9H7.2L6.1 6.2 5 4H2.3l4.4 7.97C7.14 12.59 7.8 13 8.55 13H15.55z"/>}
            </svg>
          </div>
        ))}
      </div>

      {/* Notification */}
      {notification && (
        <NotificationCard
          type={notification.type}
          title={notification.title}
          message={notification.message}
          details={notification.details}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroGlow}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>
              Premium
              <span style={styles.heroTitleAccent}>Rewards</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Transform your achievements into valuable rewards with our trusted platform
            </p>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <div style={styles.heroStatIcon}>
                <svg style={styles.heroStatSvg} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
                </svg>
              </div>
              <span style={styles.heroStatNumber}>{rewards.length}</span>
              <span style={styles.heroStatLabel}>Premium Rewards</span>
            </div>
            <div style={styles.heroStat}>
              <div style={styles.heroStatIcon}>
                <svg style={styles.heroStatSvg} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <span style={styles.heroStatNumber}>100%</span>
              <span style={styles.heroStatLabel}>Secure & Trusted</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Wallet Section */}
        {userCoins && (
          <div style={styles.walletSection}>
            <div style={styles.walletGlow}></div>
            <div style={styles.walletHeader}>
              <h2 style={styles.walletTitle}>Your Digital Wallet</h2>
              <div style={styles.levelBadge}>
                <div style={styles.levelBadgeIcon}>
                  <svg style={styles.levelBadgeSvg} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span style={styles.levelText}>{userCoins.level || 'Premium Member'}</span>
              </div>
            </div>
            
            <div style={styles.walletGrid}>
              <div style={{ ...styles.walletCard, ...styles.coinsCard }}>
                <div style={styles.walletCardGlow}></div>
                <div style={styles.walletCardIcon}>
                  <svg style={styles.walletCardSvg} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                </div>
                <div style={styles.walletCardContent}>
                  <div style={styles.walletCardValue}>
                    {userCoins.totalCoins?.toLocaleString() || 0}
                  </div>
                  <div style={styles.walletCardLabel}>Available Coins</div>
                  <div style={styles.walletCardSubtext}>Ready for redemption</div>
                </div>
              </div>
              
              <div style={{ ...styles.walletCard, ...styles.pointsCard }}>
                <div style={styles.walletCardGlow}></div>
                <div style={styles.walletCardIcon}>
                  <svg style={styles.walletCardSvg} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div style={styles.walletCardContent}>
                  <div style={styles.walletCardValue}>
                    {userCoins.userPoints?.toLocaleString() || 0}
                  </div>
                  <div style={styles.walletCardLabel}>Total Points</div>
                  <div style={styles.walletCardProgress}>
                    <div style={styles.walletProgressBar}></div>
                    <div style={styles.progressShimmer}></div>
                  </div>
                </div>
              </div>
              
              <div style={{ ...styles.walletCard, ...styles.tasksCard }}>
                <div style={styles.walletCardGlow}></div>
                <div style={styles.walletCardIcon}>
                  <svg style={styles.walletCardSvg} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div style={styles.walletCardContent}>
                  <div style={styles.walletCardValue}>
                    {userCoins.requestsCompleted || 0}
                  </div>
                  <div style={styles.walletCardLabel}>Tasks Completed</div>
                  <div style={styles.walletCardBadge}>
                    <div style={styles.badgeShimmer}></div>
                    Active Status
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={styles.filtersSection}>
          <div style={styles.filtersGlow}></div>
          <div style={styles.filtersHeader}>
            <h3 style={styles.filtersTitle}>Discover Amazing Rewards</h3>
            <div style={styles.resultsCounter}>
              <div style={styles.resultsShimmer}></div>
              <span style={styles.resultsNumber}>{rewards.length}</span>
              <span style={styles.resultsLabel}>premium rewards</span>
            </div>
          </div>
          
          <div style={styles.filtersControls}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <div style={styles.selectWrapper}>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={styles.filterSelect}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div style={styles.selectGlow}></div>
              </div>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <div style={styles.selectWrapper}>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="coinsCost">Price: Low to High</option>
                  <option value="-coinsCost">Price: High to Low</option>
                  <option value="title">Name: A to Z</option>
                </select>
                <div style={styles.selectGlow}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div style={styles.rewardsGrid}>
          {rewards.map((reward, index) => (
            <div 
              key={reward._id} 
              style={{
                ...styles.rewardCard,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div style={styles.cardGlow}></div>
              <div style={styles.cardImageContainer}>
                <img 
                  src={reward.image} 
                  alt={reward.title}
                  style={styles.cardImage}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop&q=90';
                  }}
                />
                <div style={styles.cardImageOverlay}>
                  <div style={styles.cardImageOverlayContent}>
                    <span style={styles.viewDetailsText}>View Details</span>
                  </div>
                </div>
                
                <div style={styles.cardBadges}>
                  {reward.isFeatured && (
                    <span style={styles.featuredBadge}>
                      <div style={styles.featuredShimmer}></div>
                      <span style={styles.featuredIcon}>★</span>
                      Featured
                    </span>
                  )}
                  <span style={styles.categoryBadge}>{reward.category}</span>
                </div>
              </div>
              
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{reward.title}</h3>
                <p style={styles.cardDescription}>{reward.description}</p>
                
                <div style={styles.cardPricing}>
                  <div style={styles.coinPrice}>
                    <div style={styles.coinIcon}>
                      <svg style={styles.coinSvg} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                      </svg>
                    </div>
                    <span style={styles.priceValue}>{reward.coinsCost}</span>
                    <span style={styles.priceLabel}>coins</span>
                  </div>
                  {reward.originalPrice > 0 && (
                    <div style={styles.originalPrice}>₹{reward.originalPrice}</div>
                  )}
                </div>
                
                <div style={styles.cardFooter}>
                  <div style={styles.stockInfo}>
                    <div style={styles.stockDot}></div>
                    <span style={styles.stockText}>{reward.availability} available</span>
                  </div>
                  
                  <button
                    style={{
                      ...styles.redeemButton,
                      ...((!userCoins || userCoins.totalCoins < reward.coinsCost) 
                        ? styles.redeemButtonDisabled 
                        : reward.availability <= 0 
                          ? styles.redeemButtonOutOfStock 
                          : styles.redeemButtonAvailable)
                    }}
                    onClick={() => handleRedeemClick(reward)}
                    disabled={reward.availability <= 0}
                  >
                    <div style={styles.buttonShimmer}></div>
                    {reward.availability <= 0 ? (
                      <>❌ Out of Stock</>
                    ) : !userCoins || userCoins.totalCoins < reward.coinsCost ? (
                      <>💰 Need More Coins</>
                    ) : (
                      <>🎁 Redeem Now</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {rewards.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyGlow}></div>
            <div style={styles.emptyIcon}>
              <svg style={styles.emptyIconSvg} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
              </svg>
            </div>
            <h3 style={styles.emptyTitle}>No rewards found</h3>
            <p style={styles.emptyDescription}>
              Try adjusting your filters or check back later for exciting new rewards
            </p>
            <button 
              onClick={() => setSelectedCategory('All')} 
              style={styles.resetButton}
            >
              <div style={styles.resetShimmer}></div>
              Reset Filters
            </button>
          </div>
        )}

        {/* Earn Section */}
        <div style={styles.earnSection}>
          <div style={styles.earnGlow}></div>
          <div style={styles.earnHeader}>
            <h3 style={styles.earnTitle}>Boost Your Earning Power</h3>
            <p style={styles.earnSubtitle}>Multiple paths to maximize your rewards</p>
          </div>
          
          <div style={styles.earnGrid}>
            {[
              { 
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 1v2h2v2c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V3h2V1H4zm8 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                ), 
                title: 'Help Community', 
                desc: 'Complete requests and assist others', 
                reward: '+50-100 coins'
              },
              { 
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ), 
                title: 'Earn 5-Star Reviews', 
                desc: 'Exceptional service brings rewards', 
                reward: '+25 coins'
              },
              { 
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.55 13c.75 0 1.41-.41 1.75-1.03L21.7 4H19l-1.1 2.2L16.8 4h-2.7l4.4 9h-2.7L12 7.4 8.2 13h-2.7l4.4-9H7.2L6.1 6.2 5 4H2.3l4.4 7.97C7.14 12.59 7.8 13 8.55 13H15.55z"/>
                  </svg>
                ), 
                title: 'Lightning Fast', 
                desc: 'Complete tasks ahead of schedule', 
                reward: '+15 coins'
              },
              { 
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ), 
                title: 'Unlock Milestones', 
                desc: 'Achieve goals and collect bonuses', 
                reward: '+100+ coins'
              }
            ].map((method, index) => (
              <div key={index} style={styles.earnMethod}>
                <div style={styles.earnMethodGlow}></div>
                <div style={styles.earnMethodIcon}>{method.icon}</div>
                <div style={styles.earnMethodContent}>
                  <h4 style={styles.earnMethodTitle}>{method.title}</h4>
                  <p style={styles.earnMethodDesc}>{method.desc}</p>
                  <div style={styles.earnMethodReward}>
                    <div style={styles.rewardShimmer}></div>
                    {method.reward}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RedeemModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleRedeemConfirm}
        reward={selectedReward}
        userCoins={userCoins}
        isSubmitting={isRedeeming}
      />

      <Footer />
    </div>
  );
};

// 🌟 BEAUTIFUL BLUE & WHITE DESIGN WITH FLOATING ANIMATIONS
const styles = {
  rewardsPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: 'relative',
    color: '#1e293b',
    overflow: 'hidden'
  },

  // Beautiful Floating Background
  floatingBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden'
  },

  floatingIcon: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    color: 'rgba(59, 130, 246, 0.08)', // Using #3b82f6 with low opacity
    animation: 'floatAnimation 20s ease-in-out infinite',
    opacity: 0.6,
    userSelect: 'none'
  },

  iconSvg: {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.1))'
  },

  // Hero Section - Beautiful Blue #3b82f6
  heroSection: {
    position: 'relative',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
    color: 'white',
    padding: '5rem 0',
    marginBottom: '4rem',
    zIndex: 2,
    overflow: 'hidden'
  },

  heroGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '120%',
    height: '120%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none'
  },

  heroContent: {
    textAlign: 'center',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 2
  },

  heroText: {
    marginBottom: '4rem'
  },

  heroTitle: {
    fontSize: '4rem',
    fontWeight: 900,
    margin: '0 0 1.5rem 0',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)'
  },

  heroTitleAccent: {
    color: '#fbbf24',
    filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))'
  },

  heroSubtitle: {
    fontSize: '1.4rem',
    fontWeight: 300,
    opacity: 0.9,
    margin: 0,
    lineHeight: 1.6,
    textShadow: '0 1px 10px rgba(0, 0, 0, 0.2)'
  },

  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6rem'
  },

  heroStat: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    padding: '2.5rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    overflow: 'hidden'
  },

  heroStatIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto 1rem',
    color: '#fbbf24'
  },

  heroStatSvg: {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.5))'
  },

  heroStatNumber: {
    display: 'block',
    fontSize: '2.5rem',
    fontWeight: 800,
    marginBottom: '0.8rem',
    textShadow: '0 0 15px rgba(255, 255, 255, 0.3)'
  },

  heroStatLabel: {
    fontSize: '1rem',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 500
  },

  // Container
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 2
  },

  // Wallet Section - Pure White with Blue Accents
  walletSection: {
    marginBottom: '4rem',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    padding: '3rem',
    border: '1px solid rgba(59, 130, 246, 0.1)',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  },

  walletGlow: {
    position: 'absolute',
    top: '-30%',
    left: '-30%',
    width: '160%',
    height: '160%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
    pointerEvents: 'none'
  },

  walletHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    position: 'relative',
    zIndex: 2
  },

  walletTitle: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: 0
  },

  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '50px',
    fontWeight: 700,
    fontSize: '1rem',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  },

  levelBadgeIcon: {
    width: '24px',
    height: '24px'
  },

  levelBadgeSvg: {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))'
  },

  levelText: {},

  walletGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    position: 'relative',
    zIndex: 2
  },

  walletCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    boxShadow: '0 8px 30px rgba(59, 130, 246, 0.08)',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },

  walletCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  },

  coinsCard: {
    borderLeft: '4px solid #3b82f6'
  },

  pointsCard: {
    borderLeft: '4px solid #fbbf24'
  },

  tasksCard: {
    borderLeft: '4px solid #10b981'
  },

  walletCardIcon: {
    width: '56px',
    height: '56px',
    color: '#3b82f6',
    flexShrink: 0
  },

  walletCardSvg: {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
  },

  walletCardContent: {
    flex: 1
  },

  walletCardValue: {
    fontSize: '2.8rem',
    fontWeight: 900,
    color: '#1e293b',
    marginBottom: '0.5rem',
    lineHeight: 1
  },

  walletCardLabel: {
    fontSize: '1rem',
    color: '#475569',
    fontWeight: 600,
    marginBottom: '0.3rem'
  },

  walletCardSubtext: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: 400
  },

  walletCardProgress: {
    width: '100%',
    height: '6px',
    background: 'rgba(59, 130, 246, 0.15)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '0.8rem',
    position: 'relative'
  },

  walletProgressBar: {
    width: '75%',
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
    borderRadius: '3px',
    transition: 'width 2s ease'
  },

  progressShimmer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
    animation: 'shimmer 2s ease-in-out infinite'
  },

  walletCardBadge: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 700,
    marginTop: '0.5rem',
    display: 'inline-block',
    position: 'relative',
    overflow: 'hidden'
  },

  badgeShimmer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    animation: 'shimmer 3s ease-in-out infinite'
  },

  // Filters Section
  filtersSection: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    padding: '2.5rem',
    marginBottom: '4rem',
    border: '1px solid rgba(59, 130, 246, 0.1)',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  },

  filtersGlow: {
    position: 'absolute',
    top: '-20%',
    left: '-20%',
    width: '140%',
    height: '140%',
    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.03) 0%, transparent 70%)',
    pointerEvents: 'none'
  },

  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    position: 'relative',
    zIndex: 2
  },

  filtersTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: 0
  },

  resultsCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '50px',
    fontWeight: 700,
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  },

  resultsShimmer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    animation: 'shimmer 4s ease-in-out infinite'
  },

  resultsNumber: {
    fontSize: '1.3rem',
    fontWeight: 900
  },

  resultsLabel: {
    fontSize: '0.95rem'
  },

  filtersControls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    position: 'relative',
    zIndex: 2
  },

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  filterLabel: {
    fontWeight: 700,
    color: '#1e293b',
    fontSize: '1rem'
  },

  selectWrapper: {
    position: 'relative'
  },

  filterSelect: {
    width: '100%',
    padding: '1.2rem 1.8rem',
    border: '2px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  selectGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  },

  // Rewards Grid
  rewardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '3rem',
    marginBottom: '5rem'
  },

  rewardCard: {
    background: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.08)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    color: '#1e293b',
    animation: 'slideUp 0.8s ease-out both'
  },

  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 50%, rgba(251, 191, 36, 0.05) 100%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
    pointerEvents: 'none',
    borderRadius: '24px'
  },

  cardImageContainer: {
    position: 'relative',
    height: '240px',
    overflow: 'hidden'
  },

  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease'
  },

  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },

  cardImageOverlayContent: {
    textAlign: 'center',
    color: 'white'
  },

  viewDetailsText: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    padding: '1rem 2rem',
    borderRadius: '50px',
    fontWeight: 700,
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },

  cardBadges: {
    position: 'absolute',
    top: '1.5rem',
    left: '1.5rem',
    right: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  featuredBadge: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#92400e',
    padding: '0.6rem 1.2rem',
    borderRadius: '50px',
    fontSize: '0.85rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 8px 25px rgba(251, 191, 36, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  },

  featuredShimmer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
    animation: 'shimmer 2s ease-in-out infinite'
  },

  featuredIcon: {
    fontSize: '1rem',
    filter: 'drop-shadow(0 0 3px rgba(146, 64, 14, 0.5))'
  },

  categoryBadge: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    color: '#1e293b',
    padding: '0.6rem 1.2rem',
    borderRadius: '50px',
    fontSize: '0.85rem',
    fontWeight: 700,
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },

  cardContent: {
    padding: '2.5rem'
  },

  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: '0 0 1rem 0',
    lineHeight: 1.3
  },

  cardDescription: {
    color: '#475569',
    fontSize: '1rem',
    lineHeight: 1.6,
    margin: '0 0 2rem 0'
  },

  cardPricing: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },

  coinPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem'
  },

  coinIcon: {
    width: '32px',
    height: '32px',
    color: '#fbbf24'
  },

  coinSvg: {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.4))'
  },

  priceValue: {
    fontSize: '2rem',
    fontWeight: 900,
    color: '#1e293b'
  },

  priceLabel: {
    fontSize: '1rem',
    color: '#475569',
    fontWeight: 700
  },

  originalPrice: {
    color: '#94a3b8',
    textDecoration: 'line-through',
    fontSize: '1rem',
    fontWeight: 600
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  stockInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    color: '#10b981',
    fontSize: '0.9rem',
    fontWeight: 600
  },

  stockDot: {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
    boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
  },

  stockText: {},

  redeemButton: {
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative',
    overflow: 'hidden'
  },

  buttonShimmer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    transition: 'left 0.6s ease'
  },

  redeemButtonAvailable: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
  },

  redeemButtonDisabled: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    cursor: 'not-allowed',
    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
  },

  redeemButtonOutOfStock: {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    cursor: 'not-allowed',
    boxShadow: '0 8px 25px rgba(107, 114, 128, 0.3)'
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '5rem 3rem',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    border: '1px solid rgba(59, 130, 246, 0.1)',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  },

  emptyGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150%',
    height: '150%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
    pointerEvents: 'none'
  },

  emptyIcon: {
    width: '100px',
    height: '100px',
    margin: '0 auto 2rem',
    color: 'rgba(59, 130, 246, 0.4)'
  },

  emptyIconSvg: {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))'
  },

  emptyTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: '1rem'
  },

  emptyDescription: {
    color: '#475569',
    fontSize: '1.1rem',
    marginBottom: '2.5rem',
    lineHeight: 1.6
  },

  resetButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '1.2rem 2.5rem',
    borderRadius: '16px',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  },

  resetShimmer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    transition: 'left 0.6s ease'
  },

  // Earn Section
  earnSection: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    padding: '4rem',
    border: '1px solid rgba(59, 130, 246, 0.1)',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.1)',
    marginBottom: '4rem',
    position: 'relative',
    overflow: 'hidden'
  },

  earnGlow: {
    position: 'absolute',
    top: '-30%',
    left: '-30%',
    width: '160%',
    height: '160%',
    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.03) 0%, transparent 70%)',
    pointerEvents: 'none'
  },

  earnHeader: {
    textAlign: 'center',
    marginBottom: '3rem',
    position: 'relative',
    zIndex: 2
  },

  earnTitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#1e293b',
    margin: '0 0 1rem 0'
  },

  earnSubtitle: {
    color: '#475569',
    fontSize: '1.2rem',
    margin: 0
  },

  earnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    position: 'relative',
    zIndex: 2
  },

  earnMethod: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    padding: '2.5rem',
    textAlign: 'center',
    transition: 'all 0.4s ease',
    border: '2px solid rgba(59, 130, 246, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer'
  },

  earnMethodGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, transparent 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
    borderRadius: '20px'
  },

  earnMethodIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto 1.5rem',
    color: '#3b82f6',
    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
  },

  earnMethodContent: {},

  earnMethodTitle: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: '0 0 0.8rem 0'
  },

  earnMethodDesc: {
    color: '#475569',
    fontSize: '0.95rem',
    margin: '0 0 1.5rem 0',
    lineHeight: 1.6
  },

  earnMethodReward: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#92400e',
    padding: '0.8rem 1.5rem',
    borderRadius: '50px',
    fontWeight: 800,
    fontSize: '0.9rem',
    display: 'inline-block',
    boxShadow: '0 8px 25px rgba(251, 191, 36, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  },

  rewardShimmer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
    animation: 'shimmer 3s ease-in-out infinite'
  },

  // Loading States
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  },

  loadingContent: {
    position: 'relative',
    zIndex: 2
  },

  loadingSpinner: {
    width: '80px',
    height: '80px',
    marginBottom: '3rem',
    position: 'relative'
  },

  spinnerRing: {
    width: '100%',
    height: '100%',
    border: '6px solid rgba(59, 130, 246, 0.2)',
    borderTop: '6px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1.2s linear infinite'
  },

  spinnerCore: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    right: '15px',
    bottom: '15px',
    border: '4px solid rgba(251, 191, 36, 0.3)',
    borderTop: '4px solid #fbbf24',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite reverse'
  },

  loadingText: {},

  loadingTitle: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: '#1e293b',
    marginBottom: '1rem'
  },

  loadingSubtitle: {
    color: '#475569',
    fontSize: '1.1rem',
    fontWeight: 300
  },

  // Error States
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
    textAlign: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden'
  },

  errorContent: {
    position: 'relative',
    zIndex: 2
  },

  errorIcon: {
    fontSize: '5rem',
    marginBottom: '2rem',
    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))'
  },

  errorTitle: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: '#1e293b',
    marginBottom: '1rem'
  },

  errorMessage: {
    color: '#475569',
    fontSize: '1.1rem',
    marginBottom: '2.5rem',
    lineHeight: 1.6
  },

  retryButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '1.2rem 2.5rem',
    borderRadius: '16px',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
  }
};

// 🌟 BEAUTIFUL CSS ANIMATIONS WITH FLOATING ICONS
const globalStyles = `
  @keyframes floatAnimation {
    0%, 100% { 
      transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
      opacity: 0.6;
    }
    25% { 
      transform: translateY(-20px) translateX(10px) rotate(5deg) scale(1.05);
      opacity: 0.8;
    }
    50% { 
      transform: translateY(-5px) translateX(-15px) rotate(-3deg) scale(0.95);
      opacity: 0.4;
    }
    75% { 
      transform: translateY(15px) translateX(8px) rotate(2deg) scale(1.02);
      opacity: 0.7;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
    }
    50% { 
      opacity: 0.6; 
      transform: scale(1.2);
    }
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  /* Beautiful Hover Effects */
  .reward-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 25px 60px rgba(59, 130, 246, 0.15);
  }

  .reward-card:hover .card-image {
    transform: scale(1.06);
  }

  .reward-card:hover .card-image-overlay {
    opacity: 1;
  }

  .reward-card:hover .card-glow {
    opacity: 1;
  }

  .wallet-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 50px rgba(59, 130, 246, 0.12);
  }

  .wallet-card:hover .wallet-card-glow {
    opacity: 1;
  }

  .earn-method:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.12);
  }

  .earn-method:hover .earn-method-glow {
    opacity: 1;
  }

  .redeem-button:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
  }

  .redeem-button:hover .button-shimmer {
    left: 100%;
  }

  .filter-select:focus {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .filter-select:focus + .select-glow {
    opacity: 1;
  }

  .reset-button:hover .reset-shimmer {
    left: 100%;
  }

  .reset-button:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.8rem !important;
    }
    
    .hero-stats {
      flex-direction: column;
      gap: 2rem !important;
    }
    
    .wallet-grid {
      grid-template-columns: 1fr !important;
    }
    
    .rewards-grid {
      grid-template-columns: 1fr !important;
    }
    
    .earn-grid {
      grid-template-columns: 1fr !important;
    }
    
    .floating-icon {
      width: 30px !important;
      height: 30px !important;
    }
  }

  @media (max-width: 480px) {
    .hero-title {
      font-size: 2.2rem !important;
    }
    
    .floating-icon {
      width: 25px !important;
      height: 25px !important;
    }
  }
`;

// Inject beautiful styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('rewards-page-blue-white-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'rewards-page-blue-white-styles';
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}

export default RewardsPage;
