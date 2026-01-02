import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Badge,
  Container,
  LinearProgress,
  Divider,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import {
  PersonOutline,
  VolunteerActivism,
  EmojiEvents,
  Groups,
  Star,
  Leaderboard as LeaderboardIcon,
  Home,
  ExitToApp,
  CardGiftcard, // Added for rewards
  Redeem, // Added for redemptions
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserStats, useLeaderboard } from '../../hooks/useUserStats';
import { useNavigate, useLocation } from 'react-router-dom';

/* ════════════════════════════════════════════════
   Header
════════════════════════════════════════════════ */
function Header() {
  /* ─────────── context & hooks ─────────── */
  const { user, isAuthenticated, logout } = useAuth();
  const { userStats, loading: statsLoading } = useUserStats();
  const { leaderboard } = useLeaderboard('all', 10);
  const navigate = useNavigate();
  const location = useLocation();

  /* ─────────── menu state ─────────── */
  const [anchorEl, setAnchorEl] = useState(null);

  /* ─────────── user-centric data ─────────── */
  const rank = leaderboard.findIndex((l) => l.userId === (user?.id || user?._id)) + 1;

  /* ─────────── enhanced navigation helpers ─────────── */
  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`); // Debug log
    navigate(path);
    setAnchorEl(null); // Close menu if open
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    window.location.href = '/home';
  };

  // Fixed level info with dark background colors and progress data
  const levelInfo = (() => {
    const p = userStats.totalPoints || 0;  // Points from backend
    
    if (p < 100) return { 
      level: 'Beginner', 
      color: '#8b5cf6',         // Purple (Violet 500)
      bgColor: '#2e1065',       // Dark purple background
      current: p,
      next: 100,
      progress: p
    };
    if (p < 500) return {
      level: 'Helper',
      color: '#1976d2',         // Blue 
      bgColor: '#0d47a1',       // Dark blue background
      current: p - 100,
      next: 400,
      progress: ((p - 100) / 400) * 100
    };
    if (p < 1500) return {
      level: 'Expert',
      color: '#2196f3',         // Light Blue
      bgColor: '#01579b',       // Dark blue background
      current: p - 500,
      next: 1000,
      progress: ((p - 500) / 1000) * 100
    };
    if (p < 3000) return {
      level: 'Master',
      color: '#4caf50',         // Green
      bgColor: '#1b5e20',       // Dark green background
      current: p - 1500,
      next: 1500,
      progress: ((p - 1500) / 1500) * 100
    };
    return { 
      level: 'Legend',
      color: '#ff9800',         // Orange
      bgColor: '#e65100',       // Dark orange background
      current: p - 3000,
      next: 0,
      progress: 100
    };
  })();

  /* ─────────── render ─────────── */
  return (
    <Box
      sx={{
        bgcolor: 'linear-gradient(135deg,#fff 0%,#f8fafc 100%)',
        borderBottom: '1px solid rgba(25,118,210,.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxShadow: '0 2px 20px rgba(25,118,210,.04)',
      }}
    >
      <Container maxWidth="xl">
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Toolbar sx={{ py: 2, px: 0, justifyContent: 'space-between' }}>
            {/* ───── Logo ───── */}
            <Box
              display="flex"
              alignItems="center"
              sx={{
                cursor: 'pointer',
                transition: '.3s',
                '&:hover': { transform: 'translateY(-2px)', '& .logo-text': { color: '#1976d2' } },
              }}
              onClick={() => handleNavigation('/home')}
            >
              <Typography
                className="logo-text"
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.8rem',
                  color: '#1e293b',
                  letterSpacing: '-.025em',
                  fontFamily: '"Inter","Roboto",sans-serif',
                }}
              >
                Help<span style={{ color: '#1976d2' }}>Hub</span>
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* ───── Navigation (auth only) ───── */}
            {isAuthenticated && (
              <NavButtons isActive={isActive} handleNavigation={handleNavigation} />
            )}

            {/* ───── Right side ───── */}
            <UserSection
              user={user}
              userStats={userStats}
              levelInfo={levelInfo}
              rank={rank}
              statsLoading={statsLoading}
              handleNavigation={handleNavigation}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
              logout={handleLogout}
            />
          </Toolbar>
        </AppBar>
      </Container>
    </Box>
  );
}

function NavButtons({ isActive, handleNavigation }) {
  const common = {
    borderRadius: '12px',
    px: 3,
    py: 1.5,
    fontSize: '.875rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all .2s ease',
    minHeight: '44px',
  };

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        gap: 1,
        alignItems: 'center',
        bgcolor: '#fff',
        borderRadius: '16px',
        p: '8px 12px',
        boxShadow: '0 4px 20px rgba(25,118,210,.08)',
        border: '1px solid rgba(25,118,210,.06)',
        mr: 2,
      }}
    >
      {/* Help Requests */}
      <Button
        color="inherit"
        onClick={() => handleNavigation('/dashboard')}
        startIcon={<Groups sx={{ fontSize: 20 }} />}
        sx={{
          ...common,
          ...(isActive('/dashboard') ? {
            color: '#fff !important',
            bgcolor: '#1976d2 !important',
            boxShadow: '0 2px 8px rgba(25,118,210,.3)',
            '& .MuiSvgIcon-root': {
              color: '#fff !important',
            },
          } : {
            color: '#64748b',
            bgcolor: 'transparent',
            '& .MuiSvgIcon-root': {
              color: '#1976d2',
            },
          }),
          '&:hover': {
            bgcolor: isActive('/dashboard') ? '#1565c0 !important' : '#e3f2fd !important',
            color: isActive('/dashboard') ? '#fff !important' : '#1976d2 !important',
            transform: 'translateY(-1px)',
            '& .MuiSvgIcon-root': {
              color: isActive('/dashboard') ? '#fff !important' : '#1976d2 !important',
            },
          },
        }}
      >
        Help Requests
      </Button>

      {/* 🎁 NEW: Rewards Store */}
      <Button
        color="inherit"
        onClick={() => handleNavigation('/rewards')}
        startIcon={<CardGiftcard sx={{ fontSize: 20 }} />}
        sx={{
          ...common,
          ...(isActive('/rewards') ? {
            color: '#fff !important',
            bgcolor: '#9c27b0 !important',
            boxShadow: '0 2px 8px rgba(156,39,176,.3)',
            '& .MuiSvgIcon-root': {
              color: '#fff !important',
            },
          } : {
            color: '#64748b',
            bgcolor: 'transparent',
            '& .MuiSvgIcon-root': {
              color: '#9c27b0',
            },
          }),
          '&:hover': {
            bgcolor: isActive('/rewards') ? '#7b1fa2 !important' : '#f3e5f5 !important',
            color: isActive('/rewards') ? '#fff !important' : '#7b1fa2 !important',
            transform: 'translateY(-1px)',
            '& .MuiSvgIcon-root': {
              color: isActive('/rewards') ? '#fff !important' : '#7b1fa2 !important',
            },
          },
        }}
      >
        Rewards
      </Button>

      {/* Leaderboard */}
      <Button
        color="inherit"
        onClick={() => handleNavigation('/leaderboard')}
        startIcon={<LeaderboardIcon sx={{ fontSize: 20 }} />}
        sx={{
          ...common,
          ...(isActive('/leaderboard') ? {
            color: '#fff !important',
            bgcolor: '#2196f3 !important',
            boxShadow: '0 2px 8px rgba(33,150,243,.3)',
            '& .MuiSvgIcon-root': {
              color: '#fff !important',
            },
          } : {
            color: '#64748b',
            bgcolor: 'transparent',
            '& .MuiSvgIcon-root': {
              color: '#2196f3',
            },
          }),
          '&:hover': {
            bgcolor: isActive('/leaderboard') ? '#1976d2 !important' : '#e1f5fe !important',
            color: isActive('/leaderboard') ? '#fff !important' : '#0d47a1 !important',
            transform: 'translateY(-1px)',
            '& .MuiSvgIcon-root': {
              color: isActive('/leaderboard') ? '#fff !important' : '#0d47a1 !important',
            },
          },
        }}
      >
        Leaderboard
      </Button>

      {/* Donate */}
      <Button
        color="inherit"
        onClick={() => handleNavigation('/donate')}
        startIcon={<VolunteerActivism sx={{ fontSize: 20 }} />}
        sx={{
          ...common,
          ...(isActive('/donate') ? {
            color: '#fff !important',
            bgcolor: '#10b981 !important',
            boxShadow: '0 2px 8px rgba(16,185,129,.3)',
            '& .MuiSvgIcon-root': {
              color: '#fff !important',
            },
          } : {
            color: '#64748b',
            bgcolor: 'transparent',
            '& .MuiSvgIcon-root': {
              color: '#10b981',
            },
          }),
          '&:hover': {
            bgcolor: isActive('/donate') ? '#059669 !important' : '#d1fae5 !important',
            color: isActive('/donate') ? '#fff !important' : '#059669 !important',
            transform: 'translateY(-1px)',
            '& .MuiSvgIcon-root': {
              color: isActive('/donate') ? '#fff !important' : '#059669 !important',
            },
          },
        }}
      >
        Donate
      </Button>

      {/* Hall of Fame */}
      <Button
        color="inherit"
        onClick={() => handleNavigation('/hall-of-fame')}
        startIcon={<EmojiEvents sx={{ fontSize: 20 }} />}
        sx={{
          ...common,
          ...(isActive('/hall-of-fame') ? {
            color: '#fff !important',
            bgcolor: '#f59e0b !important',
            boxShadow: '0 2px 8px rgba(245,158,11,.3)',
            '& .MuiSvgIcon-root': {
              color: '#fff !important',
            },
          } : {
            color: '#64748b',
            bgcolor: 'transparent',
            '& .MuiSvgIcon-root': {
              color: '#f59e0b',
            },
          }),
          '&:hover': {
            bgcolor: isActive('/hall-of-fame') ? '#d97706 !important' : '#fef3c7 !important',
            color: isActive('/hall-of-fame') ? '#fff !important' : '#d97706 !important',
            transform: 'translateY(-1px)',
            '& .MuiSvgIcon-root': {
              color: isActive('/hall-of-fame') ? '#fff !important' : '#d97706 !important',
            },
          },
        }}
      >
        Hall of Fame
      </Button>
    </Box>
  );
}

function UserSection({
  user,
  userStats,
  levelInfo,
  rank,
  statsLoading,
  handleNavigation,
  anchorEl,
  setAnchorEl,
  logout,
}) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      {/* points pill - FIXED COLORS */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 1,
          backgroundColor: levelInfo.bgColor, // Use dark background
          borderRadius: '20px',
          px: 3,
          py: 1.5,
          boxShadow: `0 4px 15px ${levelInfo.color}40`,
          border: '2px solid rgba(255,255,255,.2)',
        }}
      >
        <Star sx={{ color: '#fff', fontSize: 20 }} />
        {statsLoading ? (
          <Skeleton variant="text" width={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        ) : (
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
            {userStats.totalPoints || 0}
          </Typography>
        )}
        <Chip
          label={levelInfo.level}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,.2)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '.7rem',
          }}
        />
      </Box>

      {/* create request */}
      <Button
        variant="contained"
        startIcon={<VolunteerActivism />}
        onClick={() => handleNavigation('/create-request')}
        sx={{
          borderRadius: '25px',
          px: 4,
          py: 1.5,
          bgcolor: 'linear-gradient(135deg,#1976d2 0%,#2196f3 100%)',
          fontWeight: 700,
          '&:hover': {
            bgcolor: 'linear-gradient(135deg,#1565c0 0%,#0d47a1 100%)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        Request Help →
      </Button>

      {/* avatar - FIXED BADGE */}
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
        <Badge
          badgeContent={userStats.requestsCompleted || 0}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: levelInfo.color, // Use backgroundColor
              color: '#fff',
              fontSize: '.7rem',
              fontWeight: 600,
              border: '2px solid #fff',
            },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '22px',
              backgroundColor: levelInfo.bgColor, // Use dark background
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${levelInfo.color}30`,
            }}
          >
            <PersonOutline sx={{ color: levelInfo.color }} />
          </Box>
        </Badge>
      </IconButton>

      {/* dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            minWidth: 320,
            mt: 1,
            border: '1px solid rgba(25,118,210,.06)',
            boxShadow: '0 20px 40px rgba(25,118,210,.15)',
          },
        }}
      >
        {/* user card */}
        <Box sx={{ px: 3, py: 3, borderBottom: '1px solid #e3ebf6' }}>
          <Box display="flex" gap={2} mb={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '25px',
                backgroundColor: levelInfo.bgColor, // Use dark background
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonOutline sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box flex={1}>
              <Typography fontWeight={700}>{user?.name || 'Helper'}</Typography>
              <Typography variant="body2" color="#64748b">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          {/* points */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Box display="flex" gap={1} alignItems="center">
                <Star sx={{ color: '#f59e0b', fontSize: 20 }} />
                {statsLoading ? (
                  <Skeleton variant="text" width={60} />
                ) : (
                  <Typography fontWeight="bold">{userStats.totalPoints || 0}</Typography>
                )}
              </Box>
              <Chip
                label={levelInfo.level}
                size="small"
                sx={{ bgcolor: levelInfo.color, color: '#fff', fontWeight: 'bold' }}
              />
            </Box>
            {levelInfo.next > 0 && (
              <>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="#64748b">
                    Progress to{' '}
                    {levelInfo.level === 'Beginner'
                      ? 'Helper'
                      : levelInfo.level === 'Helper'
                      ? 'Expert'
                      : levelInfo.level === 'Expert'
                      ? 'Master'
                      : 'Legend'}
                  </Typography>
                  <Typography variant="caption" color="#64748b">
                    {levelInfo.current}/{levelInfo.next}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={levelInfo.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    mt: 0.5,
                    bgcolor: `${levelInfo.color}20`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: levelInfo.color,
                    },
                  }}
                />
              </>
            )}
          </Box>

          {/* quick stats */}
          <Box display="grid" gridTemplateColumns="repeat(3,1fr)" gap={2}>
            {[
              { label: 'Completed', value: userStats.requestsCompleted || 0 },
              { label: 'Badges', value: userStats.badges?.length || 0 },
              { label: 'Rank', value: rank > 0 ? `#${rank}` : 'N/A' },
            ].map((i) => (
              <Box key={i.label} textAlign="center">
                {statsLoading ? (
                  <Skeleton variant="text" width={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography fontWeight="bold">{i.value}</Typography>
                )}
                <Typography variant="caption" color="#64748b">
                  {i.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* nav links inside menu */}
        <MenuItem onClick={() => handleNavigation('/dashboard')} sx={{ py: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Groups sx={{ color: '#1976d2', fontSize: 20 }} />
          </ListItemIcon>
          Browse Requests
        </MenuItem>

        {/* 🎁 NEW: Rewards Menu Items */}
        <MenuItem onClick={() => handleNavigation('/rewards')} sx={{ py: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CardGiftcard sx={{ color: '#9c27b0', fontSize: 20 }} />
          </ListItemIcon>
          <Box>
            <Typography fontWeight={600}>Rewards Store</Typography>
            <Typography variant="caption" color="#64748b">
              Redeem your coins
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem onClick={() => handleNavigation('/my-redemptions')} sx={{ py: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Redeem sx={{ color: '#9c27b0', fontSize: 20 }} />
          </ListItemIcon>
          My Redemptions
        </MenuItem>

        <MenuItem onClick={() => handleNavigation('/leaderboard')} sx={{ py: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LeaderboardIcon sx={{ color: '#2196f3', fontSize: 20 }} />
          </ListItemIcon>
          Leaderboard
        </MenuItem>

        {/* Enhanced Donate Menu Item */}
        <MenuItem
          onClick={() => handleNavigation('/donate')}
          sx={{ 
            py: 2, 
            '&:hover': { 
              bgcolor: 'rgba(16,185,129,.08)', 
              color: '#059669',
              '& .MuiListItemIcon-root': {
                color: '#059669 !important'
              }
            } 
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <VolunteerActivism sx={{ color: '#10b981', fontSize: 20 }} />
          </ListItemIcon>
          <Box>
            <Typography fontWeight={600}>Donate</Typography>
            <Typography variant="caption" color="#64748b">
              Support the community
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem onClick={() => handleNavigation('/hall-of-fame')} sx={{ py: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <EmojiEvents sx={{ color: '#f59e0b', fontSize: 20 }} />
          </ListItemIcon>
          Hall of Fame
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={logout}
          sx={{
            py: 2.5,
            color: '#dc2626',
            fontWeight: 600,
            '&:hover': { bgcolor: 'rgba(220,38,38,.08)', color: '#b91c1c' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ExitToApp sx={{ color: '#dc2626', fontSize: 20 }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Header;
