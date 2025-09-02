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
        {/* Floating Background Icons */}
        <div style={styles.floatingIconsContainer}>
          <div style={{...styles.floatingIcon, ...styles.float1, top: '10%', left: '15%'}}>🎁</div>
          <div style={{...styles.floatingIcon, ...styles.float2, top: '25%', right: '20%'}}>🏆</div>
          <div style={{...styles.floatingIcon, ...styles.float3, top: '45%', left: '10%'}}>⭐</div>
          <div style={{...styles.floatingIcon, ...styles.float4, top: '60%', right: '15%'}}>🪙</div>
          <div style={{...styles.floatingIcon, ...styles.float5, top: '75%', left: '25%'}}>💎</div>
          <div style={{...styles.floatingIcon, ...styles.float6, top: '35%', left: '50%'}}>✨</div>
          <div style={{...styles.floatingIcon, ...styles.float7, top: '80%', right: '40%'}}>🎯</div>
          <div style={{...styles.floatingIcon, ...styles.float8, top: '20%', left: '70%'}}>🔥</div>
        </div>
        
        <div style={styles.loadingSpinner}></div>
        <div style={styles.loadingText}>
          <h2 style={styles.loadingTitle}>Loading Premium Rewards</h2>
          <p style={styles.loadingSubtitle}>Curating the best deals just for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        {/* Floating Background Icons */}
        <div style={styles.floatingIconsContainer}>
          <div style={{...styles.floatingIcon, ...styles.float1, top: '10%', left: '15%'}}>🎁</div>
          <div style={{...styles.floatingIcon, ...styles.float2, top: '25%', right: '20%'}}>🏆</div>
          <div style={{...styles.floatingIcon, ...styles.float3, top: '45%', left: '10%'}}>⭐</div>
          <div style={{...styles.floatingIcon, ...styles.float4, top: '60%', right: '15%'}}>🪙</div>
        </div>
        
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Oops! Something went wrong</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={fetchRewards} style={styles.retryButton}>
          <span>🔄</span> Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.rewardsPage}>
      {/* Floating Background Icons - Covering Entire Page */}
      <div style={styles.floatingIconsContainer}>
        <div style={{...styles.floatingIcon, ...styles.float1, top: '8%', left: '12%'}}>🎁</div>
        <div style={{...styles.floatingIcon, ...styles.float2, top: '15%', right: '18%'}}>🏆</div>
        <div style={{...styles.floatingIcon, ...styles.float3, top: '28%', left: '8%'}}>⭐</div>
        <div style={{...styles.floatingIcon, ...styles.float4, top: '35%', right: '25%'}}>🪙</div>
        <div style={{...styles.floatingIcon, ...styles.float5, top: '52%', left: '15%'}}>💎</div>
        <div style={{...styles.floatingIcon, ...styles.float6, top: '48%', right: '10%'}}>✨</div>
        <div style={{...styles.floatingIcon, ...styles.float7, top: '68%', left: '22%'}}>🎯</div>
        <div style={{...styles.floatingIcon, ...styles.float8, top: '72%', right: '20%'}}>🔥</div>
        <div style={{...styles.floatingIcon, ...styles.float1, top: '85%', left: '18%'}}>⚡</div>
        <div style={{...styles.floatingIcon, ...styles.float2, top: '90%', right: '15%'}}>🚀</div>
        <div style={{...styles.floatingIcon, ...styles.float3, top: '25%', left: '45%'}}>💰</div>
        <div style={{...styles.floatingIcon, ...styles.float4, top: '42%', left: '65%'}}>🎪</div>
        <div style={{...styles.floatingIcon, ...styles.float5, top: '58%', left: '75%'}}>🌟</div>
        <div style={{...styles.floatingIcon, ...styles.float6, top: '78%', left: '60%'}}>🎊</div>
        <div style={{...styles.floatingIcon, ...styles.float7, top: '12%', left: '80%'}}>🎨</div>
        <div style={{...styles.floatingIcon, ...styles.float8, top: '38%', right: '5%'}}>🎭</div>
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
        <div style={styles.heroContent}>
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>
              Premium Rewards
              <span style={styles.heroTitleAccent}>Store</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Transform your achievements into extraordinary rewards
            </p>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <span style={styles.heroStatNumber}>{rewards.length}</span>
              <span style={styles.heroStatLabel}>Premium Rewards</span>
            </div>
            <div style={styles.heroStat}>
              <span style={styles.heroStatNumber}>24/7</span>
              <span style={styles.heroStatLabel}>Available</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* User Wallet */}
        {userCoins && (
          <div style={styles.walletSection}>
            <div style={styles.walletHeader}>
              <h2 style={styles.walletTitle}>Your Digital Wallet</h2>
              <div style={styles.levelBadge}>
                <span style={styles.levelIcon}>✨</span>
                <span style={styles.levelText}>{userCoins.level || 'Beginner'}</span>
              </div>
            </div>
            
            <div style={styles.walletGrid}>
              <div style={{ ...styles.walletCard, ...styles.coinsCard }}>
                <div style={styles.walletCardIcon}>💎</div>
                <div style={styles.walletCardContent}>
                  <div style={styles.walletCardValue}>
                    {userCoins.totalCoins?.toLocaleString() || 0}
                  </div>
                  <div style={styles.walletCardLabel}>Available Coins</div>
                  <div style={styles.walletCardTrend}>+12.5% this month</div>
                </div>
                <div style={styles.walletCardGlow}></div>
              </div>
              
              <div style={{ ...styles.walletCard, ...styles.pointsCard }}>
                <div style={styles.walletCardIcon}>🏆</div>
                <div style={styles.walletCardContent}>
                  <div style={styles.walletCardValue}>
                    {userCoins.userPoints?.toLocaleString() || 0}
                  </div>
                  <div style={styles.walletCardLabel}>Total Points</div>
                  <div style={styles.walletCardProgress}>
                    <div style={styles.walletProgressBar}></div>
                  </div>
                </div>
                <div style={styles.walletCardGlow}></div>
              </div>
              
              <div style={{ ...styles.walletCard, ...styles.tasksCard }}>
                <div style={styles.walletCardIcon}>⚡</div>
                <div style={styles.walletCardContent}>
                  <div style={styles.walletCardValue}>
                    {userCoins.requestsCompleted || 0}
                  </div>
                  <div style={styles.walletCardLabel}>Tasks Completed</div>
                  <div style={styles.walletCardBadge}>Active</div>
                </div>
                <div style={styles.walletCardGlow}></div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={styles.filtersSection}>
          <div style={styles.filtersHeader}>
            <h3 style={styles.filtersTitle}>Discover Rewards</h3>
            <div style={styles.resultsCounter}>
              <span style={styles.resultsNumber}>{rewards.length}</span>
              <span style={styles.resultsLabel}>available</span>
            </div>
          </div>
          
          <div style={styles.filtersControls}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={styles.filterSelect}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="coinsCost">Price: Low to High</option>
                <option value="-coinsCost">Price: High to Low</option>
                <option value="title">Name: A to Z</option>
              </select>
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
                      <span style={styles.featuredIcon}>⭐</span>
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
                    <span style={styles.coinIcon}>🪙</span>
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
                    {reward.availability <= 0 ? (
                      <>
                        <span style={styles.buttonIcon}>❌</span>
                        Out of Stock
                      </>
                    ) : !userCoins || userCoins.totalCoins < reward.coinsCost ? (
                      <>
                        <span style={styles.buttonIcon}>💰</span>
                        Need More Coins
                      </>
                    ) : (
                      <>
                        <span style={styles.buttonIcon}>🎁</span>
                        Redeem Now
                      </>
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
            <div style={styles.emptyIcon}>🎁</div>
            <h3 style={styles.emptyTitle}>No rewards found</h3>
            <p style={styles.emptyDescription}>
              Try adjusting your filters or check back soon for new rewards!
            </p>
            <button 
              onClick={() => setSelectedCategory('All')} 
              style={styles.resetButton}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Earn More Section */}
        <div style={styles.earnSection}>
          <div style={styles.earnHeader}>
            <h3 style={styles.earnTitle}>Boost Your Earnings</h3>
            <p style={styles.earnSubtitle}>Multiple ways to earn more coins</p>
          </div>
          
          <div style={styles.earnGrid}>
            {[
              { icon: '🤝', title: 'Help Others', desc: 'Complete community requests', reward: '+50-100' },
              { icon: '⭐', title: 'Get 5-Star Ratings', desc: 'Exceptional service quality', reward: '+25' },
              { icon: '⚡', title: 'Quick Completion', desc: 'Beat deadlines consistently', reward: '+15' },
              { icon: '🏆', title: 'Unlock Achievements', desc: 'Reach important milestones', reward: '+100+' }
            ].map((method, index) => (
              <div key={index} style={styles.earnMethod}>
                <div style={styles.earnMethodIcon}>{method.icon}</div>
                <div style={styles.earnMethodContent}>
                  <h4 style={styles.earnMethodTitle}>{method.title}</h4>
                  <p style={styles.earnMethodDesc}>{method.desc}</p>
                  <span style={styles.earnMethodReward}>{method.reward}</span>
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

// 🌟 STUNNING DEEP BLUE BACKGROUND WITH FLOATING ICONS
const styles = {
  rewardsPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a1628 0%, #1e3a8a 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: 'relative',
    overflow: 'hidden',
    color: 'white'
  },

  // 🌌 FLOATING ICONS BACKGROUND
  floatingIconsContainer: {
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
    fontSize: '3.5rem',
    color: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.6,
    userSelect: 'none',
    pointerEvents: 'none',
    filter: 'blur(0.5px)',
    textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
  },

  // Different animation delays and durations for natural movement
  float1: {
    animation: 'floatUp 25s ease-in-out infinite',
    animationDelay: '0s'
  },

  float2: {
    animation: 'floatDown 30s ease-in-out infinite',
    animationDelay: '5s'
  },

  float3: {
    animation: 'floatLeft 28s ease-in-out infinite',
    animationDelay: '10s'
  },

  float4: {
    animation: 'floatRight 32s ease-in-out infinite',
    animationDelay: '15s'
  },

  float5: {
    animation: 'floatDiagonal 26s ease-in-out infinite',
    animationDelay: '20s'
  },

  float6: {
    animation: 'floatCircle 35s ease-in-out infinite',
    animationDelay: '3s'
  },

  float7: {
    animation: 'floatWave 29s ease-in-out infinite',
    animationDelay: '12s'
  },

  float8: {
    animation: 'floatSpin 33s ease-in-out infinite',
    animationDelay: '7s'
  },

  // Hero Section with Glass Effect
  heroSection: {
    position: 'relative',
    height: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4rem',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 2
  },

  heroContent: {
    textAlign: 'center',
    color: 'white',
    zIndex: 3,
    position: 'relative'
  },

  heroText: {
    marginBottom: '3rem'
  },

  heroTitle: {
    fontSize: '4.5rem',
    fontWeight: 900,
    margin: '0 0 1rem 0',
    background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    textShadow: '0 0 30px rgba(255, 255, 255, 0.5)'
  },

  heroTitleAccent: {
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))'
  },

  heroSubtitle: {
    fontSize: '1.7rem',
    fontWeight: 300,
    opacity: 0.9,
    margin: 0,
    letterSpacing: '0.01em',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
  },

  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5rem'
  },

  heroStat: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '2rem 3rem',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },

  heroStatNumber: {
    display: 'block',
    fontSize: '3rem',
    fontWeight: 800,
    marginBottom: '0.5rem',
    color: '#60a5fa',
    textShadow: '0 0 20px rgba(96, 165, 250, 0.8)'
  },

  heroStatLabel: {
    fontSize: '1.1rem',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 500
  },

  // Container with Glass Effect
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 2
  },

  // Wallet Section with Enhanced Glass Effect
  walletSection: {
    marginBottom: '4rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '2rem',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },

  walletHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },

  walletTitle: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: 'white',
    margin: 0,
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
  },

  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '50px',
    fontWeight: 700,
    fontSize: '1.1rem',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },

  levelIcon: {
    fontSize: '1.5rem'
  },

  levelText: {},

  walletGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem'
  },

  walletCard: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '24px',
    padding: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    cursor: 'pointer'
  },

  coinsCard: {
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.3) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.5)'
  },

  pointsCard: {
    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(2, 132, 199, 0.3) 100%)',
    borderColor: 'rgba(14, 165, 233, 0.5)'
  },

  tasksCard: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.5)'
  },

  walletCardIcon: {
    fontSize: '3.5rem',
    flexShrink: 0,
    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
  },

  walletCardContent: {
    flex: 1
  },

  walletCardValue: {
    fontSize: '2.8rem',
    fontWeight: 900,
    color: 'white',
    marginBottom: '0.5rem',
    lineHeight: 1,
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
  },

  walletCardLabel: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 600,
    marginBottom: '0.5rem'
  },

  walletCardTrend: {
    color: '#34d399',
    fontSize: '1rem',
    fontWeight: 700,
    textShadow: '0 0 10px rgba(52, 211, 153, 0.8)'
  },

  walletCardProgress: {
    width: '100%',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden'
  },

  walletProgressBar: {
    width: '75%',
    height: '100%',
    background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
    borderRadius: '3px',
    transition: 'width 2s ease',
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
  },

  walletCardBadge: {
    background: '#10b981',
    color: 'white',
    padding: '0.4rem 1rem',
    borderRadius: '15px',
    fontSize: '0.9rem',
    fontWeight: 700,
    boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)'
  },

  walletCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },

  // Filters Section with Enhanced Glass
  filtersSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '2.5rem',
    marginBottom: '3rem',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },

  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },

  filtersTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'white',
    margin: 0,
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
  },

  resultsCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '50px',
    fontWeight: 700,
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },

  resultsNumber: {
    fontSize: '1.4rem',
    fontWeight: 900
  },

  resultsLabel: {
    fontSize: '1rem'
  },

  filtersControls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  },

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  filterLabel: {
    fontWeight: 700,
    color: 'white',
    fontSize: '1.1rem',
    textShadow: '0 1px 5px rgba(0, 0, 0, 0.5)'
  },

  filterSelect: {
    padding: '1.2rem 1.8rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  // Enhanced Rewards Grid
  rewardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
    gap: '3rem',
    marginBottom: '5rem'
  },

  rewardCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'slideUp 0.6s ease-out both',
    position: 'relative',
    color: '#1e293b'
  },

  cardImageContainer: {
    position: 'relative',
    height: '280px',
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
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(29, 78, 216, 0.9) 100%)',
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
    padding: '1rem 2rem',
    borderRadius: '50px',
    fontWeight: 700,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    fontSize: '1.1rem'
  },

  cardBadges: {
    position: 'absolute',
    top: '1.2rem',
    left: '1.2rem',
    right: '1.2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  featuredBadge: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },

  featuredIcon: {
    fontSize: '1.1rem'
  },

  categoryBadge: {
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#374151',
    padding: '0.6rem 1.2rem',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: 700,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },

  cardContent: {
    padding: '2.5rem'
  },

  cardTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: '0 0 1rem 0',
    lineHeight: 1.3
  },

  cardDescription: {
    color: '#64748b',
    fontSize: '1.1rem',
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
    gap: '0.6rem'
  },

  coinIcon: {
    fontSize: '1.8rem',
    filter: 'drop-shadow(0 0 5px rgba(255, 193, 7, 0.8))'
  },

  priceValue: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: '#1e293b'
  },

  priceLabel: {
    fontSize: '1.1rem',
    color: '#64748b',
    fontWeight: 700
  },

  originalPrice: {
    color: '#9ca3af',
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
    fontSize: '1rem',
    fontWeight: 600
  },

  stockDot: {
    width: '10px',
    height: '10px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
  },

  stockText: {},

  redeemButton: {
    padding: '1.2rem 2.5rem',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    position: 'relative',
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },

  redeemButtonAvailable: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },

  redeemButtonDisabled: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    cursor: 'not-allowed',
    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
  },

  redeemButtonOutOfStock: {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    cursor: 'not-allowed',
    boxShadow: '0 8px 25px rgba(107, 114, 128, 0.4)'
  },

  buttonIcon: {
    fontSize: '1.2rem'
  },

  // Enhanced Empty State
  emptyState: {
    textAlign: 'center',
    padding: '5rem 3rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },

  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '2rem',
    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))'
  },

  emptyTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'white',
    marginBottom: '1rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
  },

  emptyDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.2rem',
    marginBottom: '2.5rem',
    lineHeight: 1.6
  },

  resetButton: {
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    padding: '1.2rem 2.5rem',
    borderRadius: '16px',
    fontWeight: 700,
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },

  // Enhanced Earn Section
  earnSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '4rem',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    marginBottom: '4rem'
  },

  earnHeader: {
    textAlign: 'center',
    marginBottom: '3rem'
  },

  earnTitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: 'white',
    margin: '0 0 0.8rem 0',
    textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)'
  },

  earnSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.3rem',
    margin: 0,
    fontWeight: 400
  },

  earnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2.5rem'
  },

  earnMethod: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '2.5rem',
    textAlign: 'center',
    transition: 'all 0.4s ease',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    color: '#1e293b'
  },

  earnMethodIcon: {
    fontSize: '3rem',
    marginBottom: '1.5rem',
    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'
  },

  earnMethodContent: {},

  earnMethodTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: '0 0 0.8rem 0'
  },

  earnMethodDesc: {
    color: '#64748b',
    fontSize: '1rem',
    margin: '0 0 1.5rem 0',
    lineHeight: 1.6
  },

  earnMethodReward: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '0.6rem 1.5rem',
    borderRadius: '50px',
    fontWeight: 800,
    fontSize: '1rem',
    display: 'inline-block',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },

  // Loading States with Deep Blue Background
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a1628 0%, #1e3a8a 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  },

  loadingSpinner: {
    width: '100px',
    height: '100px',
    border: '6px solid rgba(96, 165, 250, 0.2)',
    borderTop: '6px solid #60a5fa',
    borderRadius: '50%',
    animation: 'spin 1.5s linear infinite',
    marginBottom: '3rem',
    boxShadow: '0 0 30px rgba(96, 165, 250, 0.8)'
  },

  loadingText: {
    position: 'relative',
    zIndex: 2
  },

  loadingTitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: 'white',
    marginBottom: '1rem',
    textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)'
  },

  loadingSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.3rem',
    fontWeight: 300
  },

  // Error States with Deep Blue Background
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a1628 0%, #1e3a8a 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%)',
    textAlign: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden'
  },

  errorIcon: {
    fontSize: '5rem',
    marginBottom: '2rem',
    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))'
  },

  errorTitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: 'white',
    marginBottom: '1rem',
    textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)'
  },

  errorMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.3rem',
    marginBottom: '2.5rem',
    lineHeight: 1.6
  },

  retryButton: {
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    padding: '1.2rem 2.5rem',
    borderRadius: '16px',
    fontWeight: 700,
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  }
};

// 🌟 ADVANCED CSS ANIMATIONS FOR FLOATING ICONS
const globalStyles = `
  @keyframes floatUp {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg) scale(1);
      opacity: 0.6;
    }
    50% { 
      transform: translateY(-30px) rotate(5deg) scale(1.1);
      opacity: 0.8;
    }
  }

  @keyframes floatDown {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg) scale(1);
      opacity: 0.6;
    }
    50% { 
      transform: translateY(25px) rotate(-3deg) scale(0.9);
      opacity: 0.4;
    }
  }

  @keyframes floatLeft {
    0%, 100% { 
      transform: translateX(0px) translateY(0px) rotate(0deg);
      opacity: 0.6;
    }
    33% { 
      transform: translateX(-20px) translateY(-10px) rotate(2deg);
      opacity: 0.8;
    }
    66% { 
      transform: translateX(15px) translateY(15px) rotate(-2deg);
      opacity: 0.5;
    }
  }

  @keyframes floatRight {
    0%, 100% { 
      transform: translateX(0px) translateY(0px) rotate(0deg);
      opacity: 0.6;
    }
    33% { 
      transform: translateX(25px) translateY(-15px) rotate(-3deg);
      opacity: 0.8;
    }
    66% { 
      transform: translateX(-10px) translateY(20px) rotate(1deg);
      opacity: 0.4;
    }
  }

  @keyframes floatDiagonal {
    0%, 100% { 
      transform: translate(0px, 0px) rotate(0deg) scale(1);
      opacity: 0.6;
    }
    25% { 
      transform: translate(20px, -20px) rotate(5deg) scale(1.1);
      opacity: 0.8;
    }
    50% { 
      transform: translate(-15px, 10px) rotate(-3deg) scale(0.9);
      opacity: 0.5;
    }
    75% { 
      transform: translate(10px, 25px) rotate(2deg) scale(1.05);
      opacity: 0.7;
    }
  }

  @keyframes floatCircle {
    0% { 
      transform: rotate(0deg) translateX(30px) rotate(0deg);
      opacity: 0.6;
    }
    25% { 
      transform: rotate(90deg) translateX(30px) rotate(-90deg);
      opacity: 0.8;
    }
    50% { 
      transform: rotate(180deg) translateX(30px) rotate(-180deg);
      opacity: 0.4;
    }
    75% { 
      transform: rotate(270deg) translateX(30px) rotate(-270deg);
      opacity: 0.7;
    }
    100% { 
      transform: rotate(360deg) translateX(30px) rotate(-360deg);
      opacity: 0.6;
    }
  }

  @keyframes floatWave {
    0%, 100% { 
      transform: translateY(0px) translateX(0px);
      opacity: 0.6;
    }
    25% { 
      transform: translateY(-20px) translateX(10px);
      opacity: 0.8;
    }
    50% { 
      transform: translateY(15px) translateX(-15px);
      opacity: 0.4;
    }
    75% { 
      transform: translateY(-10px) translateX(20px);
      opacity: 0.7;
    }
  }

  @keyframes floatSpin {
    0%, 100% { 
      transform: rotate(0deg) scale(1);
      opacity: 0.6;
    }
    33% { 
      transform: rotate(120deg) scale(1.1);
      opacity: 0.8;
    }
    66% { 
      transform: rotate(240deg) scale(0.9);
      opacity: 0.5;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.95);
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
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
    }
    50% { 
      opacity: 0.6; 
      transform: scale(1.3);
      box-shadow: 0 0 20px rgba(16, 185, 129, 1);
    }
  }

  /* Hover Effects */
  .reward-card:hover {
    transform: translateY(-20px) scale(1.02);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  }

  .reward-card:hover .card-image {
    transform: scale(1.08);
  }

  .reward-card:hover .card-image-overlay {
    opacity: 1;
  }

  .wallet-card:hover {
    transform: translateY(-12px) scale(1.05);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  }

  .wallet-card:hover .wallet-card-glow {
    opacity: 1;
  }

  .earn-method:hover {
    transform: translateY(-8px) scale(1.03);
    border-color: rgba(96, 165, 250, 0.8);
    box-shadow: 0 20px 50px rgba(59, 130, 246, 0.3);
  }

  .redeem-button:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6);
  }

  .filter-select:focus {
    border-color: rgba(96, 165, 250, 0.8);
    box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
  }

  .reset-button:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6);
  }

  .retry-button:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 3rem !important;
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
      font-size: 2.5rem !important;
    }
  }

  @media (max-width: 480px) {
    .hero-title {
      font-size: 2.5rem !important;
    }
    
    .floating-icon {
      font-size: 2rem !important;
    }
  }
`;

// Inject global styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('rewards-page-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'rewards-page-styles';
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}

export default RewardsPage;
