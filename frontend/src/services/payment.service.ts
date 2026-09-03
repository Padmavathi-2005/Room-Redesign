const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const paymentService = {
  /**
   * Request Stripe checkout session URL
   */
  async createCheckoutSession(plan: string, billingCycle: 'monthly' | 'annual', token: string) {
    const res = await fetch(`${API_URL}/subscription/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planCode: plan, billingCycle }),
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
};
