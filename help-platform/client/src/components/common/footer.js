import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  Email,
  Phone,
  LocationOn,
  Favorite,
  Send,
  Help,
  Security,
  Description,
  Group,
  EmojiEvents,
  VolunteerActivism,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const quickLinks = [
    { label: 'Help Requests', path: '/', icon: Group },
    { label: 'Hall of Fame', path: '/hall-of-fame', icon: EmojiEvents },
    { label: 'Create Request', path: '/create-request', icon: VolunteerActivism },
    { label: 'About Us', path: '/about', icon: Help },
  ];

  const supportLinks = [
    { label: 'Help Center', path: '/help' },
    { label: 'Contact Support', path: '/support' },
    { label: 'Community Guidelines', path: '/guidelines' },
    { label: 'Safety Tips', path: '/safety' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'Accessibility', path: '/accessibility' },
  ];

  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com/helphub', label: 'Facebook' },
    { icon: Twitter, url: 'https://twitter.com/helphub', label: 'Twitter' },
    { icon: LinkedIn, url: 'https://linkedin.com/company/helphub', label: 'LinkedIn' },
    { icon: Instagram, url: 'https://instagram.com/helphub', label: 'Instagram' },
    { icon: GitHub, url: 'https://github.com/helphub', label: 'GitHub' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
        color: 'white',
        mt: 8,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Newsletter Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          py: 4,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  mb: 1,
                  color: 'white',
                }}
              >
                Stay Connected with HelpHub
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                }}
              >
                Get updates on new help requests and community stories
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                component="form"
                onSubmit={handleNewsletterSubmit}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  p: 1,
                }}
              >
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      fontFamily: 'Inter, sans-serif',
                      px: 2,
                      py: 1,
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<Send />}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                    borderRadius: '8px',
                    px: 3,
                    py: 1.5,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0c2461 100%)',
                    }
                  }}
                >
                  Subscribe
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Footer Content */}
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Favorite sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 800,
                    color: 'white',
                  }}
                >
                  Help<span style={{ color: '#64b5f6' }}>Hub</span>
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                Connecting communities through compassion. HelpHub makes it easy to find help when you need it and offer help when you can.
              </Typography>
              
              {/* Social Media Icons */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    color: 'white',
                    mb: 2,
                  }}
                >
                  Follow Us
                </Typography>
                <Box display="flex" gap={1}>
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <IconButton
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          width: 40,
                          height: 40,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            transform: 'translateY(-2px)',
                          }
                        }}
                      >
                        <IconComponent fontSize="small" />
                      </IconButton>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: 'white',
                mb: 3,
              }}
            >
              Quick Links
            </Typography>
            <List sx={{ p: 0 }}>
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(4px)',
                      }
                    }}
                    onClick={() => handleNavigation(link.path)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <IconComponent sx={{ color: '#64b5f6', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        fontFamily: 'Inter, sans-serif',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: 'white',
                mb: 3,
              }}
            >
              Support
            </Typography>
            <List sx={{ p: 0 }}>
              {supportLinks.map((link, index) => (
                <ListItem
                  key={index}
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation(link.path)}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Contact & Legal */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: 'white',
                mb: 3,
              }}
            >
              Contact & Legal
            </Typography>
            
            {/* Contact Info */}
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Email sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                  }}
                >
                  support@helphub.com
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Phone sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                  }}
                >
                  1-800-HELP-HUB
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={3}>
                <LocationOn sx={{ color: '#64b5f6', fontSize: 18, mr: 2 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                  }}
                >
                  San Francisco, CA
                </Typography>
              </Box>
            </Box>

            {/* Legal Links */}
            <List sx={{ p: 0 }}>
              {legalLinks.map((link, index) => (
                <ListItem
                  key={index}
                  disablePadding
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                  onClick={() => handleNavigation(link.path)}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontFamily: 'Inter, sans-serif',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Bar */}
      <Box
        sx={{
          background: 'rgba(0, 0, 0, 0.2)',
          py: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                © 2025 HelpHub. All rights reserved. Built with ❤️ for communities worldwide.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-end' }}
                mt={{ xs: 2, md: 0 }}
              >
                <Security sx={{ color: '#64b5f6', fontSize: 16, mr: 1 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.8rem',
                  }}
                >
                  Trusted • Secure • Community-Driven
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Footer;
