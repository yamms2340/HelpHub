import React, { useState, useEffect } from 'react';

const NotificationCard = ({ type, title, message, details, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Auto-close after timeout
  useEffect(() => {
    const timeout = type === 'success' ? 5000 : 8000;
    const timer = setTimeout(() => {
      if (!isExiting) handleClose();
    }, timeout);

    return () => clearTimeout(timer);
  }, [type, isExiting]);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20000,
      padding: '1rem',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
      visibility: isVisible || !isExiting ? 'visible' : 'hidden'
    },

    card: {
      background: 'white',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 25px 50px rgba(59, 130, 246, 0.25), 0 10px 25px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(59, 130, 246, 0.1)',
      overflow: 'hidden',
      transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      position: 'relative'
    },

    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      width: '32px',
      height: '32px',
      border: 'none',
      background: 'rgba(107, 114, 128, 0.1)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#6b7280',
      fontSize: '18px',
      fontWeight: 'bold',
      zIndex: 10
    },

    closeButtonHover: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      transform: 'scale(1.1)'
    },

    header: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '2rem 2rem 1rem 2rem',
      paddingRight: '4rem' // Space for close button
    },

    iconContainer: {
      flexShrink: 0,
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: type === 'success' 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: type === 'success'
        ? '0 4px 12px rgba(16, 185, 129, 0.3)'
        : '0 4px 12px rgba(239, 68, 68, 0.3)'
    },

    content: {
      flex: 1
    },

    title: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#1e293b',
      margin: '0 0 0.5rem 0',
      lineHeight: 1.3
    },

    message: {
      fontSize: '1rem',
      color: '#64748b',
      margin: 0,
      lineHeight: 1.6
    },

    body: {
      padding: '0 2rem'
    },

    details: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '1px solid rgba(59, 130, 246, 0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      margin: '1.5rem 0'
    },

    detailsTitle: {
      fontSize: '1rem',
      fontWeight: 700,
      color: '#374151',
      margin: '0 0 1rem 0'
    },

    detailItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
    },

    detailItemLast: {
      borderBottom: 'none'
    },

    detailLabel: {
      fontSize: '0.9rem',
      color: '#64748b',
      fontWeight: 600
    },

    detailValue: {
      fontSize: '0.9rem',
      color: '#1e293b',
      fontWeight: 700
    },

    detailValueCode: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      color: '#1d4ed8',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: '0.85rem',
      letterSpacing: '0.5px',
      fontWeight: 700,
      border: '1px solid rgba(59, 130, 246, 0.2)'
    },

    footer: {
      padding: '1rem 2rem 2rem 2rem',
      display: 'flex',
      justifyContent: 'flex-end'
    },

    actionButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 2rem',
      borderRadius: '12px',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },

    actionButtonHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)'
    },

    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '4px',
      background: type === 'success'
        ? 'linear-gradient(90deg, #10b981, #059669)'
        : 'linear-gradient(90deg, #ef4444, #dc2626)',
      borderRadius: '0 0 24px 24px',
      animation: `shrink ${type === 'success' ? 5 : 8}s linear forwards`,
      transformOrigin: 'left'
    }
  };

  // Success Icon SVG
  const SuccessIcon = () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );

  // Error Icon SVG
  const ErrorIcon = () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
    </svg>
  );

  const formatDetailLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <>
      {/* Inject keyframes for progress bar animation */}
      <style>
        {`
          @keyframes shrink {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
          
          .notification-close-btn:hover {
            background: rgba(239, 68, 68, 0.1) !important;
            color: #ef4444 !important;
            transform: scale(1.1) !important;
          }
          
          .notification-action-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
          }
          
          @media (max-width: 768px) {
            .notification-card {
              margin: 0.5rem !important;
              max-width: calc(100vw - 1rem) !important;
            }
            
            .notification-header {
              padding: 1.5rem 1.5rem 1rem 1.5rem !important;
              padding-right: 3.5rem !important;
            }
            
            .notification-body {
              padding: 0 1.5rem !important;
            }
            
            .notification-footer {
              padding: 1rem 1.5rem 1.5rem 1.5rem !important;
            }
          }
        `}
      </style>

      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div className="notification-card" style={styles.card}>
          <button 
            className="notification-close-btn"
            style={styles.closeButton}
            onClick={handleClose}
            aria-label="Close notification"
          >
            ×
          </button>

          <div className="notification-header" style={styles.header}>
            <div style={styles.iconContainer}>
              {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
            </div>
            
            <div style={styles.content}>
              <h3 style={styles.title}>{title}</h3>
              <p style={styles.message}>{message}</p>
            </div>
          </div>

          <div className="notification-body" style={styles.body}>
            {details && (
              <div style={styles.details}>
                <h4 style={styles.detailsTitle}>Details</h4>
                {Object.entries(details).map(([key, value], index, array) => (
                  <div 
                    key={key} 
                    style={{
                      ...styles.detailItem,
                      ...(index === array.length - 1 ? styles.detailItemLast : {})
                    }}
                  >
                    <span style={styles.detailLabel}>{formatDetailLabel(key)}:</span>
                    <span 
                      style={key === 'redemptionCode' 
                        ? styles.detailValueCode 
                        : styles.detailValue
                      }
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="notification-footer" style={styles.footer}>
            <button 
              className="notification-action-btn"
              style={styles.actionButton}
              onClick={handleClose}
            >
              <span>✓</span>
              Got it!
            </button>
          </div>

          {/* Progress bar for auto-close */}
          <div style={styles.progressBar}></div>
        </div>
      </div>
    </>
  );
};

export default NotificationCard;
