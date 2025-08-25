// src/components/layout/Header.jsx
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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useRequests } from '../requests/RequestContext';
import { useNavigate, useLocation } from 'react-router-dom';

/* ════════════════════════════════════════════════
   Header
════════════════════════════════════════════════ */
function Header() {
  /* ─────────── context & hooks ─────────── */
  const { user, isAuthenticated, logout } = useAuth();
  const { getUserStats, getLeaderboard } = useRequests();
  const navigate = useNavigate();
  const location = useLocation();

  /* ─────────── menu state ─────────── */
  const [anchorEl, setAnchorEl] = useState(null);

  /* ─────────── user-centric data ─────────── */
  const stats = getUserStats(user?.id || 'current-user-id');
  const leaderboard = getLeaderboard('all', 10);
  const rank = leaderboard.findIndex((l) => l.userId === (user?.id || 'current-user-id')) + 1;

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
    navigate('/home');
  };

  const levelInfo = (() => {
    const p = stats.totalPoints;
    if (p < 100) return { level: 'Beginner', current: p, next: 100, progress: p, color: '#64748b' };
    if (p < 500)
      return {
        level: 'Helper',
        current: p - 100,
        next: 400,
        progress: ((p - 100) / 400) * 100,
        color: '#1976d2',
      };
    if (p < 1500)
      return {
        level: 'Expert',
        current: p - 500,
        next: 1000,
        progress: ((p - 500) / 1000) * 100,
        color: '#2196f3',
      };
    return { level: 'Master', current: p - 1500, next: 0, progress: 100, color: '#10b981' };
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
            {isAuthenticated ? (
              <UserSection
                user={user}
                stats={stats}
                levelInfo={levelInfo}
                rank={rank}
                handleNavigation={handleNavigation}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                logout={handleLogout}
              />
            ) : (
              <GuestButtons handleNavigation={handleNavigation} />
            )}
          </Toolbar>
        </AppBar>
      </Container>
    </Box>
  );
}

/* ════════════════════════════════════════════════
   Sub-components
════════════════════════════════════════════════ */
function NavButtons({ isActive, handleNavigation }) {
  const common = {
    borderRadius: '12px',
    px: 3,
    py: 1.5,
    fontSize: '.875rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: '.2s',
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
        startIcon={<Groups sx={{ fontSize: 20, color: '#1976d2' }} />}
        sx={{
          ...common,
          color: isActive('/dashboard') ? '#1565c0' : '#475569',
          bgcolor: isActive('/dashboard')
            ? 'linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%)'
            : 'transparent',
          '&:hover': {
            bgcolor: 'linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%)',
            color: '#1565c0',
            transform: 'translateY(-1px)',
          },
        }}
      >
        Help Requests
      </Button>

      {/* Leaderboard */}
      <Button
        color="inherit"
        onClick={() => handleNavigation('/leaderboard')}
        startIcon={<LeaderboardIcon sx={{ fontSize: 20, color: '#2196f3' }} />}
        sx={{
          ...common,
          color: isActive('/leaderboard') ? '#0d47a1' : '#475569',
          bgcolor: isActive('/leaderboard')
            ? 'linear-gradient(135deg,#e1f5fe 0%,#b3e5fc 100%)'
            : 'transparent',
          '&:hover': {
            bgcolor: 'linear-gradient(135deg,#e1f5fe 0%,#b3e5fc 100%)',
            color: '#0d47a1',
            transform: 'translateY(-1px)',
          },
        }}
      >
        Leaderboard
      </Button>

      {/* Donate - Enhanced with active state */}
      <Button
        color="inherit"
        onClick={() => handleNavigation('/donate')}
        startIcon={<VolunteerActivism sx={{ fontSize: 20, color: '#10b981' }} />}
        sx={{
          ...common,
          color: isActive('/donate') ? '#059669' : '#475569',
          bgcolor: isActive('/donate')
            ? 'linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%)'
            : 'transparent',
          '&:hover': {
            bgcolor: 'linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%)',
            color: '#059669',
            transform: 'translateY(-1px)',
          },
        }}
      >
        Donate
      </Button>

      {/* Hall of Fame */}
      <Button
        color="inherit"
        onClick={() => handleNavigation('/hall-of-fame')}
        startIcon={<EmojiEvents sx={{ fontSize: 20, color: '#f59e0b' }} />}
        sx={{
          ...common,
          color: isActive('/hall-of-fame') ? '#d97706' : '#475569',
          bgcolor: isActive('/hall-of-fame')
            ? 'linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)'
            : 'transparent',
          '&:hover': {
            bgcolor: 'linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)',
            color: '#d97706',
            transform: 'translateY(-1px)',
          },
        }}
      >
        Hall of Fame
      </Button>
    </Box>
  );
}

function GuestButtons({ handleNavigation }) {
  return (
    <Box display="flex" gap={2}>
      <Button
        color="inherit"
        onClick={() => handleNavigation('/login')}
        sx={{
          borderRadius: '25px',
          px: 4,
          py: 1.5,
          border: '2px solid #e3ebf0',
          fontWeight: 600,
          '&:hover': {
            bgcolor: 'rgba(25,118,210,.05)',
            color: '#1976d2',
            borderColor: '#1976d2',
          },
        }}
      >
        Sign In
      </Button>

      <Button
        variant="contained"
        onClick={() => handleNavigation('/register')}
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
        Join the Community →
      </Button>
    </Box>
  );
}

function UserSection({
  user,
  stats,
  levelInfo,
  rank,
  handleNavigation,
  anchorEl,
  setAnchorEl,
  logout,
}) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      {/* points pill */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 1,
          bgcolor: 'linear-gradient(135deg,#1976d2 0%,#2196f3 100%)',
          borderRadius: '20px',
          px: 3,
          py: 1.5,
          boxShadow: '0 4px 15px rgba(25,118,210,.3)',
          border: '2px solid rgba(255,255,255,.2)',
        }}
      >
        <Star sx={{ color: '#fff', fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
          {stats.totalPoints}
        </Typography>
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

      {/* avatar */}
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
        <Badge
          badgeContent={stats.requestsCompleted || 0}
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
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
              bgcolor: 'linear-gradient(135deg,#f8fafc 0%,#e3f2fd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #e3ebf0',
            }}
          >
            <PersonOutline sx={{ color: '#475569' }} />
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
                bgcolor: 'linear-gradient(135deg,#1976d2 0%,#2196f3 100%)',
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
                <Typography fontWeight="bold">{stats.totalPoints}</Typography>
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
                      : 'Master'}
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
                    bgcolor: 'rgba(25,118,210,.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'linear-gradient(135deg,#1976d2 0%,#2196f3 100%)',
                    },
                  }}
                />
              </>
            )}
          </Box>

          {/* quick stats */}
          <Box display="grid" gridTemplateColumns="repeat(3,1fr)" gap={2}>
            {[
              { label: 'Completed', value: stats.requestsCompleted },
              { label: 'Badges', value: stats.badges?.length || 0 },
              { label: 'Rank', value: rank > 0 ? `#${rank}` : 'N/A' },
            ].map((i) => (
              <Box key={i.label} textAlign="center">
                <Typography fontWeight="bold">{i.value}</Typography>
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
