const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const paymentService = {
  async createCheckoutSession(priceId: string, token: string) {
    const res = await fetch(`${API_URL}/payment/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priceId }),
    });
    return res.json();
  },
};
