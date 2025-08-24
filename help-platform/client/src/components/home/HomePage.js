import React from 'react';
import { Box } from '@mui/material';
import HomeHeader from './Header';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CTASection from './CTASection';
import Footer from './Footer';

const HomePage = () => {
  return (
    <Box>
      <HomeHeader />
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh'
        }}
      >
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </Box>
      <Footer />
    </Box>
  );
};

export default HomePage;
