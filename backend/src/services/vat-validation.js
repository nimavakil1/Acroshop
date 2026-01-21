const axios = require("axios");
const { TransactionBaseService } = require("@medusajs/medusa");

/**
 * VAT Validation Service
 *
 * Validates EU VAT numbers against the VIES (VAT Information Exchange System)
 * Implements reverse charge logic for valid B2B transactions
 */
class VatValidationService extends TransactionBaseService {
  constructor(container) {
    super(container);
    this.logger = container.logger;
  }

  /**
   * EU country codes that support VIES validation
   */
  static EU_COUNTRIES = [
    "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES",
    "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT",
    "NL", "PL", "PT", "RO", "SE", "SI", "SK"
  ];

  /**
   * VAT rates by country (standard rates as of 2024)
   */
  static VAT_RATES = {
    BE: 21, // Belgium
    NL: 21, // Netherlands
    DE: 19, // Germany
    FR: 20, // France
    PL: 23, // Poland
    IT: 22, // Italy
    CZ: 21, // Czech Republic
    AT: 20, // Austria
    ES: 21, // Spain
    PT: 23, // Portugal
    // UK is no longer in EU - handle separately
  };

  /**
   * Validate a VAT number against VIES
   *
   * @param {string} vatNumber - Full VAT number including country code (e.g., "BE0123456789")
   * @returns {Promise<{valid: boolean, name?: string, address?: string, error?: string}>}
   */
  async validateVatNumber(vatNumber) {
    if (!vatNumber || typeof vatNumber !== "string") {
      return { valid: false, error: "VAT number is required" };
    }

    // Clean the VAT number
    const cleanVat = vatNumber.replace(/[\s.-]/g, "").toUpperCase();

    // Extract country code (first 2 characters)
    const countryCode = cleanVat.substring(0, 2);
    const vatId = cleanVat.substring(2);

    // Handle Greece (EL in VIES, GR in ISO)
    const viesCountryCode = countryCode === "GR" ? "EL" : countryCode;

    // Check if it's an EU country
    if (!VatValidationService.EU_COUNTRIES.includes(viesCountryCode)) {
      return {
        valid: false,
        error: `Country code ${countryCode} is not an EU member state`
      };
    }

    try {
      // VIES SOAP API endpoint
      const soapEnvelope = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
          <soapenv:Header/>
          <soapenv:Body>
            <urn:checkVat>
              <urn:countryCode>${viesCountryCode}</urn:countryCode>
              <urn:vatNumber>${vatId}</urn:vatNumber>
            </urn:checkVat>
          </soapenv:Body>
        </soapenv:Envelope>
      `;

      const response = await axios.post(
        "https://ec.europa.eu/taxation_customs/vies/services/checkVatService",
        soapEnvelope,
        {
          headers: {
            "Content-Type": "text/xml;charset=UTF-8",
            "SOAPAction": "",
          },
          timeout: 10000,
        }
      );

      // Parse SOAP response
      const xml = response.data;
      const validMatch = xml.match(/<valid>(\w+)<\/valid>/);
      const nameMatch = xml.match(/<name>([^<]*)<\/name>/);
      const addressMatch = xml.match(/<address>([^<]*)<\/address>/);

      const isValid = validMatch && validMatch[1].toLowerCase() === "true";

      if (isValid) {
        this.logger.info(`VAT number ${cleanVat} validated successfully`);
        return {
          valid: true,
          countryCode,
          vatNumber: cleanVat,
          name: nameMatch ? nameMatch[1].trim() : undefined,
          address: addressMatch ? addressMatch[1].trim() : undefined,
        };
      } else {
        this.logger.warn(`VAT number ${cleanVat} is invalid`);
        return {
          valid: false,
          error: "VAT number is not valid according to VIES",
        };
      }
    } catch (error) {
      this.logger.error(`VIES validation error: ${error.message}`);

      // Handle specific VIES errors
      if (error.response?.data?.includes("INVALID_INPUT")) {
        return { valid: false, error: "Invalid VAT number format" };
      }
      if (error.response?.data?.includes("SERVICE_UNAVAILABLE")) {
        return { valid: false, error: "VIES service temporarily unavailable" };
      }
      if (error.response?.data?.includes("MS_UNAVAILABLE")) {
        return { valid: false, error: "Member state service unavailable" };
      }
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return { valid: false, error: "VIES service timeout - please try again" };
      }

      return {
        valid: false,
        error: "Unable to validate VAT number - please try again later"
      };
    }
  }

  /**
   * Check if reverse charge applies
   *
   * Reverse charge applies when:
   * - Customer has valid EU VAT number
   * - Customer is in a different EU country than the seller
   * - It's a B2B transaction
   *
   * @param {string} customerVatNumber - Customer's VAT number
   * @param {string} sellerCountry - Seller's country code (default: BE for Acropaq)
   * @returns {Promise<{reverseCharge: boolean, reason?: string}>}
   */
  async checkReverseCharge(customerVatNumber, sellerCountry = "BE") {
    if (!customerVatNumber) {
      return { reverseCharge: false, reason: "No VAT number provided" };
    }

    const validation = await this.validateVatNumber(customerVatNumber);

    if (!validation.valid) {
      return {
        reverseCharge: false,
        reason: validation.error || "Invalid VAT number"
      };
    }

    const customerCountry = validation.countryCode;

    // Same country = no reverse charge, apply local VAT
    if (customerCountry === sellerCountry) {
      return {
        reverseCharge: false,
        reason: "Same country as seller - local VAT applies"
      };
    }

    // Different EU country with valid VAT = reverse charge applies
    return {
      reverseCharge: true,
      reason: `B2B sale to ${customerCountry} - reverse charge applies`,
      customerName: validation.name,
      customerAddress: validation.address,
    };
  }

  /**
   * Get applicable VAT rate for a country
   *
   * @param {string} countryCode - ISO country code
   * @param {boolean} isB2B - Whether it's a B2B transaction with valid VAT
   * @returns {number} VAT rate as percentage
   */
  getVatRate(countryCode, isB2B = false) {
    // B2B with reverse charge = 0% VAT
    if (isB2B) {
      return 0;
    }

    // Return country-specific rate or default to 21% (Belgian rate)
    return VatValidationService.VAT_RATES[countryCode] || 21;
  }
}

module.exports = VatValidationService;
