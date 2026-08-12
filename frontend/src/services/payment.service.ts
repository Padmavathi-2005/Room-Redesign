const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const paymentService = {
  /**
   * Request Stripe checkout session URL
   */
  async createCheckoutSession(plan: string, billingCycle: 'monthly' | 'annual', token: string) {
    const res = await fetch(`${API_URL}/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan, billingCycle }),
    });
    return res.json();
  },

  /**
   * Request Stripe billing portal URL
   */
  async createPortalSession(token: string) {
    const res = await fetch(`${API_URL}/payments/portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  },

  /**
   * Mock sandbox plan activation helper
   */
  async mockUpgrade(plan: string, token: string) {
    const res = await fetch(`${API_URL}/payments/mock-activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan }),
    });
    return res.json();
  },
};
