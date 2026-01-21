const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

module.exports = (rootDirectory, options) => {
  const router = express.Router();

  router.use(cors());
  router.use(bodyParser.json());

  // Health check endpoint
  router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // VAT validation endpoint
  router.post("/store/vat/validate", async (req, res) => {
    const vatValidationService = req.scope.resolve("vatValidationService");

    try {
      const { vat_number } = req.body;

      if (!vat_number) {
        return res.status(400).json({
          valid: false,
          error: "VAT number is required",
        });
      }

      const result = await vatValidationService.validateVatNumber(vat_number);
      return res.json(result);
    } catch (error) {
      console.error("VAT validation error:", error);
      return res.status(500).json({
        valid: false,
        error: "Internal server error during VAT validation",
      });
    }
  });

  // Check reverse charge eligibility
  router.post("/store/vat/reverse-charge", async (req, res) => {
    const vatValidationService = req.scope.resolve("vatValidationService");

    try {
      const { vat_number, seller_country } = req.body;

      const result = await vatValidationService.checkReverseCharge(
        vat_number,
        seller_country || "BE"
      );

      return res.json(result);
    } catch (error) {
      console.error("Reverse charge check error:", error);
      return res.status(500).json({
        reverseCharge: false,
        error: "Internal server error",
      });
    }
  });

  // Extend cart with B2B fields
  router.post("/store/carts/:id/b2b-info", async (req, res) => {
    const cartService = req.scope.resolve("cartService");
    const vatValidationService = req.scope.resolve("vatValidationService");

    try {
      const { id } = req.params;
      const { company_name, vat_number } = req.body;

      // Validate VAT number if provided
      let vatValidation = null;
      let isReverseCharge = false;

      if (vat_number) {
        vatValidation = await vatValidationService.validateVatNumber(vat_number);

        if (vatValidation.valid) {
          // Check if reverse charge applies
          const cart = await cartService.retrieve(id, {
            relations: ["shipping_address"],
          });

          const shippingCountry = cart.shipping_address?.country_code?.toUpperCase();
          if (shippingCountry) {
            const reverseChargeResult = await vatValidationService.checkReverseCharge(
              vat_number,
              "BE" // Acropaq is based in Belgium
            );
            isReverseCharge = reverseChargeResult.reverseCharge;
          }
        }
      }

      // Update cart metadata with B2B info
      const updatedCart = await cartService.update(id, {
        metadata: {
          company_name: company_name || null,
          vat_number: vat_number || null,
          vat_valid: vatValidation?.valid || false,
          vat_company_name: vatValidation?.name || null,
          vat_company_address: vatValidation?.address || null,
          is_reverse_charge: isReverseCharge,
          is_b2b: !!(company_name || vat_number),
        },
      });

      return res.json({
        cart: updatedCart,
        vat_validation: vatValidation,
        is_reverse_charge: isReverseCharge,
      });
    } catch (error) {
      console.error("B2B info update error:", error);
      return res.status(500).json({
        error: "Failed to update B2B information",
      });
    }
  });

  // Get cart B2B info
  router.get("/store/carts/:id/b2b-info", async (req, res) => {
    const cartService = req.scope.resolve("cartService");

    try {
      const { id } = req.params;
      const cart = await cartService.retrieve(id);

      return res.json({
        company_name: cart.metadata?.company_name || null,
        vat_number: cart.metadata?.vat_number || null,
        vat_valid: cart.metadata?.vat_valid || false,
        vat_company_name: cart.metadata?.vat_company_name || null,
        is_reverse_charge: cart.metadata?.is_reverse_charge || false,
        is_b2b: cart.metadata?.is_b2b || false,
      });
    } catch (error) {
      console.error("Get B2B info error:", error);
      return res.status(500).json({
        error: "Failed to retrieve B2B information",
      });
    }
  });

  return router;
};
