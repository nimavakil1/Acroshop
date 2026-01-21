import Medusa from "@medusajs/medusa-js";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

// Medusa client instance
export const medusaClient = new Medusa({
  baseUrl: BACKEND_URL,
  maxRetries: 3,
});

// Custom API calls for VAT validation
export const vatApi = {
  /**
   * Validate a VAT number against VIES
   */
  async validate(vatNumber: string): Promise<{
    valid: boolean;
    name?: string;
    address?: string;
    error?: string;
  }> {
    const response = await fetch(`${BACKEND_URL}/store/vat/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vat_number: vatNumber }),
    });
    return response.json();
  },

  /**
   * Check if reverse charge applies
   */
  async checkReverseCharge(vatNumber: string): Promise<{
    reverseCharge: boolean;
    reason?: string;
    customerName?: string;
  }> {
    const response = await fetch(`${BACKEND_URL}/store/vat/reverse-charge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vat_number: vatNumber }),
    });
    return response.json();
  },

  /**
   * Update cart with B2B information
   */
  async updateCartB2B(
    cartId: string,
    data: { company_name?: string; vat_number?: string }
  ): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/store/carts/${cartId}/b2b-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Get cart B2B information
   */
  async getCartB2B(cartId: string): Promise<{
    company_name: string | null;
    vat_number: string | null;
    vat_valid: boolean;
    is_reverse_charge: boolean;
    is_b2b: boolean;
  }> {
    const response = await fetch(`${BACKEND_URL}/store/carts/${cartId}/b2b-info`);
    return response.json();
  },
};

// Helper functions
export const formatPrice = (amount: number, currency: string = "EUR"): string => {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const getProductThumbnail = (product: any): string => {
  return product?.thumbnail || product?.images?.[0]?.url || "/placeholder-product.png";
};

export default medusaClient;
