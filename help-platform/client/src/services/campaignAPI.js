const API_BASE_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5000/api';

export const campaignAPI = {
  getAllCampaigns: async () => {
    const response = await fetch(`${API_BASE_URL}/campaigns`);
    return await response.json();
  },

  getCampaignStats: async () => {
    const response = await fetch(`${API_BASE_URL}/campaigns/stats`);
    return await response.json();
  },

  getCampaign: async (campaignId) => {
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
    return await response.json();
  },

  createCampaign: async (campaignData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campaignData)
    });
    return await response.json();
  },

  // ✅ NEW: Donate to campaign
  donateToCampaign: async (campaignId, donationData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/donate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(donationData)
    });
    return await response.json();
  },

  // ✅ NEW: Get campaign donations
  getCampaignDonations: async (campaignId) => {
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/donations`);
    return await response.json();
  },

  deleteCampaign: async (campaignId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },

  updateCampaign: async (campaignId, updateData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    return await response.json();
  }
};
